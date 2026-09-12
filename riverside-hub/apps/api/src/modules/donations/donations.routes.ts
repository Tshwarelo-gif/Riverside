import { Router } from "express";
import {
  requireAuth,
  requireMemberProfile,
  requireStaff,
} from "../../middleware/auth.js";
import {
  listDonations,
  createDonation,
  updateDonationStatus,
} from "./donations.controller.js";

export const donationsRouter = Router();

// Public/anonymous-friendly: createDonation itself checks for a Bearer
// token and behaves differently, so no auth middleware at the route level.
donationsRouter.post("/", createDonation);

donationsRouter.get("/", requireAuth, requireMemberProfile, listDonations);
donationsRouter.patch(
  "/:id/status",
  requireAuth,
  requireMemberProfile,
  requireStaff,
  updateDonationStatus
);
