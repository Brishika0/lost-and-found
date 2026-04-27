import { z } from "zod";

// Base schema for common fields
const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  collegeId: z.string().min(1, "College is required"),
  isActive: z.boolean().optional().default(true),
  avatar: z.string().optional(),
});

// For CREATE - includes password
export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// For UPDATE - password is optional, role cannot be changed
export const updateUserSchema = baseUserSchema.partial().extend({
  // All fields optional for update
  chatPrivacy: z
    .object({
      allowMessagesFrom: z
        .enum(["everyone", "verified_only", "nobody"])
        .optional(),
      showReadReceipts: z.boolean().optional(),
    })
    .optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      matches: z.boolean().optional(),
      messages: z.boolean().optional(),
      comments: z.boolean().optional(),
    })
    .optional(),
});

// For API responses
export const userResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["super_admin", "college_admin", "student"]),
  collegeId: z
    .object({
      _id: z.string(),
      name: z.string(),
      shortName: z.string(),
      domain: z.string(),
      logo: z
        .object({
          url: z.string(),
          publicId: z.string().optional(),
        })
        .optional(),
    })
    .nullable(),
  avatar: z.string().optional().nullable(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  lastActive: z.string().optional(),
  chatPrivacy: z
    .object({
      allowMessagesFrom: z.enum(["everyone", "verified_only", "nobody"]),
      showReadReceipts: z.boolean(),
    })
    .optional(),
  notificationPreferences: z
    .object({
      email: z.boolean(),
      push: z.boolean(),
      matches: z.boolean(),
      messages: z.boolean(),
      comments: z.boolean(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
