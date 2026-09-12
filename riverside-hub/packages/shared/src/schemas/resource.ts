import { z } from "zod";

export const resourceTypeSchema = z.enum(["room", "equipment", "gym_slot"]);

export const createResourceSchema = z.object({
  name: z.string().min(2).max(120),
  type: resourceTypeSchema,
  description: z.string().max(500).optional(),
  capacity: z.number().int().positive(),
});

export const updateResourceSchema = createResourceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const resourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: resourceTypeSchema,
  description: z.string().nullable(),
  capacity: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type Resource = z.infer<typeof resourceSchema>;
