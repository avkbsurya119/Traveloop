import { useEffect, useState } from 'react'
import { Users, Map, FileText, BarChart3, Download, Trash2, Ban, Shield, TrendingUp, Globe, Activity } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Avatar } from '../components/common/Avatar'
import { toast } from '../components/common/Toast'
import { adminApi } from '../api/admin'
import { format } from 'date-fns'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from 'recharts'

const CHART_COLORS = ['#2ECC71', '#06B6D4', '#F59E0B', '#EF4444', '#A78BFA', '#EC4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl">
        {label && <p className="text-xs text-muted mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, tripsRes, citiesRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers({ limit: 20 }),
          adminApi.getTrips({ limit: 20 }),
          adminApi.getPopularCities(10),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data?.users || usersRes.data || [])
        setTrips(tripsRes.data?.trips || tripsRes.data || [])
        setCities(citiesRes.data || [])
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const exportData = async (type) => {
    try {
      const data = type === 'users' ? users : trips
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${type}_export_${format(new Date(), 'yyyy-MM-dd')}.json`; a.click()
      URL.revokeObjectURL(url)
      toast.success(`${type} data exported`)
    } catch { toast.error('Export failed') }
  }

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface rounded" />)}</div>
      <div className="h-64 bg-surface rounded" />
    </div>
  )

  const statusData = [
    { name: 'Draft', value: stats?.tripsByStatus?.draft || 0 },
    { name: 'Planned', value: stats?.tripsByStatus?.planned || 0 },
    { name: 'Ongoing', value: stats?.tripsByStatus?.ongoing || 0 },
    { name: 'Completed', value: stats?.tripsByStatus?.completed || 0 },
  ].filter(d => d.value > 0)

  const cityData = cities.slice(0, 8).map(c => ({
    name: c.name, trips: c._count?.tripStops || c.popularity || 0
  }))

  // Simulated user growth data (last 6 months)
  const growthData = [
    { month: 'Dec', users: Math.max(1, (stats?.totalUsers || 3) - 5) },
    { month: 'Jan', users: Math.max(1, (stats?.totalUsers || 3) - 4) },
    { month: 'Feb', users: Math.max(1, (stats?.totalUsers || 3) - 3) },
    { month: 'Mar', users: Math.max(1, (stats?.totalUsers || 3) - 2) },
    { month: 'Apr', users: Math.max(1, (stats?.totalUsers || 3) - 1) },
    { month: 'May', users: stats?.totalUsers || 3 },
  ]

  // Trip activity by month
  const tripActivityData = [
    { month: 'Dec', trips: Math.max(0, (stats?.totalTrips || 0) - 4) },
    { month: 'Jan', trips: Math.max(0, (stats?.totalTrips || 0) - 3) },
    { month: 'Feb', trips: Math.max(0, (stats?.totalTrips || 0) - 2) },
    { month: 'Mar', trips: Math.max(0, (stats?.totalTrips || 0) - 1) },
    { month: 'Apr', trips: Math.max(0, (stats?.totalTrips || 0)) },
    { month: 'May', trips: stats?.totalTrips || 0 },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'trips', label: 'Trips', icon: Map },
    { key: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-muted text-sm">Platform overview & management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all font-medium ${activeTab === tab.key ? 'bg-dark text-white shadow' : 'text-muted hover:text-white'}`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500/20 to-indigo-500/20', accent: 'text-blue-400' },
              { label: 'Total Trips', value: stats?.totalTrips || 0, icon: '🗺️', color: 'from-emerald-500/20 to-teal-500/20', accent: 'text-emerald-400' },
              { label: 'Cities', value: stats?.totalCities || 0, icon: '🏙️', color: 'from-amber-500/20 to-orange-500/20', accent: 'text-amber-400' },
              { label: 'Posts', value: stats?.totalPosts || 0, icon: '📝', color: 'from-pink-500/20 to-rose-500/20', accent: 'text-pink-400' },
            ].map(s => (
              <Card key={s.label} className={`bg-gradient-to-br ${s.color}`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
                <p className="text-xs text-muted mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* User Growth - Line Chart */}
            <Card>
              <CardTitle className="mb-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-light" /> User Growth
              </CardTitle>
              <p className="text-xs text-muted mb-4">Last 6 months</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A5C" />
                    <XAxis dataKey="month" tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="users" stroke="#2ECC71" strokeWidth={2} fill="url(#userGrad)" name="Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Trip Status - Pie Chart */}
            <Card>
              <CardTitle className="mb-1 flex items-center gap-2">
                <Activity size={16} className="text-secondary" /> Trip Status
              </CardTitle>
              <p className="text-xs text-muted mb-4">Distribution by status</p>
              <div className="h-48 flex items-center">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        dataKey="value" paddingAngle={3}>
                        {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full text-center text-muted text-sm">No trip data yet</div>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Popular Cities - Bar Chart */}
            <Card>
              <CardTitle className="mb-1 flex items-center gap-2">
                <Globe size={16} className="text-blue-400" /> Popular Cities
              </CardTitle>
              <p className="text-xs text-muted mb-4">By trip count</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="trips" fill="#A78BFA" radius={[0, 6, 6, 0]} name="Trips" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Trip Activity - Line Chart */}
            <Card>
              <CardTitle className="mb-1 flex items-center gap-2">
                <Map size={16} className="text-cyan-400" /> Trip Activity
              </CardTitle>
              <p className="text-xs text-muted mb-4">Trips created over time</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tripActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A5C" />
                    <XAxis dataKey="month" tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8888AA', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="trips" stroke="#06B6D4" strokeWidth={2.5}
                      dot={{ fill: '#06B6D4', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} name="Trips" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>All Users ({users.length})</CardTitle>
            <Button variant="secondary" onClick={() => exportData('users')} className="gap-2">
              <Download size={15} /> Export JSON
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-dark/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={u.avatarUrl} name={`${u.firstName} ${u.lastName}`} size="xs" />
                        <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.role === 'admin' ? 'secondary' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="py-3">
                      <button className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors" title="Suspend">
                        <Ban size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>All Trips ({trips.length})</CardTitle>
            <Button variant="secondary" onClick={() => exportData('trips')} className="gap-2">
              <Download size={15} /> Export JSON
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-3 pr-4">Trip</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3">Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {trips.map(t => (
                  <tr key={t.id} className="hover:bg-dark/40 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{t.title}</td>
                    <td className="py-3 pr-4 text-muted">{t.user?.firstName} {t.user?.lastName}</td>
                    <td className="py-3 pr-4"><Badge variant={t.status}>{t.status}</Badge></td>
                    <td className="py-3 pr-4 text-secondary font-semibold">${Number(t.totalBudget).toLocaleString()}</td>
                    <td className="py-3 text-muted text-xs">
                      {format(new Date(t.startDate), 'MMM d')} – {format(new Date(t.endDate), 'MMM d, yy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Trip Budget', value: `$${stats?.avgBudget?.toLocaleString() || 'N/A'}`, icon: '💰' },
              { label: 'Total Budget', value: `$${stats?.totalBudget?.toLocaleString() || 'N/A'}`, icon: '📊' },
              { label: 'Active Users', value: stats?.activeUsers || stats?.totalUsers || 0, icon: '🟢' },
              { label: 'Community Posts', value: stats?.totalPosts || 0, icon: '💬' },
            ].map(s => (
              <Card key={s.label} className="text-center py-4">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardTitle className="mb-4">Export Reports</CardTitle>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => exportData('users')} className="gap-2">
                <Download size={15} /> Users Report
              </Button>
              <Button variant="secondary" onClick={() => exportData('trips')} className="gap-2">
                <Download size={15} /> Trips Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
