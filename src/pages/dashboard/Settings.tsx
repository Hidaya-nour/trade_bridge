import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Settings */}
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                defaultValue="John Retailer"
                className="bg-background border-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                defaultValue="retailer@tradebridge.com"
                className="bg-background border-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company
              </label>
              <Input
                defaultValue="Premium Retail Shop"
                className="bg-background border-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="bg-background border-input"
              />
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Security</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-background border-input pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-background border-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-background border-input"
              />
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Update Password
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Order Updates', description: 'Receive notifications about order status' },
              { title: 'Messages', description: 'New messages from suppliers and distributors' },
              { title: 'Promotions', description: 'Special offers and deals' },
              { title: 'System Updates', description: 'Important platform updates' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50"
              >
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
          >
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  )
}
