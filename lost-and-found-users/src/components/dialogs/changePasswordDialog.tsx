// components/dialogs/ChangePasswordDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode;
}

export function ChangePasswordDialog({ trigger }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      reset();
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your password to keep your account secure
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-0 space-y-3 py-2">
            {/* Current Password Field */}
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldLabel
                htmlFor="currentPassword"
                className={`flex items-center gap-2 text-sm font-medium ${
                  errors.currentPassword ? "text-red-500" : "text-foreground"
                }`}
              >
                <Lock
                  className={`h-4 w-4 ${
                    errors.currentPassword
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
                Current Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="pr-10"
                  {...register("currentPassword")}
                  aria-invalid={!!errors.currentPassword}
                  disabled={isSubmitting || changePassword.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <FieldError className="flex items-center gap-1 text-xs text-red-500">
                  {errors.currentPassword.message}
                </FieldError>
              )}
            </Field>

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
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pr-10"
                  {...register("newPassword")}
                  aria-invalid={!!errors.newPassword}
                  disabled={isSubmitting || changePassword.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
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

              {/* Password requirements indicator */}
              {newPassword && newPassword.length > 0 && (
                <div className="bg-muted/50 mt-2 space-y-1 rounded-lg p-3 text-xs">
                  <p className="mb-1 font-medium">Password requirements:</p>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        newPassword.length >= 8
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        /[A-Z]/.test(newPassword)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>One uppercase letter</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        /[a-z]/.test(newPassword)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>One lowercase letter</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        /[0-9]/.test(newPassword)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>One number</span>
                  </div>
                </div>
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
                Confirm New Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pr-10"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                  disabled={isSubmitting || changePassword.isPending}
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
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting || changePassword.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || changePassword.isPending}
            >
              {isSubmitting || changePassword.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
