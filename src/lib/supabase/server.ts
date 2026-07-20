import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";

export function getAccessTokenFromCookies(): string | null {
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export function requireAccessToken(): string {
  const token = getAccessTokenFromCookies();
  if (!token) redirect("/login");
  return token;
}

export function getDemoProfileIdFromToken(token: string): string {
  if (!isDemoMode || !token.startsWith("demo.")) {
    return "10000000-0000-4000-8000-000000000001";
  }
  return token.split(".")[1] ?? "10000000-0000-4000-8000-000000000001";
}
