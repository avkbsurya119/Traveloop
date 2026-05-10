import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { tripsApi } from '../api/trips'
import { format } from 'date-fns'

const CATEGORY_META = {
  hotel:     { emoji: '🏨', color: 'bg-blue-500',   light: 'bg-blue-500/15 text-blue-300' },
  flight:    { emoji: '✈️', color: 'bg-purple-500',  light: 'bg-purple-500/15 text-purple-300' },
  food:      { emoji: '🍽️', color: 'bg-orange-500',  light: 'bg-orange-500/15 text-orange-300' },
  activity:  { emoji: '🎯', color: 'bg-green-500',   light: 'bg-green-500/15 text-green-300' },
  transport: { emoji: '🚗', color: 'bg-cyan-500',    light: 'bg-cyan-500/15 text-cyan-300' },
  shopping:  { emoji: '🛍️', color: 'bg-pink-500',    light: 'bg-pink-500/15 text-pink-300' },
  other:     { emoji: '📦', color: 'bg-gray-500',    light: 'bg-gray-500/15 text-gray-300' },
}

export default function Invoice() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    tripsApi.getExpenseSummary(id)
      .then(res => { setData(res.data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [id])

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-surface rounded-xl w-1/3" />
      <div className="h-64 bg-surface rounded-2xl" />
    </div>
  )

  if (!data) return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-white font-semibold text-lg">No expense data available</p>
      <p className="text-muted mt-1">Add some expenses to your trip first</p>
    </div>
  )

  const maxCat = Math.max(...data.byCategory.map(c => c.total), 1)
  const isUnderBudget = data.remaining >= 0
  const budgetPct = data.trip.budget > 0 ? Math.min((data.total / Number(data.trip.budget)) * 100, 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link to={`/trips/${id}/expenses`} className="flex items-center gap-1.5 text-muted hover:text-white text-sm mb-1 transition-colors">
            <ArrowLeft size={14} /> Back to Expenses
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">Trip Invoice</h1>
          <p className="text-muted text-sm">{data.trip.title}</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} className="mr-1.5" /> Print / PDF
        </Button>
      </div>

      {/* Invoice document */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden print:rounded-none print:border-0 print:shadow-none">
        {/* Invoice header strip */}
        <div className="bg-gradient-to-r from-primary to-primary-light px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">✈️</div>
            <div>
              <p className="text-white font-display font-bold text-xl">Traveloop</p>
              <p className="text-white/70 text-xs">Trip Expense Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs uppercase tracking-wide">Generated</p>
            <p className="text-white font-semibold">{format(new Date(), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Trip Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Trip', value: data.trip.title },
              { label: 'Traveler', value: `${data.user.firstName} ${data.user.lastName}` },
              { label: 'Duration', value: `${format(new Date(data.trip.startDate), 'MMM d')} – ${format(new Date(data.trip.endDate), 'MMM d, yyyy')}` },
              { label: 'Currency', value: data.trip.currency || 'USD' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-dark rounded-xl">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                <p className="text-white text-sm font-medium truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Budget</p>
              <p className="text-white font-bold text-xl">${Number(data.trip.budget || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 text-center">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Spent</p>
              <p className="text-white font-bold text-xl">${data.total.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-2xl text-center border ${isUnderBudget ? 'bg-green-500/10 border-green-500/20' : 'bg-danger/10 border-danger/20'}`}>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Remaining</p>
              <div className="flex items-center justify-center gap-1">
                {isUnderBudget ? <TrendingDown size={16} className="text-green-400" /> : <TrendingUp size={16} className="text-danger" />}
                <p className={`font-bold text-xl ${isUnderBudget ? 'text-green-400' : 'text-danger'}`}>
                  ${Math.abs(data.remaining).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Budget progress */}
          {data.trip.budget > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted mb-2">
                <span>Budget used</span>
                <span>{budgetPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgetPct >= 100 ? 'bg-danger' : budgetPct >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Category breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {data.byCategory.map(cat => {
                const meta = CATEGORY_META[cat.category] || CATEGORY_META.other
                const pct = (cat.total / maxCat) * 100
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span>{meta.emoji}</span>
                        <span className="text-white capitalize">{cat.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${meta.light}`}>
                          {((cat.total / data.total) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-white font-semibold">${cat.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-dark rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expense table */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">All Expenses</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-dark">
                  <tr className="text-left text-muted">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.expenses.map(exp => {
                    const meta = CATEGORY_META[exp.category] || CATEGORY_META.other
                    return (
                      <tr key={exp.id} className="hover:bg-dark/40 transition-colors">
                        <td className="px-4 py-3 text-muted text-sm">
                          {exp.date ? format(new Date(exp.date), 'MMM d') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${meta.light}`}>
                            {meta.emoji} {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white">{exp.description || '—'}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          ${Number(exp.amount).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-dark">
                  <tr>
                    <td colSpan={3} className="px-4 py-4 font-bold text-white">Total Spent</td>
                    <td className="px-4 py-4 text-right font-bold text-secondary text-lg">
                      ${data.total.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td colSpan={3} className="px-4 py-3 text-muted">Budget Remaining</td>
                    <td className={`px-4 py-3 text-right font-semibold ${isUnderBudget ? 'text-green-400' : 'text-danger'}`}>
                      {isUnderBudget ? '+' : '-'}${Math.abs(data.remaining).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted border-t border-border pt-6">
            Generated by Traveloop · Dream it. Plan it. Loop it.
          </div>
        </div>
      </div>
    </div>
  )
}
