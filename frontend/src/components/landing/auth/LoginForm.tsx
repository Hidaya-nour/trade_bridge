import { Link } from "react-router-dom";
import { useState } from "react";
import { LandingButton, LandingCheckbox, LandingInput } from "../shared";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.7-4.1 2.7-6.7 0-.6-.1-1.3-.2-1.9H12z"
    />
    <path
      fill="#34A853"
      d="M6.6 14.3 5.8 15.1 3 17.3C4.4 20 7 21.8 10.2 21.8c2.7 0 5-1 6.7-2.7l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.3z"
    />
    <path
      fill="#4A90E2"
      d="M3 6.7C2.3 8.2 2 9.8 2 11.5c0 1.7.3 3.3 1 4.8l3.6-2.8C6.3 13 6.1 12.3 6.1 11.5c0-.8.2-1.5.5-2.1z"
    />
    <path
      fill="#FBBC05"
      d="M10.2 5.2c1.5 0 2.9.5 3.9 1.5l2.9-2.9C15.2 2.3 12.9 1.5 10.2 1.5 7 1.5 4.4 3.3 3 6l3.6 2.8c.7-2.5 3.1-3.6 3.6-3.6z"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    className="h-5 w-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className="h-5 w-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d={
        isOpen
          ? "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          : "M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M9.88 9.88A3 3 0 0114.12 14.12M6.228 6.228A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 01-4.087 5.128M9.88 9.88L6.228 6.228M14.12 14.12l3.652 3.652M6.228 6.228A9.978 9.978 0 002.458 12c1.274 4.057 5.065 7 9.542 7 1.587 0 3.098-.37 4.448-1.028"
      }
    />
    {isOpen && (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    )}
  </svg>
);

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm = ({ onSubmit, isLoading = false, error }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          {error}
        </div>
      )}

      <LandingInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="you@example.com"
        suffix={<MailIcon />}
      />

      <div>
        <LandingInput
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon isOpen={showPassword} />
            </button>
          }
        />
        <div className="text-right mt-1">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-primary/800"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <LandingCheckbox
        name="rememberMe"
        checked={formData.rememberMe}
        onChange={handleChange}
        label="Remember me"
      />

      <div className="space-y-3">
        <LandingButton
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </LandingButton>

        <LandingButton type="button" variant="outline" fullWidth>
          <span className="flex items-center justify-center gap-2">
            <GoogleIcon />
            <span>Sign in with Google</span>
          </span>
        </LandingButton>
      </div>
    </form>
  );
};

export default LoginForm;
