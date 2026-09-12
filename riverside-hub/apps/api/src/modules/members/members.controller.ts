import { Request, Response } from "express";
import { registerMemberSchema, updateMemberSchema } from "@riverside/shared";

/**
 * POST /api/members/register
 *
 * Called right after the client completes Supabase Auth sign-up.
 * The auth user already exists (req.user); this creates the matching
 * members profile row. Runs through requireAuth but NOT
 * requireMemberProfile, since the profile doesn't exist yet.
 */
export async function registerMember(req: Request, res: Response) {
  const parsed = registerMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { fullName, phone } = parsed.data;

  const { data, error } = await req.supabase
    .from("members")
    .insert({
      id: req.user.id,
      full_name: fullName,
      email: req.user.email,
      phone: phone ?? null,
    })
    .select()
    .single();

  if (error) {
    // Most common case: profile already exists for this user.
    return res.status(409).json({ error: error.message });
  }

  return res.status(201).json({ member: toMemberResponse(data) });
}

/**
 * GET /api/members/me
 */
export async function getMyProfile(req: Request, res: Response) {
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { data, error } = await req.supabase
    .from("members")
    .select()
    .eq("id", req.user.id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Member profile not found" });
  }
  return res.json({ member: toMemberResponse(data) });
}

/**
 * PATCH /api/members/me
 */
export async function updateMyProfile(req: Request, res: Response) {
  const parsed = updateMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) updates.full_name = parsed.data.fullName;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;

  const { data, error } = await req.supabase
    .from("members")
    .update(updates)
    .eq("id", req.user.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ error: error?.message ?? "Update failed" });
  }
  return res.json({ member: toMemberResponse(data) });
}

// Maps a snake_case DB row to the camelCase shape defined by memberSchema.
function toMemberResponse(row: any) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    joinedAt: row.joined_at,
    isActive: row.is_active,
  };
}
