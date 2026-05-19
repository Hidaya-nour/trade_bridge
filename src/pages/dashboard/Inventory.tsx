import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Package, AlertTriangle } from 'lucide-react'

export default function InventoryPage() {
  const items = [
    {
      id: 1,
      name: 'Wheat Flour (Premium)',
      sku: 'WF-001',
      quantity: 850,
      reorderLevel: 500,
      warehouse: 'Main Warehouse',
      lastUpdate: '2025-04-03',
    },
    {
      id: 2,
      name: 'Rice - Basmati',
      sku: 'RB-002',
      quantity: 320,
      reorderLevel: 500,
      warehouse: 'Secondary Hub',
      lastUpdate: '2025-04-02',
      warning: true,
    },
    {
      id: 3,
      name: 'Vegetable Oil',
      sku: 'VO-003',
      quantity: 1200,
      reorderLevel: 600,
      warehouse: 'Main Warehouse',
      lastUpdate: '2025-04-03',
    },
    {
      id: 4,
      name: 'Spice Mix',
      sku: 'SM-004',
      quantity: 180,
      reorderLevel: 300,
      warehouse: 'Cold Storage',
      lastUpdate: '2025-04-01',
      warning: true,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory</h1>
        <p className="text-muted-foreground">Manage warehouse and stock levels</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Add Item
        </Button>
      </div>

      {/* Alerts */}
      <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-900 dark:text-yellow-200 text-sm">
            Low Stock Alert
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            2 items are below reorder level. Review and place new orders.
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Warehouse
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Last Update
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.warning && (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {item.warehouse}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.lastUpdate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="outline" size="sm" className="border-border">
                      Manage
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
