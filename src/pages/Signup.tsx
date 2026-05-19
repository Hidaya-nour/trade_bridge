import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const navigate = useNavigate()
  const { register, user, isLoading: authLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard')
    }
  }, [user, authLoading, navigate])

  const checkStrength = (password: string) => {
    let score = 0

    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return 'Weak'
    if (score <= 4) return 'Medium'
    return 'Strong'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!role) return setError('Please select a role')

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    setIsLoading(true)

    try {
      await register(name, email, password, role)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roles = ['Retailer', 'Factory', 'Distributor', 'Driver']

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 dark:from-[#06121f] dark:via-[#0a1b2f] dark:to-[#08111d]">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-blue-400/30 rounded-full blur-3xl animate-pulse" />

        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-300/30 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />

      </div>

      {/* HEADER */}
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
      <div className="relative z-10 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* GLASS CARD */}
          <Card className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/20 dark:bg-white/10 backdrop-blur-2xl shadow-2xl p-8">

            {/* MIRROR SHINE */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none" />

            {/* TOP GLOW */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-300/30 rounded-full blur-3xl" />

            {/* CONTENT */}
            <div className="relative z-10">

              {/* TITLE */}
              <div className="text-center mb-8">

                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                  Create{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                    Account
                  </span>
                </h2>

                <p className="text-gray-700 dark:text-gray-300">
                  Join TradeBridge today
                </p>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 backdrop-blur-md p-4 border border-red-400/30">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* NAME */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Full Name
                  </label>

                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Email
                  </label>

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="h-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                  />
                </div>

                {/* ROLE */}
                <div>

                  <label className="block text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    Select Role
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {roles.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-2xl py-3 text-sm font-medium transition-all duration-300 border backdrop-blur-md ${
                          role === r
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-300 shadow-lg scale-[1.02]'
                            : 'bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-white/20 hover:bg-white/30'
                        }`}
                      >
                        {r}
                      </button>
                    ))}

                  </div>

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Password
                  </label>

                  <div className="relative">

                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value
                        setPassword(value)
                        setPasswordStrength(checkStrength(value))
                      }}
                      placeholder="Enter password"
                      className="h-12 pr-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {/* PASSWORD STRENGTH */}
                  {password && (
                    <div className="mt-3">

                      <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">

                        <div
                          className={`h-full transition-all duration-500 ${
                            passwordStrength === 'Weak'
                              ? 'w-1/3 bg-red-500'
                              : passwordStrength === 'Medium'
                              ? 'w-2/3 bg-yellow-400'
                              : 'w-full bg-green-500'
                          }`}
                        />

                      </div>

                      <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">
                        Strength:{' '}
                        <span className="font-semibold">
                          {passwordStrength}
                        </span>
                      </p>

                    </div>
                  )}

                </div>

                {/* CONFIRM PASSWORD */}
                <div>

                  <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="h-12 pr-12 rounded-2xl border-white/30 bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* BUTTON */}
                <Button
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white text-lg font-semibold hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>

              </form>

              {/* LOGIN */}
              <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-8">
                Already have an account?{' '}
                <a
                  href="/Login"
                  className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent hover:opacity-80"
                >
                  Sign in
                </a>
              </p>

            </div>

          </Card>

        </div>

      </div>

    </div>
  )
}