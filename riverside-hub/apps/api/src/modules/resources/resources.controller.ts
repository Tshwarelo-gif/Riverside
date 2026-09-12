import { Request, Response } from "express";
import { createResourceSchema, updateResourceSchema } from "@riverside/shared";
import { createClient } from "@supabase/supabase-js";

// Anonymous (anon-key, no user session) client for public reads.
// Safe because the "resources_select_all" RLS policy allows select for
// everyone regardless of auth state — visitors can browse what's
// bookable before creating an account.
const anonClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * GET /api/resources
 * Public — no auth required.
 */
export async function listResources(_req: Request, res: Response) {
  const { data, error } = await anonClient
    .from("resources")
    .select()
    .eq("is_active", true)
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ resources: data.map(toResourceResponse) });
}

/**
 * GET /api/resources/all
 * Staff/admin only — includes inactive resources so they can be
 * reactivated (the public endpoint above deliberately hides these).
 */
export async function listAllResourcesForStaff(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await req.supabase
    .from("resources")
    .select()
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ resources: data.map(toResourceResponse) });
}

/**
 * POST /api/resources
 * Staff/admin only (enforced by requireStaff middleware AND RLS).
 */
export async function createResource(req: Request, res: Response) {
  const parsed = createResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await req.supabase
    .from("resources")
    .insert({
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description ?? null,
      capacity: parsed.data.capacity,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ resource: toResourceResponse(data) });
}

/**
 * PATCH /api/resources/:id
 * Staff/admin only.
 */
export async function updateResource(req: Request, res: Response) {
  const parsed = updateResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.type !== undefined) updates.type = parsed.data.type;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.capacity !== undefined) updates.capacity = parsed.data.capacity;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const { data, error } = await req.supabase
    .from("resources")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ error: error?.message ?? "Update failed" });
  }
  return res.json({ resource: toResourceResponse(data) });
}

function toResourceResponse(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    capacity: row.capacity,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
