import { Router } from "express";
import {
  requireAuth,
  requireMemberProfile,
  requireStaff,
} from "../../middleware/auth.js";
import {
  listBookings,
  createBooking,
  reviewBooking,
  cancelBooking,
} from "./bookings.controller.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth, requireMemberProfile);

bookingsRouter.get("/", listBookings);
bookingsRouter.post("/", createBooking);
// Staff/admin only at the route level. RLS alone isn't enough here: the
// "bookings_update_own_or_staff" policy also allows a member to update
// their OWN row, which without this guard would let a member approve
// their own pending booking through this same endpoint.
bookingsRouter.patch("/:id/review", requireStaff, reviewBooking);
bookingsRouter.patch("/:id/cancel", cancelBooking);
