"use client";

import { clearStoredSession, persistSession, readStoredSession } from "@/lib/session/storage";
import { refreshAuthSession } from "@/lib/supabase/auth-client";

export async function syncServerSession(accessToken: string): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
    cache: "no-store"
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Не удалось синхронизировать сессию.");
  }
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE", cache: "no-store" });
}

export async function getValidAccessToken(): Promise<string> {
  const stored = readStoredSession();
  if (!stored) throw new Error("Сессия не найдена. Войдите снова.");
  const now = Math.floor(Date.now() / 1000);
  if (stored.expiresAt - now > 90) return stored.accessToken;
  try {
    const refreshed = await refreshAuthSession(stored.refreshToken);
    const next = persistSession(refreshed);
    await syncServerSession(next.accessToken);
    return next.accessToken;
  } catch (error) {
    clearStoredSession();
    await clearServerSession().catch(() => undefined);
    throw error;
  }
}
