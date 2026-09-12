import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  createDonationSchema,
  updateDonationStatusSchema,
} from "@riverside/shared";
import { createUserScopedClient } from "../../db/supabase.js";

const anonClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * GET /api/donations
 * Authenticated only. RLS filters to "own donations" for members and
 * "all donations" for staff/admin — same pattern as bookings.
 */
export async function listDonations(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await req.supabase
    .from("donations")
    .select()
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ donations: data.map(toDonationResponse) });
}

/**
 * POST /api/donations
 *
 * Works two ways:
 *  - Logged in: Authorization header present, donation is linked to the
 *    member (member_id = self), via the RLS-scoped client.
 *  - Anonymous/guest: no Authorization header at all, donation is
 *    unlinked (member_id null) and requires a donor name, via the anon
 *    client — this route intentionally does NOT go through requireAuth,
 *    since the whole point is that donating shouldn't require an account.
 */
export async function createDonation(req: Request, res: Response) {
  const parsed = createDonationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const authHeader = req.headers.authorization;
  const { donorName, donorContact, type, amount, itemDescription } = parsed.data;

  const payload = {
    donor_name: donorName ?? null,
    donor_contact: donorContact ?? null,
    type,
    amount: amount ?? null,
    item_description: itemDescription ?? null,
  };

  if (authHeader?.startsWith("Bearer ")) {
    // Reuse requireAuth's logic inline rather than as middleware, since
    // this route must also work with NO auth header at all.
    const token = authHeader.slice("Bearer ".length);
    const userClient = createUserScopedClient(token);
    const { data: userData, error: userError } = await userClient.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data, error } = await userClient
      .from("donations")
      .insert({ ...payload, member_id: userData.user.id })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ donation: toDonationResponse(data) });
  }

  // Anonymous path — require a name so staff have something to work with.
  if (!donorName) {
    return res.status(400).json({
      error: "donorName is required for anonymous (non-member) donations",
    });
  }

  const { data, error } = await anonClient
    .from("donations")
    .insert({ ...payload, member_id: null })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ donation: toDonationResponse(data) });
}

/**
 * PATCH /api/donations/:id/status
 * Staff/admin only — marks a donation received or allocated.
 */
export async function updateDonationStatus(req: Request, res: Response) {
  const parsed = updateDonationStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const updates: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "received") {
    updates.received_at = new Date().toISOString();
  }

  const { data, error } = await req.supabase
    .from("donations")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ error: error?.message ?? "Update failed" });
  }
  return res.json({ donation: toDonationResponse(data) });
}

function toDonationResponse(row: any) {
  return {
    id: row.id,
    memberId: row.member_id,
    donorName: row.donor_name,
    donorContact: row.donor_contact,
    type: row.type,
    amount: row.amount,
    itemDescription: row.item_description,
    status: row.status,
    receivedAt: row.received_at,
    createdAt: row.created_at,
  };
}
