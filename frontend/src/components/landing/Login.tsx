// Login.tsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { WelcomeHeader } from "@/components/shared/WelcomeHeader";
import { PageBackground } from "@/components/shared/PageBackground";
import LoginForm from "./auth/LoginForm";
import tradebridgeLogo from "@/assets/image/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const location = useLocation();
  const successMessage =
    typeof location.state === "object" && location.state
      ? (location.state as { message?: string }).message
      : undefined;

  const displayError = useMemo(() => error ?? undefined, [error]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (data: { email: string; password: string }) => {
    clearError();
    if (!data.email || !data.password) return;

    try {
      await login(data.email, data.password);

      const user = useAuthStore.getState().user;
      if (!user) return;

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
    } catch (e) {
      // store error is shown in UI
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 overflow-hidden">
      <PageBackground />
      <div className="relative z-10 w-full max-w-[1100px] min-h-[640px] bg-white rounded-[22px] shadow-[0_20px_70px_rgba(20,40,80,0.14)] overflow-hidden flex flex-col md:flex-row">
        {/* Left illustration panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-primary to-primary/80 text-white relative items-center justify-center px-10 py-12">
          <div className="space-y-6 max-w-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">
              TradeBridge
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              New ways to connect retailers, distributors & factories.
            </h2>
            <p className="text-sm text-blue-100">
              Manage orders, inventory, and logistics in one collaborative
              platform designed for modern supply chains.
            </p>
          </div>
        </div>

        {/* Right login panel */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={tradebridgeLogo}
              alt="TradeBridge Logo"
              className="h-20 object-contain drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          <WelcomeHeader
            user={{
              name: "",
              business: "",
              id: "",
              role: "login",
              verified: false,
            }}
            variant="login"
          />

          <div className="mt-8">
            {successMessage && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {displayError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {displayError}
              </div>
            )}

            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={undefined}
            />

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
