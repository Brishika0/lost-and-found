import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "./authForm";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    try {
      const result = await login(values);
      navigate("/");
    } catch (error: any) {
      console.log(error);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}
