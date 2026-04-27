import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { loginSchema, type LoginFormData } from "@/schema";

export function LoginForm() {
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting = isLoading },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      totp: "",
    },
  });

  const totpValue = watch("totp");

  const [isPasswordVisible, setIsPasswordVisible] = useState<Boolean>(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data);
      console.log("Login result", result);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md gap-0 space-y-4 border-0 p-4 shadow-2xl sm:border md:w-full">
      <CardTitle className="mb-0 text-center text-2xl">Welcome Back</CardTitle>
      <CardDescription className="text-muted-foreground text-center text-xs">
        Please enter your credentials to sign in to your account
      </CardDescription>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-0 space-y-4">
          {/* Email Field */}
          <Field orientation="vertical" className="gap-0 space-y-0.5">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel
                htmlFor="email"
                className={`flex items-center gap-2 text-sm font-medium ${errors.email ? "text-red-500" : "text-foreground"}`}
              >
                <Mail
                  className={`h-4 w-4 ${errors.email ? "text-red-500" : "text-muted-foreground"}`}
                />
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="h-10"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
              />
            </FieldGroup>
            {errors.email && (
              <FieldError className="flex items-center justify-end text-xs text-red-500">
                {errors.email.message}
              </FieldError>
            )}
          </Field>

          {/* Password Field */}
          <Field orientation="vertical" className="gap-0 space-y-0.5">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel
                htmlFor="password"
                className={`flex items-center gap-2 text-sm font-medium ${errors.password ? "text-red-500" : "text-foreground"}`}
              >
                <Lock
                  className={`h-4 w-4 ${errors.password ? "text-red-500" : "text-muted-foreground"}`}
                />
                Password
              </FieldLabel>
            </FieldGroup>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                className="h-10"
                {...register("password")}
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
              />
              <Button
                variant="ghost"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                type="button"
                className="absolute right-1 cursor-pointer p-0 hover:bg-transparent"
                size="icon"
              >
                {isPasswordVisible ? (
                  <Eye className="text-muted-foreground h-5 w-5" />
                ) : (
                  <EyeOff className="text-muted-foreground h-5 w-5" />
                )}
              </Button>
            </div>

            {errors.password && (
              <FieldError className="flex items-center justify-end gap-1 text-xs text-red-500">
                {errors.password.message}
              </FieldError>
            )}
          </Field>

          {/* TOTP Field */}
          <Field orientation="vertical" className="gap-0 space-y-0.5">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel
                htmlFor="totp"
                className={`flex items-center gap-2 text-sm font-medium ${errors.totp ? "text-red-500" : "text-foreground"}`}
              >
                <Shield
                  className={`h-4 w-4 ${errors.totp ? "text-red-500" : "text-muted-foreground"}`}
                />
                Two-Factor Authentication
              </FieldLabel>
              <InputOTP
                id="totp"
                maxLength={6}
                value={totpValue}
                onChange={(value) =>
                  setValue("totp", value, { shouldValidate: true })
                }
                disabled={isSubmitting}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-9 w-9" />
                  <InputOTPSlot index={1} className="h-9 w-9" />
                  <InputOTPSlot index={2} className="h-9 w-9" />
                </InputOTPGroup>
                <InputOTPSeparator className="text-muted-foreground" />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="h-9 w-9" />
                  <InputOTPSlot index={4} className="h-9 w-9" />
                  <InputOTPSlot index={5} className="h-9 w-9" />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription className="text-muted-foreground text-center text-xs sm:text-left">
                Enter the 6-digit code from your authenticator app
              </FieldDescription>
            </FieldGroup>
            {errors.totp && (
              <FieldError className="flex items-center justify-end gap-1 text-xs text-red-500">
                {errors.totp.message}
              </FieldError>
            )}
          </Field>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 mb-4"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </FieldGroup>
      </form>
    </Card>
  );
}
