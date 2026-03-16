import { getSupabase } from "@/utils/supabase";
import { getCsrfToken } from "@/features/auth/utils/csrfToken";

type ApiErrorPayload = { error?: string };

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorPayload;
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

/** Authenticated read request — attaches Bearer token, no CSRF required. */
export async function apiFetch<T>(url: string): Promise<T> {
  const supabase = getSupabase();
  const headers: Record<string, string> = {};

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  const res = await fetch(url, { headers });
  return parseResponse<T>(res);
}

/** Authenticated mutation request — requires an active session and CSRF token. */
export async function apiMutate<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const csrfToken = getCsrfToken();
  if (!csrfToken) throw new Error("CSRF token not available");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    "X-CSRF-Token": csrfToken,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(res);
}
