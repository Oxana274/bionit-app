"use client";

import {
  ACCESS_TOKEN_STORAGE_KEY,
  EXPIRES_AT_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY
} from "@/lib/constants";
import type { AuthSession, AuthUser } from "@/lib/supabase/auth-client";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export function persistSession(session: AuthSession): StoredSession {
  if (typeof window === "undefined") throw new Error("localStorage недоступен на сервере.");
  const stored: StoredSession = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    user: session.user
  };
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, stored.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, stored.refreshToken);
  localStorage.setItem(EXPIRES_AT_STORAGE_KEY, String(stored.expiresAt));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(stored.user));
  return stored;
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  const expiresAtRaw = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
  const userRaw = localStorage.getItem(USER_STORAGE_KEY);
  if (!accessToken || !refreshToken || !expiresAtRaw || !userRaw) return null;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return null;
  try {
    return {
      accessToken,
      refreshToken,
      expiresAt,
      user: JSON.parse(userRaw) as AuthUser
    };
  } catch {
    return null;
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
