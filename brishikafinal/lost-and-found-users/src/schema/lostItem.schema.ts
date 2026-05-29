import { z } from "zod";

// Categories enum
export const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Accessories",
  "Documents",
  "Keys",
  "Wallets",
  "Bags",
  "Mobile Phones",
  "Laptops",
  "ID Cards",
  "Other",
] as const;

export type Category = (typeof categories)[number];

// Contact Info Schema
export const contactInfoSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{10,15}$/, {
      message: "Phone must be 10–15 digits and can include + - ()",
    })
    .optional()
    .nullable(),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .optional()
    .nullable(),
  preferredContact: z.enum(["phone", "email", "both"]).default("both"),
  showContact: z.boolean().default(true),
});

// // Specific Location Schema
// export const specificLocationSchema = z.object({
//   building: z.string().optional().nullable(),
//   floor: z
//     .number()
//     .min(-10, { message: "Floor cannot be less than -10" })
//     .max(100, { message: "Floor cannot be greater than 100" })
//     .optional()
//     .nullable(),
//   room: z.string().optional().nullable(),
//   landmark: z.string().optional().nullable(),
//   coordinates: z.tuple([z.number(), z.number()]).optional().nullable(),
// });

// Create Schema
export const createLostItemSchema = z.object({
  itemName: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name cannot exceed 100 characters" })
    .trim(),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(2000, { message: "Description cannot exceed 2000 characters" })
    .trim(),
  category: z.enum(categories, {
    message: "Please select a valid category",
  }),
  subCategory: z.string().optional().nullable(),
  status: z.enum(["lost", "found"]).default("lost"),
  locationDescription: z
    .string()
    .min(1, { message: "Location description is required" })
    .trim(),
  zoneId: z.string().optional().nullable(),
  // specificLocation: specificLocationSchema.optional().nullable(),
  dateLost: z.string().optional().nullable(),
  dateFound: z.string().optional().nullable(),
  contactInfo: contactInfoSchema.optional(),
  tags: z.array(z.string()).default([]),
});

// Update Schema (all fields optional)
export const updateLostItemSchema = createLostItemSchema.partial();

// Types
export type CreateLostItemInput = z.infer<typeof createLostItemSchema>;
export type UpdateLostItemInput = z.infer<typeof updateLostItemSchema>;
