import { NextResponse } from "next/server";

// Intentionally empty: authentication is handled by localStorage + the
// validated HttpOnly cookie bridge in /api/auth/session.
export function middleware(): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/__middleware_disabled__"]
};
