import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { isDemoMode, publicEnv } from "@/lib/env";

function jwtExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { accessToken?: string } | null;
  const accessToken = body?.accessToken?.trim();
  if (!accessToken) return NextResponse.json({ error: "Токен не передан." }, { status: 400 });

  const demoToken = isDemoMode && accessToken.startsWith("demo.");
  if (!demoToken) {
    const response = await fetch(`${publicEnv.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: publicEnv.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: "Сессия недействительна." }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAge = Math.max(60, (jwtExpiry(accessToken) ?? now + 3600) - now);
  cookies().set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return NextResponse.json({ ok: true });
}
