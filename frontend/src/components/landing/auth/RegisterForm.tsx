// RegisterForm.tsx - NOW 100% REUSABLE COMPONENTS ONLY!
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LandingButton,
  LandingCheckbox,
  LandingInput,
  LandingSelect,
} from "../shared";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "retailer" | "distributor" | "factory" | "driver";
  agreeTerms: boolean;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
}

const RegisterForm = ({ onSubmit, isLoading = false }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "retailer",
    agreeTerms: false,
  });

  const [passwordError, setPasswordError] = useState<string>("");

  const roleOptions = [
    { value: "retailer", label: "Retailer" },
    { value: "distributor", label: "Distributor" },
    { value: "factory", label: "Factory" },
    { value: "driver", label: "Driver" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

  return (
    <>
      <LandingInput
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
        placeholder="John Doe"
      />

      <LandingInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="you@example.com"
      />

      <LandingSelect
        label="I am a"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
      />

      <LandingInput
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="••••••••"
      />

      <LandingInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        error={passwordError}
        placeholder="••••••••"
      />

      <LandingCheckbox
        name="agreeTerms"
        checked={formData.agreeTerms}
        onChange={handleChange}
        required
        label={
          <>
            I agree to the{" "}
            <Link to="/terms" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </Link>
          </>
        }
      />

      <LandingButton
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </LandingButton>
    </>
  );
};

export default RegisterForm;
