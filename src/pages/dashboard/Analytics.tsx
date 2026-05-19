import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, Calendar } from 'lucide-react'

const data = [
  { date: 'Mon', orders: 400, revenue: 2400, growth: 24 },
  { date: 'Tue', orders: 300, revenue: 1398, growth: 28 },
  { date: 'Wed', orders: 200, revenue: 9800, growth: 22 },
  { date: 'Thu', orders: 278, revenue: 3908, growth: 30 },
  { date: 'Fri', orders: 189, revenue: 4800, growth: 18 },
  { date: 'Sat', orders: 239, revenue: 3800, growth: 25 },
  { date: 'Sun', orders: 349, revenue: 4300, growth: 29 },
]

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Grains', value: 25 },
  { name: 'Oils', value: 20 },
  { name: 'Spices', value: 20 },
]

const COLORS = ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b']

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your business performance</p>
        </div>
        <Button variant="outline" className="gap-2 border-border">
          <Calendar className="w-4 h-4" />
          Select Period
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: '2,543', change: '+12.5%' },
          { label: 'Total Revenue', value: '$45,231', change: '+8.2%' },
          { label: 'Avg Order Value', value: '$178', change: '+5.1%' },
          { label: 'Conversion Rate', value: '3.28%', change: '+2.4%' },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className="p-6 border border-border bg-card"
          >
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {kpi.label}
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
              <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {kpi.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2 p-6 border border-border bg-card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Revenue & Orders</h2>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 border border-border bg-card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Category Distribution
            </h2>
            <p className="text-sm text-muted-foreground">Sales by category</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="p-6 border border-border bg-card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Growth Trend</h2>
          <p className="text-sm text-muted-foreground">Week-over-week growth percentage</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
