import { z } from "zod";
import { ZONE_TYPE_OPTIONS } from "@/types/zone.types";

export const createZoneSchema = z.object({
  name: z
    .string()
    .min(1, "Zone name is required")
    .max(100, "Zone name cannot exceed 100 characters")
    .trim(),

  type: z.enum(
    ZONE_TYPE_OPTIONS.map((opt) => opt.value) as [string, ...string[]],
    { message: "Please select a zone type" },
  ),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  location: z.object({
    coordinates: z
      .tuple([z.number(), z.number()])
      .refine((coords) => coords[0] >= -180 && coords[0] <= 180, {
        message: "Longitude must be between -180 and 180",
      })
      .refine((coords) => coords[1] >= -90 && coords[1] <= 90, {
        message: "Latitude must be between -90 and 90",
      }),
    address: z.string().optional(),
  }),

  building: z
    .string()
    .max(100, "Building name cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),

  floor: z
    .number()
    .min(-10, "Floor must be at least -10")
    .max(200, "Floor cannot exceed 200")
    .optional(),

  roomNumbers: z.array(z.string()).default([]),

  isIndoor: z.boolean().default(true),

  tags: z.array(z.string()).default([]),

  parentZoneId: z.string().optional(),

  collegeId: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid college ID format",
    }),
});

export const updateZoneSchema = createZoneSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
