import { DEFAULT_EMPLOYEE_EMAIL_DOMAIN } from "@/lib/constants";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const publicEnv = {
  supabaseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  employeeEmailDomain:
    process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL_DOMAIN ?? DEFAULT_EMPLOYEE_EMAIL_DOMAIN,
  siteUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? ""),
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true"
} as const;

export const isSupabaseConfigured =
  publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0;

export const isDemoMode = publicEnv.demoMode || !isSupabaseConfigured;

export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY не настроен.");
  return key;
}
