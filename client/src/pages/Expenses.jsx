import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Trash2, DollarSign, TrendingUp, FileText, Edit2, X } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { useTripStore } from '../store/tripStore'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CATEGORIES = ['hotel', 'flight', 'food', 'activity', 'transport', 'shopping', 'other']
const CATEGORY_COLORS = {
  hotel: '#6366F1', flight: '#06B6D4', food: '#F59E0B',
  activity: '#10B981', transport: '#A78BFA', shopping: '#EC4899', other: '#6B7280'
}
const CATEGORY_EMOJIS = {
  hotel: '🏨', flight: '✈️', food: '🍽️',
  activity: '🎯', transport: '🚌', shopping: '🛍️', other: '💰'
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-3 py-2 rounded-xl shadow-xl text-sm">
        <p className="text-white font-semibold">{CATEGORY_EMOJIS[payload[0].name] || ''} {payload[0].name}</p>
        <p className="text-secondary">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Expenses() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeView, setActiveView] = useState('list')
  const [form, setForm] = useState({ category: 'other', description: '', amount: '', date: '' })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getExpenses(id)
      setExpenses(data.expenses)
      setTotal(data.total)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const budget = Number(currentTrip?.totalBudget) || 0
  const remaining = budget - total
  const percentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 0
  const isOverBudget = budget > 0 && total > budget

  const addExpense = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter valid amount'); return }
    try {
      const { data } = await tripsApi.addExpense(id, { ...form, amount: parseFloat(form.amount) })
      setExpenses([data, ...expenses])
      setTotal(prev => prev + parseFloat(form.amount))
      setShowForm(false)
      setForm({ category: 'other', description: '', amount: '', date: '' })
      toast.success('Expense added!')
    } catch { toast.error('Failed to add expense') }
  }

  const deleteExpense = async (expId, amount) => {
    try {
      await tripsApi.deleteExpense(id, expId)
      setExpenses(expenses.filter(e => e.id !== expId))
      setTotal(prev => prev - Number(amount))
      toast.success('Expense removed')
    } catch { toast.error('Failed to delete') }
  }

  const groupedExpenses = CATEGORIES.reduce((acc, cat) => {
    const catExpenses = expenses.filter(e => e.category === cat)
    acc[cat] = { items: catExpenses, total: catExpenses.reduce((s, e) => s + Number(e.amount), 0) }
    return acc
  }, {})

  const pieData = CATEGORIES
    .filter(cat => groupedExpenses[cat].total > 0)
    .map(cat => ({ name: cat, value: groupedExpenses[cat].total }))

  if (isLoading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface rounded" />)}</div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-secondary" size={26} /> Expenses
          </h1>
          <p className="text-muted text-sm mt-0.5">{currentTrip?.title}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${id}/invoice`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FileText size={14} /> Invoice
            </Button>
          </Link>
          <Button onClick={() => setShowForm(true)} className="gap-2" size="sm">
            <Plus size={15} /> Add
          </Button>
        </div>
      </div>

      {/* Budget cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/15 to-transparent text-center py-5">
          <p className="text-xs text-muted mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-white">${budget.toLocaleString()}</p>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/15 to-transparent text-center py-5">
          <p className="text-xs text-muted mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-secondary">${total.toLocaleString()}</p>
        </Card>
        <Card className={`text-center py-5 bg-gradient-to-br ${isOverBudget ? 'from-danger/15' : 'from-green-500/15'} to-transparent`}>
          <p className="text-xs text-muted mb-1">Remaining</p>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-danger' : 'text-green-400'}`}>
            {isOverBudget ? '-' : ''}${Math.abs(remaining).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Budget bar */}
      {budget > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Budget Usage</span>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-danger' : 'text-white'}`}>
              {percentage.toFixed(0)}% {isOverBudget && '⚠️'}
            </span>
          </div>
          <div className="h-3 bg-dark rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 rounded-full ${isOverBudget ? 'bg-gradient-to-r from-danger to-red-400' : percentage > 75 ? 'bg-gradient-to-r from-secondary to-amber-400' : 'bg-gradient-to-r from-primary to-primary-light'}`}
              style={{ width: `${percentage}%` }} />
          </div>
          {isOverBudget && (
            <p className="text-xs text-danger mt-1.5">⚠️ Over budget by ${(total - budget).toLocaleString()}</p>
          )}
        </Card>
      )}

      {/* Add form */}
      {showForm && (
        <Card className="border-gradient animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base">Add Expense</CardTitle>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-white p-1 rounded-lg hover:bg-dark">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark border border-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 capitalize">
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat]} {cat}</option>
                ))}
              </select>
            </div>
            <Input label="Amount ($)" type="number" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Input label="Description" placeholder="What was this for?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input label="Date" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={addExpense} className="flex-1">Add Expense</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* View toggle */}
      {expenses.length > 0 && (
        <div className="flex gap-2 p-1 bg-surface rounded-xl self-start">
          {[{ k: 'list', l: '📋 List' }, { k: 'chart', l: '📊 Chart' }].map(v => (
            <button key={v.k} onClick={() => setActiveView(v.k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeView === v.k ? 'bg-dark text-white shadow' : 'text-muted hover:text-white'}`}>
              {v.l}
            </button>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <Card className="text-center py-14">
          <div className="text-5xl mb-3">💳</div>
          <p className="text-white font-semibold mb-1">No expenses yet</p>
          <p className="text-muted text-sm mb-4">Track your spending for this trip</p>
          <Button onClick={() => setShowForm(true)}>Add first expense</Button>
        </Card>
      ) : activeView === 'chart' ? (
        /* Chart View */
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardTitle className="mb-4">Spending by Category</CardTitle>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-muted capitalize">{CATEGORY_EMOJIS[v] || ''} {v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-4">Category Breakdown</CardTitle>
            <div className="space-y-3">
              {pieData.sort((a, b) => b.value - a.value).map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white capitalize">{CATEGORY_EMOJIS[item.name]} {item.name}</span>
                    <span className="text-muted">${item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-dark rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(item.value / total) * 100}%`, backgroundColor: CATEGORY_COLORS[item.name] || '#6B7280' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        /* List View — grouped by category */
        <div className="space-y-3">
          {CATEGORIES.map(category => {
            const { items, total: catTotal } = groupedExpenses[category]
            if (items.length === 0) return null
            return (
              <Card key={category}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_EMOJIS[category]}</span>
                    <CardTitle className="capitalize text-base">{category}</CardTitle>
                    <Badge variant="default">{items.length}</Badge>
                  </div>
                  <span className="font-bold text-secondary">${catTotal.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(expense => (
                    <div key={expense.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark/60 group transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{expense.description || category}</p>
                        {expense.date && (
                          <p className="text-xs text-muted">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                      <span className="text-white font-semibold text-sm">${Number(expense.amount).toLocaleString()}</span>
                      <button onClick={() => deleteExpense(expense.id, expense.amount)}
                        className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-danger/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
