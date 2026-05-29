import { AuthForm } from "./authForm";
import { useRegister } from "@/hooks/useAuth";

export function RegisterForm() {
  const register = useRegister();

  const handleRegister = async (values: any) => {
    try {
      await register.mutateAsync(values);
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

  return (
    <AuthForm
      mode="register"
      onSubmit={handleRegister}
      isLoading={register.isPending}
    />
  );
}
