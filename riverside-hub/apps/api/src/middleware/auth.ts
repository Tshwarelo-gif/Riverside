import { Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { createUserScopedClient } from "../db/supabase.js";
import type { MemberRole } from "@riverside/shared";

// Augment Express's Request type with what auth middleware attaches.
declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient;
      user?: { id: string; email: string | undefined };
      memberRole?: MemberRole;
    }
  }
}

/**
 * Verifies the Authorization: Bearer <token> header against Supabase Auth,
 * then attaches:
 *   - req.supabase: an RLS-scoped client authenticated as this user
 *   - req.user: the authenticated user's id/email
 *
 * Does NOT require a members row to exist yet — registration itself needs
 * an authenticated-but-not-yet-profiled request. Routes that need the
 * member profile should follow this with requireMemberProfile.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  const token = authHeader.slice("Bearer ".length);

  const supabase = createUserScopedClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.supabase = supabase;
  req.user = { id: data.user.id, email: data.user.email };
  next();
}

/**
 * Loads the caller's member profile (for role checks) and attaches
 * req.memberRole. Use after requireAuth, on routes where a profile
 * must already exist (i.e. everything except registration).
 */
export async function requireMemberProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.supabase || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { data, error } = await req.supabase
    .from("members")
    .select("role")
    .eq("id", req.user.id)
    .single();

  if (error || !data) {
    return res.status(403).json({ error: "No member profile found" });
  }
  req.memberRole = data.role;
  next();
}

/**
 * Route guard for staff/admin-only endpoints. Use after requireMemberProfile.
 * Note: this is a convenience check for early rejection with a clear error —
 * the real enforcement is still the RLS policies on each table.
 */
export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (req.memberRole !== "staff" && req.memberRole !== "admin") {
    return res.status(403).json({ error: "Staff or admin access required" });
  }
  next();
}
