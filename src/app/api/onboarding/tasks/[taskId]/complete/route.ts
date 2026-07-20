import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: { taskId: string } }) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  if (!params.taskId) return NextResponse.json({ error: "Задание не указано." }, { status: 400 });

  try {
    if (isDemoMode) {
      return NextResponse.json({
        taskId: params.taskId,
        completed: true,
        pointsGranted: 100,
        progressPercent: 78
      });
    }
    const result = await supabaseRpc<Record<string, unknown>>(
      "complete_onboarding_task",
      accessToken,
      { p_task_progress_id: params.taskId }
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось завершить задание." },
      { status: 400 }
    );
  }
}
