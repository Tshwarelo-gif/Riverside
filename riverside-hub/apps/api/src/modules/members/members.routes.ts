import { Router } from "express";
import { requireAuth, requireMemberProfile } from "../../middleware/auth.js";
import {
  registerMember,
  getMyProfile,
  updateMyProfile,
} from "./members.controller.js";

export const membersRouter = Router();

// Registration only needs a valid Supabase session, not an existing
// member profile (that's what this route creates).
membersRouter.post("/register", requireAuth, registerMember);

// Everything else assumes the profile already exists.
membersRouter.get("/me", requireAuth, requireMemberProfile, getMyProfile);
membersRouter.patch("/me", requireAuth, requireMemberProfile, updateMyProfile);
