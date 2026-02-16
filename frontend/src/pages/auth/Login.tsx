import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ THIS IS CRITICAL - prevents page reload
    setLocalError("");
    clearError();

    // Basic validation
    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      await login(email, password);

      // Get user from store after successful login
      const user = useAuthStore.getState().user;
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case "retailer":
            navigate("/retailer/dashboard");
            break;
          case "distributor":
            navigate("/distributor/dashboard");
            break;
          case "factory":
            navigate("/factory/dashboard");
            break;
          case "driver":
            navigate("/driver/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (err) {
      // Error is already in store
      console.error("Login error:", err);
    }
  };

  // Combine local error and store error
  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login to TradeBridge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {displayError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{displayError}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline text-xs"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
