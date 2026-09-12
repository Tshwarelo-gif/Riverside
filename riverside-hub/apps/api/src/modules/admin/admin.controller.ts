import { Request, Response } from "express";
import { getServiceClient } from "../../db/supabase.js";

/**
 * GET /api/admin/reports/summary
 *
 * Staff/admin only (enforced by requireStaff middleware before this runs).
 * Uses the service client because this report necessarily aggregates
 * across ALL members/bookings/donations, not just what RLS would show
 * the caller — the authorization decision ("is this caller staff?") was
 * already made by the middleware, so bypassing RLS here is intentional
 * and safe, not a workaround.
 */
export async function getSummaryReport(_req: Request, res: Response) {
  const service = getServiceClient();

  const [memberCount, bookingsByStatus, donationsByType] = await Promise.all([
    service.from("members").select("id", { count: "exact", head: true }),
    service.from("bookings").select("status"),
    service.from("donations").select("type, status, amount"),
  ]);

  if (memberCount.error) return res.status(500).json({ error: memberCount.error.message });
  if (bookingsByStatus.error) return res.status(500).json({ error: bookingsByStatus.error.message });
  if (donationsByType.error) return res.status(500).json({ error: donationsByType.error.message });

  const bookingCounts: Record<string, number> = {};
  for (const row of bookingsByStatus.data ?? []) {
    bookingCounts[row.status] = (bookingCounts[row.status] ?? 0) + 1;
  }

  let monetaryTotal = 0;
  let monetaryReceivedTotal = 0;
  let foodParcelCount = 0;
  for (const row of donationsByType.data ?? []) {
    if (row.type === "monetary" && row.amount) {
      monetaryTotal += Number(row.amount);
      if (row.status === "received" || row.status === "allocated") {
        monetaryReceivedTotal += Number(row.amount);
      }
    }
    if (row.type === "food_parcel") {
      foodParcelCount += 1;
    }
  }

  return res.json({
    totalMembers: memberCount.count ?? 0,
    bookingsByStatus: bookingCounts,
    donations: {
      monetaryTotalPledged: monetaryTotal,
      monetaryTotalReceived: monetaryReceivedTotal,
      foodParcelCount,
    },
  });
}
