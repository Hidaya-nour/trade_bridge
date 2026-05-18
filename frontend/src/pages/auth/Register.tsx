import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <CardHeader className="bg-white px-8 py-6">
          <CardTitle className="text-3xl font-semibold text-slate-900 text-center">
            Create Account
          </CardTitle>
          <p className="text-sm text-slate-500 text-center mt-1">
            Join TradeBridge today
          </p>
        </CardHeader>
        
        <CardContent className="bg-slate-50 px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Global Store Validation Error */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Local Password Mismatch Error */}
            {passwordError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                {passwordError}
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
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
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
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
              />
            </div>

            {/* Role Select Dropdown */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="retailer">Retailer</option>
                <option value="distributor">Distributor</option>
                <option value="factory">Factory</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <label htmlFor="agreeTerms" className="leading-tight select-none">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
              <Link to="/" className="text-blue-600 hover:underline">
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