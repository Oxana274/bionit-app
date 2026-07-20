import { NextResponse } from "next/server";
import { submitDemoLearningAttempt } from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import type { LearningAttemptResult } from "@/types/domain";

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    classId?: string;
    answers?: Record<string, string>;
  } | null;
  if (!body?.classId || !body.answers || typeof body.answers !== "object") {
    return NextResponse.json({ error: "Ответы теста не переданы." }, { status: 400 });
  }

  try {
    const result: LearningAttemptResult = isDemoMode
      ? submitDemoLearningAttempt(body.classId, body.answers)
      : await supabaseRpc<LearningAttemptResult>("submit_learning_attempt", accessToken, {
          p_class_id: body.classId,
          p_answers: body.answers
        });
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось проверить тест." },
      { status: 400 }
    );
  }
}
