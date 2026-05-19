import { useAuth, type UserRole } from '@/context/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const roles: { value: UserRole; label: string }[] = [
  { value: 'retailer', label: 'Retailer' },
  { value: 'factory', label: 'Factory' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'driver', label: 'Driver' },
  { value: 'admin', label: 'Admin' },
]

export function TopNav() {
  const { user, switchRole } = useAuth()
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  if (!user) return null

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <span className="capitalize">{user.role}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 py-1">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    switchRole(role.value)
                    setShowRoleMenu(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    user.role === role.value
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full border-2 border-primary/20"
        />
      </div>
    </header>
  )
}
