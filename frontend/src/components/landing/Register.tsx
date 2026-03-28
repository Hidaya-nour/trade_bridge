// Register.tsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import AuthForm from "./auth/AuthForm";
import RegisterForm from "./auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, clearError } = useAuthStore();

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "retailer" | "distributor" | "factory" | "driver";
    agreeTerms: boolean;
  }) => {
    clearError();

    await register({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      role: data.role,
      phone: "",
      business_name: "",
    });

    navigate("/login");
  };

  return (
    <AuthForm
      title="Create Account"
      subtitle="Join TradeBridge today"
      alternateText="Already have an account?"
      alternateLinkText="Sign in"
      alternateLinkTo="/login"
    >
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </AuthForm>
  );
};

export default Register;