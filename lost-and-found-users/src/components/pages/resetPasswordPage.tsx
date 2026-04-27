import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Lock } from "lucide-react";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPassword = useResetPassword(token!);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword.mutateAsync({ newPassword: data.newPassword });
    } catch (error) {
      console.log(error);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-0 space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-8 w-8"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Reset password</CardTitle>
          </div>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-0 space-y-3">
              {/* New Password Field */}
              <Field orientation="vertical" className="gap-0 space-y-1">
                <FieldLabel
                  htmlFor="newPassword"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    errors.newPassword ? "text-red-500" : "text-foreground"
                  }`}
                >
                  <Lock
                    className={`h-4 w-4 ${
                      errors.newPassword
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register("newPassword")}
                    aria-invalid={!!errors.newPassword}
                    disabled={isSubmitting || resetPassword.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <FieldError className="flex items-center gap-1 text-xs text-red-500">
                    {errors.newPassword.message}
                  </FieldError>
                )}
              </Field>

              {/* Confirm Password Field */}
              <Field orientation="vertical" className="gap-0 space-y-1">
                <FieldLabel
                  htmlFor="confirmPassword"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    errors.confirmPassword ? "text-red-500" : "text-foreground"
                  }`}
                >
                  <Lock
                    className={`h-4 w-4 ${
                      errors.confirmPassword
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isSubmitting || resetPassword.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <FieldError className="flex items-center gap-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </FieldError>
                )}
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || resetPassword.isPending}
              >
                {isSubmitting || resetPassword.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Reset password"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
