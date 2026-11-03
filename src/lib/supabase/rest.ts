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
  const url = `${publicEnv.supabaseUrl}/rest/v1/${path.replace(/^\\//, "")}`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${options.useServiceRole ? key : accessToken}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  // Повторяем только безопасные GET-запросы. POST/RPC не повторяем,
  // чтобы не создавать дубли назначений, попыток тестирования или начислений.
  const method = (options.method ?? "GET").toUpperCase();
  const retryable = method === "GET";
  const maxAttempts = retryable ? 2 : 1;
  let response: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal ?? controller.signal,
        cache: options.cache ?? "no-store"
      });
      clearTimeout(timeout);

      if (retryable && attempt < maxAttempts && [502, 503, 504].includes(response.status)) {
        await response.body?.cancel();
        continue;
      }
      break;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (!retryable || attempt === maxAttempts) throw error;
    }
  }

  if (!response) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Не удалось связаться с Supabase.");
  }

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
