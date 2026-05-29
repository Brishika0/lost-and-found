import { z } from "zod";

// Base schema without logo validation
const baseCollegeSchema = z.object({
  name: z
    .string()
    .min(3, "College name must be at least 3 characters")
    .max(100),

  shortName: z
    .string()
    .min(2, "Short name must be at least 2 characters")
    .max(20),

  domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.edu\.np$/,
      "Domain must end with .edu.np",
    ),

  // LOCATION OBJECT
  location: z.object({
    address: z.string().min(1, "Address required"),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    coordinates: z
      .array(z.number())
      .length(2, "Coordinates must be [lng, lat]"),
  }),

  // CONTACT INFO OBJECT
  contactInfo: z.object({
    email: z.string().email("Invalid email"),
    phone: z.string().min(10),
    website: z.string().url("Invalid website URL"),
  }),
});

// For CREATE - logo must be a File
export const createCollegeSchema = baseCollegeSchema.extend({
  logo: z
    .instanceof(File, { message: "Logo image is required" })
    .refine(
      (file) =>
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type),
      "Only JPEG, PNG, GIF, and WebP images are allowed",
    ),
});

// For UPDATE - logo can be File or existing image object
export const updateCollegeSchema = baseCollegeSchema.extend({
  logo: z
    .union([
      z.instanceof(File),
      z.object({
        url: z.string().url("Valid image URL required"),
        publicId: z.string(),
      }),
    ])
    .optional(),
});

// For API responses - logo is always an object
export const collegeResponseSchema = baseCollegeSchema.extend({
  logo: z.object({
    url: z.string().url("Valid image URL required"),
    publicId: z.string(),
  }),
  _id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type CollegeFormData = z.infer<typeof baseCollegeSchema>;
export type CreateCollegeFormData = z.infer<typeof createCollegeSchema>;
export type UpdateCollegeFormData = z.infer<typeof updateCollegeSchema>;
export type CollegeResponse = z.infer<typeof collegeResponseSchema>;
