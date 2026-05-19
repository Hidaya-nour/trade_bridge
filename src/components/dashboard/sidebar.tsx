import { useAuth } from '@/context/auth'
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Home,
  Truck,
  Factory,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = {
  retailer: [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/products', label: 'Browse Products', icon: Package },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  factory: [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/products', label: 'My Products', icon: Package },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  distributor: [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  driver: [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/deliveries', label: 'Deliveries', icon: Truck },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  admin: [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = useLocation().pathname

  if (!user) return null

  const items = menuItems[user.role]
  const roleIcon = {
    retailer: <Store className="w-5 h-5" />,
    factory: <Factory className="w-5 h-5" />,
    distributor: <Package className="w-5 h-5" />,
    driver: <Truck className="w-5 h-5" />,
    admin: <Users className="w-5 h-5" />,
  }[user.role]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">TB</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">TradeBridge</h1>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/10 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
