import { useAuth } from '@/context/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

const chartData = [
  { month: 'Jan', orders: 4000, revenue: 2400 },
  { month: 'Feb', orders: 3000, revenue: 1398 },
  { month: 'Mar', orders: 2000, revenue: 9800 },
  { month: 'Apr', orders: 2780, revenue: 3908 },
  { month: 'May', orders: 1890, revenue: 4800 },
  { month: 'Jun', orders: 2390, revenue: 3800 },
]

const pieData = [
  { name: 'Completed', value: 45 },
  { name: 'Pending', value: 30 },
  { name: 'Cancelled', value: 25 },
]

const COLORS = ['#3b82f6', '#a855f7', '#ec4899']

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const stats = [
    {
      title: 'Total Orders',
      value: '2,543',
      change: '+12.5%',
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      title: 'Revenue',
      value: '$45,231.89',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'secondary',
    },
    {
      title: 'Products',
      value: '156',
      change: '+5.1%',
      icon: Package,
      color: 'accent',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+3.8%',
      icon: Users,
      color: 'primary',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="p-6 border border-border bg-card hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Orders Chart */}
        <Card className="col-span-1 lg:col-span-2 p-6 border border-border bg-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Orders & Revenue
            </h2>
            <p className="text-sm text-muted-foreground">
              Last 6 months performance
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Order Status */}
        <Card className="p-6 border border-border bg-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Order Status
            </h2>
            <p className="text-sm text-muted-foreground">Distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
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

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="col-span-1 lg:col-span-2 p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { id: '#ORD-001', customer: 'Retail Store A', amount: '$2,500', status: 'Completed' },
              { id: '#ORD-002', customer: 'Distribution Center B', amount: '$5,200', status: 'Pending' },
              { id: '#ORD-003', customer: 'Factory Supply', amount: '$1,800', status: 'Shipped' },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{order.amount}</p>
                  <p className="text-xs text-primary">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Alerts</h2>
          <div className="space-y-3">
            {[
              { title: 'Low Stock', desc: 'Product ABC is running low', type: 'warning' },
              { title: 'Pending Review', desc: '3 orders need approval', type: 'info' },
              { title: 'New Messages', desc: 'You have 5 unread messages', type: 'info' },
            ].map((alert) => (
              <div
                key={alert.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
