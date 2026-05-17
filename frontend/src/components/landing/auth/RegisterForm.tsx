import { Button } from "@/components/ui/button"; // keep your shadcn/ui if using
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import Image from './assets/login-image.webp' // or use external URL
//import { AuthNavbar } from '@/components/layout/AuthNavbar'

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginEmail && loginPassword) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: loginEmail,
            role: "retailer",
          }),
        );
        navigate("/dashboard"); // or window.location.href if you prefer
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-[600px]">
            {/* Left Side - Image (same as before) */}
            <div className="hidden md:flex items-center justify-center relative">
              {/* Keep all your SVG zigzag borders, corner dots, and Image component here */}
              {/* ... (copy the entire left side div from your original code) ... */}
              <div className="relative w-full h-full flex items-center justify-center animate-float p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 rounded-3xl blur-2xl transform scale-95 animate-pulse-slow" />
                <div className="relative group h-full flex items-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login2-zxE2nxd5xYalqhR16AYpm3yRyDmPbl.webp"
                    alt="Secure authentication illustration"
                    className="w-auto h-full max-h-[600px] object-contain drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative flex items-center justify-center p-4">
              {/* Keep all zigzag SVGs for the form side if you want */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 w-full max-w-md animate-slide-in-right">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Sign In</h3>
                  <p className="text-gray-600 text-sm">
                    Sign in to your account
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email & Password fields - same as original */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 focus:border-purple-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-11 bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pr-10 focus:border-purple-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105"
                  >
                    {loading ? "Signing In..." : "SUBMIT"}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-purple-600 font-semibold hover:text-purple-700"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
