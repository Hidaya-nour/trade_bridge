import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Download, Plus } from 'lucide-react'

export default function OrdersPage() {
  const orders = [
    {
      id: '#ORD-001',
      customer: 'Retail Store A',
      amount: '$2,500',
      items: 5,
      date: '2025-04-01',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: '#ORD-002',
      customer: 'Distribution Center B',
      amount: '$5,200',
      items: 12,
      date: '2025-04-02',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      id: '#ORD-003',
      customer: 'Factory Supply',
      amount: '$1,800',
      items: 3,
      date: '2025-04-03',
      status: 'Shipped',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground">Track and manage all your orders</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button variant="outline" className="gap-2 border-border">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {order.items} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="outline" size="sm" className="border-border">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
