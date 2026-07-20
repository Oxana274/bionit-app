import "server-only";

import { getServiceRoleKey, publicEnv } from "@/lib/env";
import { supabaseRest } from "@/lib/supabase/rest";
import type { AuthUser } from "@/lib/supabase/auth-client";

export async function createAuthUser(input: {
  email: string;
  phone?: string;
  password: string;
  userMetadata: Record<string, unknown>;
}): Promise<AuthUser> {
  const serviceRoleKey = getServiceRoleKey();
  const response = await fetch(`${publicEnv.supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      phone: input.phone,
      password: input.password,
      email_confirm: true,
      phone_confirm: Boolean(input.phone),
      user_metadata: input.userMetadata
    }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Supabase Auth Admin API: ${await response.text()}`);
  return (await response.json()) as AuthUser;
}

export function adminRest<T>(
  path: string,
  options: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {}
): Promise<T> {
  const serviceRoleKey = getServiceRoleKey();
  return supabaseRest<T>(path, serviceRoleKey, {
    ...options,
    useServiceRole: true,
    serviceRoleKey
  });
}
