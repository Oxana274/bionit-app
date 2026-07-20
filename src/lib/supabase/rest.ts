import { publicEnv } from "@/lib/env";
import type { SupabaseErrorBody } from "@/types/database";

interface RestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  useServiceRole?: boolean;
  serviceRoleKey?: string;
}

async function errorMessage(response: Response): Promise<string> {
  let body: SupabaseErrorBody | null = null;
  try {
    body = (await response.json()) as SupabaseErrorBody;
  } catch {
    body = null;
  }
  return body?.message ?? body?.error_description ?? body?.error ?? `Supabase: HTTP ${response.status}`;
}

export async function supabaseRest<T>(
  path: string,
  accessToken: string,
  options: RestOptions = {}
): Promise<T> {
  const key = options.useServiceRole ? options.serviceRoleKey : publicEnv.supabaseAnonKey;
  if (!key || !publicEnv.supabaseUrl) throw new Error("Supabase не настроен.");
  const response = await fetch(`${publicEnv.supabaseUrl}/rest/v1/${path.replace(/^\//, "")}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${options.useServiceRole ? key : accessToken}`,
      "Content-Type": "application/json",
      ...options.headers
    },
    cache: options.cache ?? "no-store"
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function supabaseRpc<T>(
  name: string,
  accessToken: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  return supabaseRest<T>(`rpc/${name}`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { Prefer: "return=representation" }
  });
}
