import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import your logo - adjust the path according to your project structure
// If you're using Vite with SVGR, you might want: import { ReactComponent as Logo } from "../../assets/logo.svg";
// For plain image assets, use:
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-0">
        <CardHeader className="bg-white px-8 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt="Company logo"
              className="h-16 w-auto object-contain transition-transform duration-200 hover:scale-105"
            />
          </div>
          <CardTitle className="text-3xl font-semibold text-slate-900 tracking-tight">
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
                className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 transform active:scale-[0.98]"
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

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 pt-2 border-t border-slate-100 mt-4">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Create one
                </Link>
              </p>
              <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
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