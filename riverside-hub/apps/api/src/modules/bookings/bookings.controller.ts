import { Request, Response } from "express";
import {
  createBookingSchema,
  reviewBookingSchema,
} from "@riverside/shared";
import { getServiceClient } from "../../db/supabase.js";

/**
 * GET /api/bookings
 *
 * Deliberately does no role branching here: the query runs through
 * req.supabase (RLS-scoped), so a member automatically gets only their
 * own bookings and staff/admin automatically get all of them — the
 * "bookings_select_own_or_staff" policy does the filtering, not this code.
 */
export async function listBookings(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await req.supabase
    .from("bookings")
    .select()
    .order("start_time", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ bookings: data.map(toBookingResponse) });
}

/**
 * POST /api/bookings
 *
 * Checks resource capacity across ALL bookings (not just the caller's own)
 * before allowing the insert — this is exactly the case the service-role
 * client exists for, since a member's own RLS-scoped view can't see other
 * members' bookings to count them.
 */
export async function createBooking(req: Request, res: Response) {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { resourceId, startTime, endTime, notes } = parsed.data;
  const service = getServiceClient();

  const { data: resource, error: resourceError } = await service
    .from("resources")
    .select("id, capacity, is_active")
    .eq("id", resourceId)
    .single();

  if (resourceError || !resource) {
    return res.status(404).json({ error: "Resource not found" });
  }
  if (!resource.is_active) {
    return res.status(400).json({ error: "This resource is not currently bookable" });
  }

  // Count bookings that overlap the requested window and are still "live"
  // (pending or approved) — cancelled/rejected bookings don't hold a slot.
  const { count, error: countError } = await service
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("resource_id", resourceId)
    .in("status", ["pending", "approved"])
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (countError) return res.status(500).json({ error: countError.message });

  if ((count ?? 0) >= resource.capacity) {
    return res.status(409).json({
      error: "This resource is fully booked for the selected time",
    });
  }

  // The actual write goes through the RLS-scoped client, so
  // "bookings_insert_own" still enforces member_id = auth.uid().
  const { data, error } = await req.supabase
    .from("bookings")
    .insert({
      member_id: req.user.id,
      resource_id: resourceId,
      start_time: startTime,
      end_time: endTime,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ booking: toBookingResponse(data) });
}

/**
 * PATCH /api/bookings/:id/review
 * Staff/admin approve or reject a pending booking.
 */
export async function reviewBooking(req: Request, res: Response) {
  const parsed = reviewBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { data, error } = await req.supabase
    .from("bookings")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes,
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .eq("status", "pending") // can't re-review an already-decided booking
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({
      error: error?.message ?? "Booking not found or already reviewed",
    });
  }
  return res.json({ booking: toBookingResponse(data) });
}

/**
 * PATCH /api/bookings/:id/cancel
 * A member cancelling their own still-pending booking.
 */
export async function cancelBooking(req: Request, res: Response) {
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { data, error } = await req.supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", req.params.id)
    .eq("member_id", req.user.id)
    .eq("status", "pending")
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({
      error: error?.message ?? "Booking not found or can no longer be cancelled",
    });
  }
  return res.json({ booking: toBookingResponse(data) });
}

function toBookingResponse(row: any) {
  return {
    id: row.id,
    memberId: row.member_id,
    resourceId: row.resource_id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}
