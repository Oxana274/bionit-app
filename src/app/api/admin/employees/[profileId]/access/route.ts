import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

const roles: UserRole[] = ["employee", "mentor", "manager", "hr", "admin"];

export async function PATCH(request: Request, { params }: { params: { profileId: string } }) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { role?: UserRole } | null;
  if (!body?.role || !roles.includes(body.role)) {
    return NextResponse.json({ error: "Некорректная роль." }, { status: 400 });
  }

  try {
    await assertAdmin(accessToken);
    if (isDemoMode) return NextResponse.json({ id: params.profileId, role: body.role });
    const result = await supabaseRpc<{ id: string; role: UserRole }>(
      "admin_set_user_role",
      accessToken,
      { p_profile_id: params.profileId, p_role: body.role }
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось обновить доступ.";
    return NextResponse.json({ error: message }, { status: message.includes("прав") ? 403 : 400 });
  }
}
