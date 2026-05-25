import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import icons for the password visibility toggle
import { Eye, EyeOff } from "lucide-react";

import Logo from "@/assets/image/logo.png";

const roleDashboard = {
  retailer: "/retailer/dashboard",
  distributor: "/distributor/dashboard",
  factory: "/factory/dashboard",
  driver: "/driver/dashboard",
  admin: "/admin/dashboard",
} as const;

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as { message?: string } | null;
  
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(
    locationState?.message ?? null
  );

  const { login, isLoading, error, clearError, accountBlocked } = useAuthStore();
  const navigate = useNavigate();

  // Wipe stale error alerts on component mount and location path transitions
  useEffect(() => {
    clearError();
  }, [clearError, location.pathname]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setMessage(null);

    try {
      const { user } = await login(credentials.email, credentials.password);
      const redirectPath = roleDashboard[user.role] ?? "/";
      
      // Execute microtask deferred transition to avoid React race-conditions with LocalStorage
      window.queueMicrotask(() => {
        navigate(redirectPath, { replace: true });
      });
    } catch (err) {
      console.error("Authentication submission rejected:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-8 antialiased">
      <Card className="w-full max-w-md shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 ring-1 ring-black/[0.05]">
        <CardHeader className="bg-white px-8 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt="Company logo"
              className="h-16 w-auto object-contain transition-transform duration-200 hover:scale-105"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
            Sign in to your account
          </CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            Welcome back! Please enter your credentials
          </p>
        </CardHeader>
        
        <CardContent className="bg-white px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* System Info Flash Messages */}
            {message && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-1">
                {message}
              </div>
            )}
            
            {/* Account Status Blocks (Priority Banner) */}
            {accountBlocked ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 animate-in fade-in slide-in-from-top-1">
                {accountBlocked.message}
              </div>
            ) : (
              /* Fallback Validation Errors */
              error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1} // Keeps keyboard navigation clean
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dynamic-disabled transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm transition-all duration-200 transform active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </Button>

            {/* Footer Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 pt-3 border-t border-slate-100 mt-5">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors">
                  Create one
                </Link>
              </p>
              <Link to="/" className="text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors">
                Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;