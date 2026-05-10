import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Save, X, FileText, Calendar, MapPin, StickyNote } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { useTripStore } from '../store/tripStore'
import { format, formatDistanceToNow } from 'date-fns'

const NOTE_COLORS = [
  'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
  'from-violet-500/10 to-purple-500/10 border-violet-500/20',
  'from-amber-500/10 to-orange-500/10 border-amber-500/20',
  'from-pink-500/10 to-rose-500/10 border-pink-500/20',
]

export default function Notes() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', content: '', noteDate: '', stopId: '' })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getNotes(id)
      setNotes(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const stops = currentTrip?.stops || []

  const filteredNotes = notes.filter(n => {
    if (filter === 'all') return true
    if (filter === 'by_day') return !!n.noteDate
    if (filter === 'by_stop') return !!n.stopId
    return true
  })

  const saveNote = async () => {
    if (!form.content.trim()) { toast.error('Content required'); return }
    try {
      if (editingId) {
        const { data } = await tripsApi.updateNote(id, editingId, form)
        setNotes(notes.map(n => n.id === editingId ? data : n))
        toast.success('Note updated')
      } else {
        const { data } = await tripsApi.addNote(id, form)
        setNotes([data, ...notes])
        toast.success('Note added')
      }
      resetForm()
    } catch { toast.error('Failed to save note') }
  }

  const deleteNote = async (noteId) => {
    try {
      await tripsApi.deleteNote(id, noteId)
      setNotes(notes.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    } catch { toast.error('Failed to delete') }
  }

  const editNote = (note) => {
    setEditingId(note.id)
    setForm({
      title: note.title || '',
      content: note.content,
      noteDate: note.noteDate ? format(new Date(note.noteDate), 'yyyy-MM-dd') : '',
      stopId: note.stopId || '',
    })
    setShowNew(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setShowNew(false)
    setEditingId(null)
    setForm({ title: '', content: '', noteDate: '', stopId: '' })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-surface rounded w-1/3" />
        <div className="h-32 bg-surface rounded" />
        {[1,2].map(i => <div key={i} className="h-28 bg-surface rounded" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <StickyNote className="text-primary-light" size={26} /> Trip Notes
          </h1>
          <p className="text-muted text-sm mt-0.5">{currentTrip?.title}</p>
        </div>
        {!showNew && (
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus size={16} /> Add Note
          </Button>
        )}
      </div>

      {/* New/Edit Note Form */}
      {showNew && (
        <Card className="border-gradient animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base">{editingId ? 'Edit Note' : 'New Note'}</CardTitle>
            <button onClick={resetForm} className="text-muted hover:text-white p-1 rounded-lg hover:bg-dark"><X size={16} /></button>
          </div>
          <CardContent className="space-y-3">
            <Input label="Title (optional)" placeholder="Note title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Content *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4} placeholder="Write your note... Tips, observations, reminders..."
                className="w-full px-4 py-3 bg-dark border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/60 resize-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date (optional)" type="date" value={form.noteDate}
                onChange={(e) => setForm({ ...form, noteDate: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Link to Stop</label>
                <select value={form.stopId} onChange={(e) => setForm({ ...form, stopId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/60">
                  <option value="">No stop</option>
                  {stops.map(s => (
                    <option key={s.id} value={s.id}>{s.city?.name || 'Stop'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={saveNote} className="gap-2 flex-1">
                <Save size={16} /> {editingId ? 'Update Note' : 'Save Note'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl">
        {[
          { key: 'all', label: 'All Notes', icon: FileText },
          { key: 'by_day', label: 'By Day', icon: Calendar },
          { key: 'by_stop', label: 'By Stop', icon: MapPin },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white'}`}>
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </div>

      {/* Notes count */}
      <p className="text-xs text-muted">
        {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        {filter !== 'all' && ` (filtered)`}
      </p>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-14">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-white font-semibold mb-1">
            {filter === 'all' ? 'No notes yet' : `No notes ${filter === 'by_day' ? 'with dates' : 'linked to stops'}`}
          </p>
          <p className="text-muted text-sm mb-4">
            {filter === 'all' ? 'Capture your trip memories, tips, and observations' : 'Try the "All" filter to see all notes'}
          </p>
          {filter === 'all' && <Button onClick={() => setShowNew(true)}>Add your first note</Button>}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note, i) => (
            <div key={note.id}
              className={`relative p-4 rounded-2xl bg-gradient-to-br border group transition-all hover:shadow-lg hover:scale-[1.01] ${NOTE_COLORS[i % NOTE_COLORS.length]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <h3 className="font-semibold text-white mb-1.5 text-base">{note.title}</h3>
                  )}
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm">{note.content}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                    {note.noteDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {format(new Date(note.noteDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileText size={11} />
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </span>
                    {note.stop && (
                      <Badge variant="default" className="text-xs flex items-center gap-1 py-0.5">
                        <MapPin size={10} /> {note.stop.city?.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => editNote(note)}
                    className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
