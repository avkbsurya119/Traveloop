import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus, Trash2, GripVertical, Save, Upload, AlertTriangle,
  Sun, Sunset, Moon, Plane, ChevronLeft, DollarSign, Clock,
  Globe, Loader2, ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { activitiesApi } from '../api/activities'
import { placesApi } from '../api/places'
import { format } from 'date-fns'

const SECTION_TYPES = [
  { value: 'morning',   label: 'Morning',        icon: Sun,    color: 'text-amber-400',  bg: 'bg-amber-400/15',  border: 'border-amber-400/30' },
  { value: 'afternoon', label: 'Afternoon',       icon: Sunset, color: 'text-orange-400', bg: 'bg-orange-400/15', border: 'border-orange-400/30' },
  { value: 'evening',   label: 'Evening',         icon: Moon,   color: 'text-indigo-400', bg: 'bg-indigo-400/15', border: 'border-indigo-400/30' },
  { value: 'transit',   label: 'Transit / Flight', icon: Plane,  color: 'text-sky-400',   bg: 'bg-sky-400/15',    border: 'border-sky-400/30' },
]

export default function BuildItinerary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTrip: trip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeStopIdx, setActiveStopIdx] = useState(0)
  const [dragIdx, setDragIdx] = useState(null)
  const [wikiPlaces, setWikiPlaces] = useState([])
  const [wikiLoading, setWikiLoading] = useState(false)
  const [showDiscover, setShowDiscover] = useState(false)
  const csvRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getItinerary(id)
      setItems(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  useEffect(() => {
    const stop = trip?.stops?.[activeStopIdx]
    if (stop?.cityId) {
      activitiesApi.getAll({ city_id: stop.cityId, limit: 20 })
        .then(res => setActivities(res.data)).catch(() => {})
    }
    // Reset discover panel when stop changes
    setShowDiscover(false)
    setWikiPlaces([])
  }, [trip, activeStopIdx])

  const discoverPlaces = async () => {
    const stop = trip?.stops?.[activeStopIdx]
    const lat = stop?.city?.latitude
    const lon = stop?.city?.longitude
    const cityName = stop?.city?.name
    if (!lat || !lon) {
      toast.error('No coordinates for this city')
      return
    }
    setShowDiscover(true)
    setWikiLoading(true)
    try {
      const { data } = await placesApi.getAttractions(lat, lon, cityName)
      setWikiPlaces(data || [])
    } catch {
      toast.error('Could not load attractions')
    } finally {
      setWikiLoading(false)
    }
  }

  const quickAddWiki = (place) => {
    if (!activeStop) return
    setItems(prev => [...prev, {
      id: `temp-${Date.now()}`,
      stopId: activeStop.id,
      customTitle: place.name,
      date: trip?.startDate || '',
      cost: 0,
      notes: `Wikipedia: ${place.wikiUrl}`,
      sectionType: 'morning',
      isNew: true,
    }])
    toast.success(`Added "${place.name}"`)
  }

  const activeStop = trip?.stops?.[activeStopIdx]
  const stopItems = items.filter(item => item.stopId === activeStop?.id)
  const totalCost = items.reduce((sum, item) => sum + Number(item.cost || 0), 0)
  const isOverBudget = trip?.totalBudget > 0 && totalCost > Number(trip.totalBudget)

  const getConflicts = () => {
    const conflicts = new Set()
    for (let i = 0; i < stopItems.length; i++) {
      for (let j = i + 1; j < stopItems.length; j++) {
        const a = stopItems[i], b = stopItems[j]
        if (a.date === b.date && a.startTime && b.startTime && a.endTime && b.endTime) {
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            conflicts.add(a.id); conflicts.add(b.id)
          }
        }
      }
    }
    return conflicts
  }
  const conflicts = getConflicts()

  const addItem = () => {
    if (!activeStop) { toast.error('Add a destination first'); return }
    setItems([...items, {
      id: `temp-${Date.now()}`, stopId: activeStop.id, customTitle: '',
      date: trip.startDate, cost: 0, notes: '', sectionType: 'morning', isNew: true
    }])
  }

  const updateItem = (index, field, value) => {
    const allIdx = items.indexOf(stopItems[index])
    const updated = [...items]
    updated[allIdx] = { ...updated[allIdx], [field]: value }
    setItems(updated)
  }

  const removeItem = async (index) => {
    const item = stopItems[index]
    if (!item.isNew) {
      try { await tripsApi.deleteItineraryItem(id, item.id) }
      catch { toast.error('Failed to delete'); return }
    }
    setItems(items.filter(i => i.id !== item.id))
  }

  const onDragStart = (idx) => setDragIdx(idx)
  const onDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return
    const newStopItems = [...stopItems]
    const [moved] = newStopItems.splice(dragIdx, 1)
    newStopItems.splice(idx, 0, moved)
    const otherItems = items.filter(i => i.stopId !== activeStop?.id)
    setItems([...otherItems, ...newStopItems])
    setDragIdx(null)
  }

  const handleCsvImport = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeStop) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(l => l.trim())
      const newItems = lines.slice(1).map((line, i) => {
        const [title, date, cost, notes] = line.split(',').map(s => s.trim())
        return {
          id: `csv-${Date.now()}-${i}`, stopId: activeStop.id,
          customTitle: title || 'Imported', date: date || trip.startDate,
          cost: parseFloat(cost) || 0, notes: notes || '', sectionType: 'morning', isNew: true
        }
      })
      setItems(prev => [...prev, ...newItems])
      toast.success(`Imported ${newItems.length} items`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const saveAll = async () => {
    setIsSaving(true)
    try {
      for (const item of items) {
        const payload = {
          stopId: item.stopId, customTitle: item.customTitle, date: item.date,
          cost: parseFloat(item.cost) || 0, notes: item.notes,
          sectionType: item.sectionType, orderIndex: items.indexOf(item)
        }
        if (item.isNew) await tripsApi.addItineraryItem(id, payload)
        else await tripsApi.updateItineraryItem(id, item.id, payload)
      }
      toast.success('Itinerary saved!')
      navigate(`/trips/${id}`)
    } catch { toast.error('Failed to save') }
    finally { setIsSaving(false) }
  }

  const quickAdd = (activity) => {
    if (!activeStop) return
    setItems([...items, {
      id: `temp-${Date.now()}`, stopId: activeStop.id, activityId: activity.id,
      customTitle: activity.name, date: trip?.startDate || '', cost: activity.costMin || 0,
      sectionType: 'morning', isNew: true
    }])
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-surface rounded-xl w-1/3" />
      <div className="h-32 bg-surface rounded-2xl" />
      <div className="h-48 bg-surface rounded-2xl" />
    </div>
  )

  const budgetPct = trip?.totalBudget > 0 ? Math.min((totalCost / Number(trip.totalBudget)) * 100, 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/trips/${id}`)}
            className="flex items-center gap-1 text-muted hover:text-white text-sm mb-1 transition-colors"
          >
            <ChevronLeft size={14} /> Back to trip
          </button>
          <h1 className="font-display text-2xl font-bold text-white">Build Itinerary</h1>
          <p className="text-muted text-sm">{trip?.title}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-secondary font-bold text-xl">
            <DollarSign size={18} />
            {totalCost.toLocaleString()}
          </div>
          {trip?.totalBudget > 0 && (
            <p className={`text-xs ${isOverBudget ? 'text-danger' : 'text-muted'}`}>
              of ${Number(trip.totalBudget).toLocaleString()} budget
            </p>
          )}
        </div>
      </div>

      {/* Budget bar */}
      {trip?.totalBudget > 0 && (
        <div className="h-2 bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-danger' : budgetPct > 80 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      )}

      {/* Warnings */}
      {isOverBudget && (
        <div className="bg-danger/10 border border-danger/40 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          <p className="text-danger text-sm">Over budget by ${(totalCost - Number(trip.totalBudget)).toLocaleString()}</p>
        </div>
      )}
      {conflicts.size > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2">
          <Clock size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">{conflicts.size} time conflict{conflicts.size !== 1 ? 's' : ''} detected</p>
        </div>
      )}

      {/* Stop tabs */}
      {trip?.stops?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {trip.stops.map((stop, idx) => (
            <button
              key={stop.id}
              onClick={() => setActiveStopIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
                idx === activeStopIdx
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-surface text-muted hover:text-white border border-border'
              }`}
            >
              {stop.city?.name || `Stop ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Itinerary Items */}
      <div className="space-y-3">
        {stopItems.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-white font-medium">No activities yet</p>
            <p className="text-muted text-sm mt-1">Add items or pick from suggested activities below</p>
          </div>
        )}
        {stopItems.map((item, index) => {
          const section = SECTION_TYPES.find(s => s.value === item.sectionType) || SECTION_TYPES[0]
          const SectionIcon = section.icon
          return (
            <Card
              key={item.id}
              className={`${conflicts.has(item.id) ? 'ring-2 ring-amber-500/50' : ''} overflow-hidden`}
            >
              <CardContent className="flex gap-3 items-start">
                {/* Drag handle */}
                <div
                  className="mt-2 text-muted cursor-grab active:cursor-grabbing flex-shrink-0"
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(index)}
                >
                  <GripVertical size={18} />
                </div>

                <div className="flex-1 space-y-2.5 min-w-0">
                  {/* Row 1: Title + Date */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Activity name..."
                      value={item.customTitle || item.activity?.name || ''}
                      onChange={(e) => updateItem(index, 'customTitle', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={item.date ? format(new Date(item.date), 'yyyy-MM-dd') : ''}
                      onChange={(e) => updateItem(index, 'date', e.target.value)}
                      className="w-36 flex-shrink-0"
                    />
                  </div>

                  {/* Row 2: Cost + Section type + Notes */}
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Cost $"
                      value={item.cost || ''}
                      onChange={(e) => updateItem(index, 'cost', e.target.value)}
                      className="w-24 flex-shrink-0"
                    />
                    {/* Section type pills */}
                    <div className={`flex gap-1 p-1 rounded-xl ${section.bg} border ${section.border}`}>
                      {SECTION_TYPES.map(s => {
                        const Icon = s.icon
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => updateItem(index, 'sectionType', s.value)}
                            title={s.label}
                            className={`p-1.5 rounded-lg transition-all ${item.sectionType === s.value ? s.bg + ' ' + s.border + ' border' : 'hover:bg-dark/50'}`}
                          >
                            <Icon size={13} className={item.sectionType === s.value ? s.color : 'text-muted'} />
                          </button>
                        )
                      })}
                    </div>
                    <Input
                      placeholder="Notes..."
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="mt-2 text-muted hover:text-danger transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Add Activities */}
      {activities.length > 0 && (
        <div className="p-4 bg-surface border border-border rounded-2xl">
          <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-3">
            Quick add from {activeStop?.city?.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.slice(0, 8).map(activity => (
              <button
                key={activity.id}
                onClick={() => quickAdd(activity)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border rounded-full text-sm text-muted hover:text-white hover:border-primary/50 transition-all"
              >
                <Plus size={12} className="text-primary" />
                {activity.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap pb-4">
        <Button variant="secondary" onClick={addItem}>
          <Plus size={18} className="mr-1.5" /> Add Item
        </Button>
        <Button variant="ghost" onClick={() => csvRef.current?.click()}>
          <Upload size={16} className="mr-1.5" /> Import CSV
        </Button>
        <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
        <Button onClick={saveAll} isLoading={isSaving} className="ml-auto">
          <Save size={18} className="mr-1.5" /> Save Itinerary
        </Button>
      </div>
    </div>
  )
}
