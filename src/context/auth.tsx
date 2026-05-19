import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'retailer' | 'factory' | 'distributor' | 'driver' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company: string
  avatar?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string, name: string, role: UserRole, company: string) => Promise<void>
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking if user is logged in
    const storedUser = localStorage.getItem('tradebridge_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate login
    const mockUser: User = {
      id: '1',
      name: 'John Retailer',
      email,
      role: 'retailer',
      company: 'Premium Retail Shop',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
    }
    setUser(mockUser)
    localStorage.setItem('tradebridge_user', JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tradebridge_user')
  }

  const signup = async (email: string, password: string, name: string, role: UserRole, company: string) => {
    // Simulate signup
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      company,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
    }
    setUser(mockUser)
    localStorage.setItem('tradebridge_user', JSON.stringify(mockUser))
  }

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role }
      setUser(updatedUser)
      localStorage.setItem('tradebridge_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
