import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Phone, Clock } from 'lucide-react'

export default function DeliveriesPage() {
  const deliveries = [
    {
      id: '#DEL-001',
      from: 'Distribution Hub A',
      to: 'Retail Store B',
      address: '123 Market St, City',
      phone: '+1 (555) 123-4567',
      eta: '2:30 PM',
      status: 'In Transit',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: '#DEL-002',
      from: 'Factory C',
      to: 'Distribution Center D',
      address: '456 Industrial Rd, City',
      phone: '+1 (555) 234-5678',
      eta: '4:15 PM',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      id: '#DEL-003',
      from: 'Warehouse E',
      to: 'Retail Store F',
      address: '789 Commerce Ave, City',
      phone: '+1 (555) 345-6789',
      eta: '1:00 PM',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Deliveries</h1>
        <p className="text-muted-foreground">Track and manage your deliveries</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliveries..."
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Start Delivery
        </Button>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <Card
            key={delivery.id}
            className="p-6 border border-border bg-card hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{delivery.id}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{delivery.from} → {delivery.to}</span>
                </div>
                <p className="text-sm text-foreground">{delivery.address}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${delivery.statusColor}`}>
                  {delivery.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="w-4 h-4" />
                  {delivery.phone}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">ETA</p>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="w-4 h-4" />
                  {delivery.eta}
                </div>
              </div>
              <div className="col-span-2 md:col-span-2 text-right">
                <Button variant="outline" size="sm" className="gap-2 border-border">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
