import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import type { OnboardingQuestion } from "@/types/domain";

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { assignmentId?: string; question?: string } | null;
  const assignmentId = body?.assignmentId?.trim();
  const question = body?.question?.trim();
  if (!assignmentId || !question || question.length < 8) {
    return NextResponse.json({ error: "Вопрос должен содержать не менее 8 символов." }, { status: 400 });
  }

  try {
    if (isDemoMode) {
      const demo: OnboardingQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        status: "new",
        createdAt: new Date().toISOString(),
        answeredAt: null
      };
      return NextResponse.json({ data: demo });
    }
    const result = await supabaseRpc<OnboardingQuestion>("ask_onboarding_question", accessToken, {
      p_assignment_id: assignmentId,
      p_question: question
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось отправить вопрос." },
      { status: 400 }
    );
  }
}
