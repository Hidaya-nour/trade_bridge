import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard')
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const demoUsers = [
    {
      email: 'retailer@tradebridge.com',
      password: 'demo',
      role: 'Retailer',
    },
    {
      email: 'factory@tradebridge.com',
      password: 'demo',
      role: 'Factory',
    },
    {
      email: 'distributor@tradebridge.com',
      password: 'demo',
      role: 'Distributor',
    },
    {
      email: 'driver@tradebridge.com',
      password: 'demo',
      role: 'Driver',
    },
  ]

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setError('')
    setIsLoading(true)

    try {
      await login(demoEmail, 'demo')
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 dark:from-[#06121f] dark:via-[#0a1b2f] dark:to-[#08111d]">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-0 left-0 w-[32rem] h-[32rem] bg-blue-400/30 rounded-full blur-3xl animate-pulse" />

        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-300/30 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />

      </div>

      <div className="relative z-10 flex items-center px-6 py-6">

  {/* Left side (empty or keep something if needed) */}
  <div />

  {/* Centered Logo + Text */}
  <a
    href="./"
    className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3"
  >
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-lg">TB</span>
    </div>

    <h1 className="text-2xl font-black text-gray-900 dark:text-white">
      TradeBridge
    </h1>
  </a>

  {/* Right side */}
  <ThemeToggle />


      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">

        <div className="w-full max-w-md">

          {/* GLASS LOGIN CARD */}
          <Card className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/20 dark:bg-white/10 backdrop-blur-2xl shadow-2xl p-8">

            {/* MIRROR SHINE */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none" />

            {/* TOP GLOW */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-300/30 rounded-full blur-3xl" />

            <div className="relative z-10">

              {/* TITLE */}
              <div className="text-center mb-8">

                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                  Welcome{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                    Back
                  </span>
                </h2>

                <p className="text-gray-700 dark:text-gray-300">
                  Smart Supply-Demand Management System
                </p>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 backdrop-blur-md p-4 border border-red-400/30">

                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />

                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>

                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5 mb-6"
              >

                {/* EMAIL */}
                <div>

                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Email Address
                  </label>

                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Password
                  </label>

                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                  />

                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white text-lg font-semibold hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

              </form>

              {/* DEMO USERS */}
              <div className="border-t border-white/20 pt-6">

                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center mb-4 uppercase tracking-widest">
                  Try Demo Accounts
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => handleDemoLogin(user.email)}
                      disabled={isLoading}
                      className="rounded-2xl py-3 text-sm font-medium transition-all duration-300 border border-white/20 bg-white/20 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 hover:text-white hover:scale-[1.02]"
                    >
                      {user.role}
                    </button>
                  ))}

                </div>

              </div>

              {/* SIGNUP */}
              <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-8">

                Don&apos;t have an account?{' '}

                <a
                  href="/signup"
                  className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent hover:opacity-80"
                >
                  Sign up
                </a>

              </p>

            </div>

          </Card>

          {/* FEATURE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

            {[
              {
                title: 'Real-time Tracking',
                desc: 'Monitor orders in real time',
              },
              {
                title: 'Smart Matching',
                desc: 'AI-powered supplier matching',
              },
              {
                title: 'Secure Payments',
                desc: 'Multiple payment options',
              },
              {
                title: '24/7 Support',
                desc: 'Round-the-clock assistance',
              },
            ].map((feature) => (

              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/20 dark:bg-white/10 backdrop-blur-xl p-4 shadow-lg"
              >

                {/* MIRROR SHINE */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/5 pointer-events-none" />

                <div className="relative z-10">

                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {feature.desc}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}