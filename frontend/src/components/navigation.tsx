import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity "
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">TB</span>
            </div>
            <span className="text-2xl font-bold text-foreground hidden sm:inline">TradeBridge</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href)
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
                variant="outline"
                className="w-full border-border hover:bg-muted cursor-pointer" 
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              >
                Get Started
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
