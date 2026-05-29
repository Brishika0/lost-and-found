import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  totp: z
    .string()
    .length(6, "TOTP must be exactly 6 digits")
    .regex(/^\d+$/, "TOTP must contain only numbers"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
