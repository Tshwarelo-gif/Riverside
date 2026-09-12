import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Wrapper around fetch that attaches the current Supabase session's
 * access token as a Bearer header, matching what apps/api's requireAuth
 * middleware expects. Throws on non-2xx responses with the API's own
 * error message where available.
 */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && typeof json.error === "string" && json.error) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json as T;
}
