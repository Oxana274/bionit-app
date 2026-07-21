import { NextResponse } from "next/server";

import {
  getDemoSurveyAdminControl,
  setDemoSurveyStatus
} from "@/lib/data/demo";
import { assertSurveyAdmin } from "@/lib/data/loaders";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import type { SurveyAdminControl, SurveyStatus } from "@/types/domain";

export async function GET() {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 }
    );
  }

  try {
    await assertSurveyAdmin(accessToken);
    const survey = isDemoMode
      ? getDemoSurveyAdminControl()
      : await supabaseRpc<SurveyAdminControl>(
          "get_admin_survey_control",
          accessToken
        );
    return NextResponse.json(survey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось загрузить опрос.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("администратор") ? 403 : 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { surveyId?: string; status?: SurveyStatus }
    | null;
  if (
    !body?.surveyId ||
    !body.status ||
    !(["active", "closed"] as SurveyStatus[]).includes(body.status)
  ) {
    return NextResponse.json(
      { error: "Передайте опрос и новый статус." },
      { status: 400 }
    );
  }

  try {
    await assertSurveyAdmin(accessToken);
    const survey = isDemoMode
      ? setDemoSurveyStatus(body.status)
      : await supabaseRpc<SurveyAdminControl>(
          "admin_set_survey_status",
          accessToken,
          {
            p_survey_id: body.surveyId,
            p_status: body.status
          }
        );
    return NextResponse.json(survey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось изменить статус.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("администратор") ? 403 : 400 }
    );
  }
}
