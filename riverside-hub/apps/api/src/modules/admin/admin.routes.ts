import { Router } from "express";
import {
  requireAuth,
  requireMemberProfile,
  requireStaff,
} from "../../middleware/auth.js";
import { getSummaryReport } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireMemberProfile, requireStaff);

adminRouter.get("/reports/summary", getSummaryReport);
