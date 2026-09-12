import { z } from "zod";

export const memberRoleSchema = z.enum(["member", "staff", "admin"]);

// Fields a member can supply on self-registration.
// role/joined_at/is_active are server-controlled, never client input.
export const registerMemberSchema = z.object({
  fullName: z.string().min(2, "Full name is too short").max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
});

// Fields a member can update on their own profile.
export const updateMemberSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(20).optional(),
});

// Full member record as returned by the API.
export const memberSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  role: memberRoleSchema,
  joinedAt: z.string().datetime(),
  isActive: z.boolean(),
});

export type MemberRole = z.infer<typeof memberRoleSchema>;
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type Member = z.infer<typeof memberSchema>;
