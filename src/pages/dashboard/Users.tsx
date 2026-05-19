import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreVertical, CheckCircle, AlertCircle } from 'lucide-react'

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: 'John Retailer',
      email: 'john@retailstore.com',
      role: 'Retailer',
      company: 'Premium Retail Shop',
      status: 'Active',
      joinDate: '2025-01-15',
      orders: 45,
    },
    {
      id: 2,
      name: 'Sarah Factory',
      email: 'sarah@factory.com',
      role: 'Factory',
      company: 'Industrial Products Inc',
      status: 'Active',
      joinDate: '2025-02-20',
      orders: 128,
    },
    {
      id: 3,
      name: 'Mike Distributor',
      email: 'mike@distribution.com',
      role: 'Distributor',
      company: 'Quick Distribution',
      status: 'Pending',
      joinDate: '2025-03-10',
      orders: 0,
    },
    {
      id: 4,
      name: 'Lisa Driver',
      email: 'lisa@driver.com',
      role: 'Driver',
      company: 'Express Logistics',
      status: 'Active',
      joinDate: '2025-02-01',
      orders: 67,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
          <p className="text-muted-foreground">Manage platform users and permissions</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button variant="outline" className="border-border">
          Filter
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {user.status === 'Active' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                            Pending
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="p-1 rounded hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
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
