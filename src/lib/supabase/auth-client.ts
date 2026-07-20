"use client";

import { isDemoMode, publicEnv } from "@/lib/env";
import { employeeNumberToEmail, parseLoginIdentifier } from "@/lib/utils/identity";
import type { SupabaseErrorBody } from "@/types/database";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  tokenType: string;
  user: AuthUser;
}

interface SupabaseTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

function mapTokenResponse(response: SupabaseTokenResponse): AuthSession {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
    expiresAt: response.expires_at ?? Math.floor(Date.now() / 1000) + response.expires_in,
    tokenType: response.token_type,
    user: response.user
  };
}

async function readAuthError(response: Response): Promise<string> {
  let body: SupabaseErrorBody | null = null;
  try {
    body = (await response.json()) as SupabaseErrorBody;
  } catch {
    body = null;
  }
  const code = body?.error ?? body?.code;
  if (code === "invalid_credentials") return "Неверный табельный номер, телефон или пароль.";
  if (code === "email_not_confirmed" || code === "phone_not_confirmed") {
    return "Учётная запись ещё не активирована. Обратитесь в HR.";
  }
  return body?.error_description ?? body?.message ?? "Не удалось войти. Повторите попытку.";
}

function demoSession(identifier: string, password: string): AuthSession {
  const key = identifier.trim().replace(/[\s()-]/g, "");
  const users: Record<string, { profileId: string; employeeNumber: string; password: string }> = {
    "1001": {
      profileId: "10000000-0000-4000-8000-000000000001",
      employeeNumber: "1001",
      password: "Bionit!2026"
    },
    "+79001234567": {
      profileId: "10000000-0000-4000-8000-000000000001",
      employeeNumber: "1001",
      password: "Bionit!2026"
    },
    "1002": {
      profileId: "10000000-0000-4000-8000-000000000002",
      employeeNumber: "1002",
      password: "Bionit!2026"
    },
    "9001": {
      profileId: "10000000-0000-4000-8000-000000000003",
      employeeNumber: "9001",
      password: "Admin!2026"
    }
  };
  const found = users[key];
  if (!found || found.password !== password) throw new Error("Неверные демо-данные для входа.");
  const expiresIn = 3600;
  return {
    accessToken: `demo.${found.profileId}.token`,
    refreshToken: `demo.${found.profileId}.refresh`,
    expiresIn,
    expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
    tokenType: "bearer",
    user: {
      id: found.profileId,
      email: `${found.employeeNumber}@${publicEnv.employeeEmailDomain}`,
      user_metadata: { employee_number: found.employeeNumber, demo: true }
    }
  };
}

export async function signInWithEmployeeIdentifier(
  identifier: string,
  password: string
): Promise<AuthSession> {
  if (isDemoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return demoSession(identifier, password);
  }

  const parsed = parseLoginIdentifier(identifier);
  const payload =
    parsed.kind === "phone"
      ? { phone: parsed.value, password }
      : {
          email: employeeNumberToEmail(parsed.value, publicEnv.employeeEmailDomain),
          password
        };

  const response = await fetch(
    `${publicEnv.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: publicEnv.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    }
  );

  if (!response.ok) throw new Error(await readAuthError(response));
  return mapTokenResponse((await response.json()) as SupabaseTokenResponse);
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  if (isDemoMode && refreshToken.startsWith("demo.")) {
    const profileId = refreshToken.split(".")[1] ?? "10000000-0000-4000-8000-000000000001";
    const expiresIn = 3600;
    return {
      accessToken: `demo.${profileId}.token`,
      refreshToken: `demo.${profileId}.refresh`,
      expiresIn,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      tokenType: "bearer",
      user: { id: profileId, user_metadata: { demo: true } }
    };
  }

  const response = await fetch(
    `${publicEnv.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: publicEnv.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store"
    }
  );
  if (!response.ok) throw new Error(await readAuthError(response));
  return mapTokenResponse((await response.json()) as SupabaseTokenResponse);
}

export async function revokeAuthSession(accessToken: string): Promise<void> {
  if (isDemoMode || accessToken.startsWith("demo.")) return;
  await fetch(`${publicEnv.supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: publicEnv.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
}
