import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */
interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "retailer" | "distributor" | "factory" | "driver";
  agreeTerms: boolean;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "retailer",
    agreeTerms: false,
  });

  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    clearError();
  }, [clearError, location.pathname]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setPasswordError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: formData.role,
        phone: "",
        business_name: "",
      });

      const needsApproval =
        formData.role === "factory" || formData.role === "distributor";

      navigate("/login", {
        state: {
          message: needsApproval
            ? "Registration successful. Please upload your business license for admin approval."
            : "Registration successful.",
        },
      });
    } catch {
      // Error state is handled automatically by the auth store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-12 antialiased">
      <Card className="w-full max-w-md shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 ring-1 ring-black/[0.05]">
        <CardHeader className="bg-white px-8 pt-8 pb-4 text-center">
          <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Account
          </CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            Join TradeBridge today
          </p>
        </CardHeader>
        
        <CardContent className="bg-white px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Global Store Validation Error */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* Local Password Mismatch Error */}
            {passwordError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 animate-in fade-in slide-in-from-top-1">
                {passwordError}
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              />
            </div>

            {/* Role Select Dropdown */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">
                I am a
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-slate-900 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em_1em]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e")`
                  }}
                >
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                  <option value="factory">Factory</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
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

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 text-sm text-slate-600 pt-1">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="agreeTerms" className="leading-normal select-none cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-200 transform active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 pt-3 border-t border-slate-100 mt-5">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Sign in
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

export default RegisterPage;