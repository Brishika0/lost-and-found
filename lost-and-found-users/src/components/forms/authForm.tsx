import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/schema";
import { ForgotPasswordDialog } from "../dialogs/forgotPasswordDialog";
import { Link } from "react-router-dom";

// Combined type for both forms
type AuthFormData = LoginFormData | RegisterFormData;

// Props for the reusable component
interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (values: AuthFormData) => Promise<void>;
  isLoading?: boolean;
}

// Schema selector based on mode
const getSchema = (mode: "login" | "register") => {
  return mode === "login" ? loginSchema : registerSchema;
};

// Title and description based on mode
const getTitle = (mode: "login" | "register") => {
  return mode === "login" ? "Welcome Back" : "Create an Account";
};

const getDescription = (mode: "login" | "register") => {
  return mode === "login"
    ? "Please enter your credentials to sign in to your account"
    : "Please fill in the details to create your account";
};

const getButtonText = (mode: "login" | "register", isSubmitting: boolean) => {
  if (mode === "login") {
    return isSubmitting ? "Signing in..." : "Sign in";
  } else {
    return isSubmitting ? "Creating account..." : "Create account";
  }
};

const getNavigationLink = (mode: "login" | "register") => {
  return mode === "login" ? (
    <p className="flex gap-1 text-sm text-gray-600">
      <span>New to platform</span>
      <Link
        to="/register"
        className="text-black/90 hover:text-black hover:underline"
      >
        Register
      </Link>
    </p>
  ) : (
    <p className="flex gap-1 text-sm text-gray-600">
      <span>Already Have an account?</span>
      <Link
        to="/login"
        className="text-black/90 hover:text-black hover:underline"
      >
        Login
      </Link>
    </p>
  );
};

export function AuthForm({
  mode,
  onSubmit,
  isLoading: externalLoading,
}: AuthFormProps) {
  const { isLoading: authLoading } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const isLoading = externalLoading || authLoading;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(getSchema(mode)),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "register" && { name: "", confirmPassword: "" }),
    },
  });

  return (
    <Card className="w-full max-w-md gap-0 space-y-4 border-0 p-4 shadow-2xl sm:border md:w-full">
      <CardTitle className="mb-0 text-center text-2xl">
        {getTitle(mode)}
      </CardTitle>
      <CardDescription className="text-muted-foreground text-center text-xs">
        {getDescription(mode)}
      </CardDescription>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-0 space-y-4">
          {/* Name Field - Only for Register */}
          {mode === "register" && (
            <Field orientation="vertical" className="gap-0 space-y-0.5">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel
                  htmlFor="name"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    (errors as any).name ? "text-red-500" : "text-foreground"
                  }`}
                >
                  <User
                    className={`h-4 w-4 ${
                      (errors as any).name
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  Full Name
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-10"
                  {...register("name")}
                  aria-invalid={!!(errors as any).name}
                  disabled={isSubmitting || isLoading}
                />
              </FieldGroup>
              {(errors as any).name && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {(errors as any).name.message}
                </FieldError>
              )}
            </Field>
          )}

          {/* Email Field */}
          <Field orientation="vertical" className="gap-0 space-y-0.5">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel
                htmlFor="email"
                className={`flex items-center gap-2 text-sm font-medium ${
                  errors.email ? "text-red-500" : "text-foreground"
                }`}
              >
                <Mail
                  className={`h-4 w-4 ${
                    errors.email ? "text-red-500" : "text-muted-foreground"
                  }`}
                />
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="student@college.edu.np"
                className="h-10"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={isSubmitting || isLoading}
              />
            </FieldGroup>
            {errors.email && (
              <FieldError className="flex items-center justify-end text-xs text-red-500">
                {errors.email.message}
              </FieldError>
            )}
          </Field>

          <div className="flex flex-col items-end gap-0.5">
            {/* Password Field */}
            <Field orientation="vertical" className="w-full gap-0 space-y-0.5">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel
                  htmlFor="password"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    errors.password ? "text-red-500" : "text-foreground"
                  }`}
                >
                  <Lock
                    className={`h-4 w-4 ${
                      errors.password ? "text-red-500" : "text-muted-foreground"
                    }`}
                  />
                  Password
                </FieldLabel>
              </FieldGroup>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  disabled={isSubmitting || isLoading}
                />
                <Button
                  variant="ghost"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  type="button"
                  className="absolute right-1 cursor-pointer p-0 hover:bg-transparent"
                  size="icon"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <Eye className="text-muted-foreground h-5 w-5" />
                  )}
                </Button>
              </div>

              {errors.password && (
                <FieldError className="flex items-center justify-end gap-1 text-xs text-red-500">
                  {errors.password.message}
                </FieldError>
              )}
            </Field>

            {/* Confirm Password Field - Only for Register */}
            {mode === "register" && (
              <Field
                orientation="vertical"
                className="w-full gap-0 space-y-0.5"
              >
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="confirmPassword"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      (errors as any).confirmPassword
                        ? "text-red-500"
                        : "text-foreground"
                    }`}
                  >
                    <Lock
                      className={`h-4 w-4 ${
                        (errors as any).confirmPassword
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    Confirm Password
                  </FieldLabel>
                </FieldGroup>
                <div className="relative flex items-center">
                  <Input
                    id="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pr-10"
                    {...register("confirmPassword")}
                    aria-invalid={!!(errors as any).confirmPassword}
                    disabled={isSubmitting || isLoading}
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                    type="button"
                    className="absolute right-1 cursor-pointer p-0 hover:bg-transparent"
                    size="icon"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="text-muted-foreground h-5 w-5" />
                    ) : (
                      <Eye className="text-muted-foreground h-5 w-5" />
                    )}
                  </Button>
                </div>

                {(errors as any).confirmPassword && (
                  <FieldError className="flex items-center justify-end gap-1 text-xs text-red-500">
                    {(errors as any).confirmPassword.message}
                  </FieldError>
                )}
              </Field>
            )}

            {/* Forgot Password Link - Only for Login */}
            {mode === "login" && <ForgotPasswordDialog />}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="mt-2 w-full"
            size="lg"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {getButtonText(mode, true)}
              </>
            ) : (
              getButtonText(mode, false)
            )}
          </Button>

          <div className="flex items-center justify-center">
            {getNavigationLink(mode)}
          </div>
        </FieldGroup>
      </form>
    </Card>
  );
}
