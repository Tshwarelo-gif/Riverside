import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
  );
}

/**
 * Request-scoped Supabase client, authenticated as the calling user.
 *
 * This is the client used for almost every route. Because it carries the
 * user's own JWT, every query runs through Postgres RLS exactly as defined
 * in supabase/migrations — the database is the single source of truth for
 * authorization, not a second copy of the rules in Express.
 */
export function createUserScopedClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client that bypasses RLS entirely.
 *
 * Used ONLY for a small number of trusted, server-only operations where
 * RLS genuinely can't apply (e.g. checking resource capacity across ALL
 * bookings regardless of whose they are, before deciding whether to allow
 * a new one). Never expose this client's results directly to a request
 * without an explicit authorization check first.
 */
let serviceClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!serviceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }
    serviceClient = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}
