// Register.tsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import AuthForm from "./auth/AuthForm";
import RegisterForm from "./auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "retailer" | "distributor" | "factory" | "driver";
    agreeTerms: boolean;
  }) => {
    clearError();
    if (!data.agreeTerms) return;

    try {
      await register({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: data.role,
        phone: "",
        business_name: "",
      });

      const needsApproval =
        data.role === "factory" || data.role === "distributor";

      navigate("/login", {
        state: {
          message: needsApproval
            ? "Registration successful. Please upload your business license for admin approval."
            : "Registration successful.",
        },
      });
    } catch (e) {
      // Error is handled by the auth store
    }
  };

  return (
    <AuthForm
      title="Create Account"
      subtitle="Join TradeBridge today"
      alternateText="Already have an account?"
      alternateLinkText="Sign in"
      alternateLinkTo="/login"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </AuthForm>
  );
};

export default Register;
