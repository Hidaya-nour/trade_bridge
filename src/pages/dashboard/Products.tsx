import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'

export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: 'Premium Wheat Flour',
      category: 'Grains',
      price: '$45/bag',
      stock: 150,
      rating: 4.5,
    },
    {
      id: 2,
      name: 'Rice Variety Pack',
      category: 'Grains',
      price: '$60/bag',
      stock: 200,
      rating: 4.8,
    },
    {
      id: 3,
      name: 'Vegetable Oil',
      category: 'Oils',
      price: '$25/liter',
      stock: 80,
      rating: 4.3,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-background border-input"
          />
        </div>
        <Button variant="outline" className="gap-2 border-border">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="p-6 border border-border bg-card hover:border-primary/50 transition-all duration-200"
          >
            <div className="w-full h-40 bg-muted rounded-lg mb-4"></div>
            <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{product.category}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-primary">{product.price}</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                ⭐ {product.rating}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Stock: <span className="text-foreground font-semibold">{product.stock}</span>
            </div>
            <Button variant="outline" className="w-full border-border">
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
