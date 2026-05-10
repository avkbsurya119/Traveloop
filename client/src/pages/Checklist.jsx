import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Plus, Trash2, RotateCcw, BookOpen, Sparkles, Package, X } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { checklistTemplatesApi } from '../api/checklistTemplates'
import { useTripStore } from '../store/tripStore'

const CATEGORY_META = {
  documents: { icon: '📄', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  clothing:  { icon: '👕', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  electronics:{ icon: '🔌', color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-300' },
  toiletries: { icon: '🧴', color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/30', badge: 'bg-pink-500/20 text-pink-300' },
  medication: { icon: '💊', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-300' },
  misc:       { icon: '📦', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
}

const CATEGORY_ORDER = ['documents', 'clothing', 'electronics', 'toiletries', 'medication', 'misc']

// Auto-suggest rules based on trip destination keywords
const SUGGEST_RULES = [
  { keywords: ['beach', 'island', 'tropical', 'bali', 'maldives', 'hawaii', 'phuket', 'cancun', 'miami', 'goa'], items: [
    { label: 'Sunscreen SPF 50+', category: 'toiletries' },
    { label: 'Swimwear', category: 'clothing' },
    { label: 'Beach towel', category: 'misc' },
    { label: 'Flip flops', category: 'clothing' },
    { label: 'Sunglasses', category: 'clothing' },
    { label: 'Insect repellent', category: 'toiletries' },
    { label: 'After-sun lotion', category: 'toiletries' },
  ]},
  { keywords: ['snow', 'winter', 'cold', 'ski', 'alps', 'iceland', 'norway', 'finland', 'canada', 'alaska'], items: [
    { label: 'Heavy winter jacket', category: 'clothing' },
    { label: 'Thermal underwear', category: 'clothing' },
    { label: 'Gloves & mittens', category: 'clothing' },
    { label: 'Wool socks', category: 'clothing' },
    { label: 'Lip balm', category: 'toiletries' },
    { label: 'Hand warmers', category: 'misc' },
    { label: 'Waterproof boots', category: 'clothing' },
  ]},
  { keywords: ['mountain', 'hiking', 'trek', 'nepal', 'peru', 'patagonia', 'switzerland', 'altitude'], items: [
    { label: 'Hiking boots', category: 'clothing' },
    { label: 'Trekking poles', category: 'misc' },
    { label: 'Water purification tablets', category: 'medication' },
    { label: 'First aid kit', category: 'medication' },
    { label: 'Energy bars / trail mix', category: 'misc' },
    { label: 'Altitude sickness pills', category: 'medication' },
    { label: 'Rain poncho', category: 'clothing' },
  ]},
  { keywords: ['safari', 'africa', 'kenya', 'tanzania', 'botswana', 'wildlife'], items: [
    { label: 'Neutral-colored clothing', category: 'clothing' },
    { label: 'Binoculars', category: 'electronics' },
    { label: 'Malaria prophylaxis', category: 'medication' },
    { label: 'Yellow fever certificate', category: 'documents' },
    { label: 'Insect repellent (DEET)', category: 'toiletries' },
    { label: 'Camera with zoom lens', category: 'electronics' },
  ]},
  { keywords: ['europe', 'paris', 'rome', 'london', 'barcelona', 'amsterdam', 'schengen'], items: [
    { label: 'Travel adapter (Type C/G)', category: 'electronics' },
    { label: 'Passport & travel insurance', category: 'documents' },
    { label: 'Rail pass / transport card', category: 'documents' },
    { label: 'Comfortable walking shoes', category: 'clothing' },
    { label: 'Small day pack', category: 'misc' },
  ]},
  { keywords: ['japan', 'tokyo', 'kyoto', 'osaka', 'asia', 'china', 'thailand', 'vietnam', 'korea'], items: [
    { label: 'Pocket WiFi / SIM card', category: 'electronics' },
    { label: 'Translation app downloaded', category: 'electronics' },
    { label: 'Cash (local currency)', category: 'documents' },
    { label: 'Slip-on shoes (temples)', category: 'clothing' },
    { label: 'Portable chopsticks', category: 'misc' },
  ]},
]

function getAutoSuggestions(trip) {
  if (!trip?.stops) return []
  const allText = trip.stops.map(s =>
    [s.city?.name, s.city?.country, s.city?.region, s.city?.description].join(' ')
  ).join(' ').toLowerCase()

  const suggestions = new Map()
  SUGGEST_RULES.forEach(rule => {
    if (rule.keywords.some(kw => allText.includes(kw))) {
      rule.items.forEach(item => {
        if (!suggestions.has(item.label)) suggestions.set(item.label, item)
      })
    }
  })
  return Array.from(suggestions.values())
}

export default function Checklist() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [newItem, setNewItem] = useState({ label: '', category: 'misc' })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const [checklistRes, templateRes] = await Promise.all([
        tripsApi.getChecklist(id),
        checklistTemplatesApi.getTemplates()
      ])
      setItems(checklistRes.data)
      setTemplates(templateRes.data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const suggestions = useMemo(() => getAutoSuggestions(currentTrip), [currentTrip])
  const existingLabels = useMemo(() => new Set(items.map(i => i.label.toLowerCase())), [items])
  const newSuggestions = suggestions.filter(s => !existingLabels.has(s.label.toLowerCase()))

  const groupedItems = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter(item => item.category === cat)
    return acc
  }, {})

  const packed = items.filter(i => i.isPacked).length
  const progress = items.length > 0 ? Math.round((packed / items.length) * 100) : 0

  const toggleItem = async (itemId, isPacked) => {
    try {
      await tripsApi.toggleChecklistItem(id, itemId, !isPacked)
      setItems(items.map(i => i.id === itemId ? { ...i, isPacked: !isPacked } : i))
    } catch { toast.error('Failed to update') }
  }

  const addItem = async (item = newItem) => {
    if (!item.label.trim()) return
    try {
      const { data } = await tripsApi.addChecklistItem(id, item)
      setItems(prev => [...prev, data])
      if (item === newItem) setNewItem({ label: '', category: 'misc' })
      toast.success('Item added')
    } catch { toast.error('Failed to add') }
  }

  const deleteItem = async (itemId) => {
    try {
      await tripsApi.deleteChecklistItem(id, itemId)
      setItems(items.filter(i => i.id !== itemId))
    } catch { toast.error('Failed to delete') }
  }

  const resetChecklist = async () => {
    try {
      await tripsApi.resetChecklist(id)
      setItems(items.map(i => ({ ...i, isPacked: false })))
      toast.success('Checklist reset')
    } catch { toast.error('Failed to reset') }
  }

  const applyTemplate = async (templateId) => {
    try {
      const { data } = await checklistTemplatesApi.applyTemplate(templateId, id)
      setItems(data.items)
      setShowTemplates(false)
      toast.success(`Added ${data.added} items from template`)
    } catch { toast.error('Failed to apply template') }
  }

  const addAllSuggestions = async () => {
    for (const s of newSuggestions) await addItem(s)
    setShowSuggestions(false)
    toast.success(`Added ${newSuggestions.length} suggested items!`)
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-surface rounded-xl w-1/3" />
      <div className="h-24 bg-surface rounded-2xl" />
      <div className="h-48 bg-surface rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Packing Checklist</h1>
          <p className="text-muted text-sm">{currentTrip?.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
            <BookOpen size={15} className="mr-1.5" /> Templates
          </Button>
          <Button variant="ghost" size="sm" onClick={resetChecklist}>
            <RotateCcw size={15} className="mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <Card className="animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Apply a Template</CardTitle>
            <button onClick={() => setShowTemplates(false)} className="text-muted hover:text-white"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t.id)}
                className="p-4 bg-dark rounded-xl text-left hover:bg-surface border border-border hover:border-primary/40 transition-all group">
                <p className="text-white font-medium group-hover:text-primary-light transition-colors">{t.name}</p>
                <p className="text-xs text-muted mt-1 capitalize">{t.category} · {(typeof t.items === 'string' ? JSON.parse(t.items) : t.items).length} items</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* AI Suggestions Banner */}
      {newSuggestions.length > 0 && showSuggestions && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-emerald-500/5 p-4 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-primary-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Smart Suggestions</p>
              <p className="text-muted text-xs mt-0.5">Based on your destinations — {newSuggestions.length} items recommended</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {newSuggestions.slice(0, 6).map(s => (
                  <button key={s.label} onClick={() => addItem(s)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-full text-xs text-muted hover:text-white hover:border-primary/60 transition-all">
                    <span>{CATEGORY_META[s.category]?.icon}</span>
                    {s.label}
                    <Plus size={10} className="text-primary" />
                  </button>
                ))}
                {newSuggestions.length > 6 && (
                  <span className="px-2.5 py-1 text-xs text-muted">+{newSuggestions.length - 6} more</span>
                )}
              </div>
              <button onClick={addAllSuggestions}
                className="mt-3 text-xs text-primary-light hover:text-primary font-medium transition-colors">
                Add all {newSuggestions.length} suggestions →
              </button>
            </div>
            <button onClick={() => setShowSuggestions(false)} className="text-muted hover:text-white flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-primary-light" />
            <span className="text-white font-semibold text-sm">Packing Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">{packed} / {items.length} items</span>
            <span className={`text-sm font-bold ${progress === 100 ? 'text-green-400' : 'text-white'}`}>{progress}%</span>
          </div>
        </div>
        <div className="h-3 bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary to-primary-light'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-center text-green-400 text-sm mt-2 font-medium">🎉 All packed! You're ready to go!</p>
        )}
      </Card>

      {/* Add Item */}
      <Card>
        <div className="flex gap-2">
          <Input
            placeholder="Add packing item..."
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="flex-1"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="px-3 py-2 bg-dark border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm capitalize"
          >
            {CATEGORY_ORDER.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_META[cat].icon} {cat}</option>
            ))}
          </select>
          <Button onClick={() => addItem()} size="sm">
            <Plus size={18} />
          </Button>
        </div>
      </Card>

      {/* Categories */}
      {CATEGORY_ORDER.map(category => {
        const catItems = groupedItems[category] || []
        const meta = CATEGORY_META[category]
        const packedCount = catItems.filter(i => i.isPacked).length
        return (
          <Card key={category} className={`overflow-hidden border ${meta.border}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-white font-semibold capitalize">{category}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
                  {packedCount}/{catItems.length}
                </span>
              </div>
              {catItems.length === 0 ? (
                <p className="text-muted text-sm py-2">No items — add some above</p>
              ) : (
                <div className="space-y-1.5">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark/50 group transition-colors">
                      <button
                        onClick={() => toggleItem(item.id, item.isPacked)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          item.isPacked
                            ? 'bg-primary border-primary shadow-sm shadow-primary/30'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {item.isPacked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm transition-all ${item.isPacked ? 'line-through text-muted' : 'text-white'}`}>
                        {item.label}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
