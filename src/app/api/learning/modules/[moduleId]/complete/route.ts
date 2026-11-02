import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { moduleId: string } }
) {
  const token = getAccessTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  if (isDemoMode) return NextResponse.json({ error: "Отметка модулей доступна только в рабочем режиме." }, { status: 409 });

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(params.moduleId)) return NextResponse.json({ error: "Некорректный идентификатор модуля." }, { status: 400 });

  try {
    const data = await supabaseRpc("complete_learning_module", token, { p_module_id: params.moduleId });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить прогресс." }, { status: 400 });
  }
}
