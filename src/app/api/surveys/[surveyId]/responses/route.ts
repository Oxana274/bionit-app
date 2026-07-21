import { NextResponse } from "next/server";

import {
  submitDemoSurveyResponse
} from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import {
  getAccessTokenFromCookies,
  getDemoProfileIdFromToken
} from "@/lib/supabase/server";
import type {
  SurveySubmission,
  SurveySubmissionResult
} from "@/types/domain";

function validSubmission(value: unknown): value is SurveySubmission {
  if (!value || typeof value !== "object") return false;
  const body = value as Partial<SurveySubmission>;
  return Boolean(
    typeof body.departmentName === "string" &&
      body.departmentName.trim() &&
      (body.gender === "М" || body.gender === "Ж") &&
      Number.isInteger(body.age) &&
      Number(body.age) >= 16 &&
      Number(body.age) <= 100 &&
      typeof body.employeeCategory === "string" &&
      body.employeeCategory.trim() &&
      typeof body.productionTenure === "string" &&
      body.productionTenure.trim() &&
      body.answers &&
      typeof body.answers === "object" &&
      !Array.isArray(body.answers)
  );
}

export async function POST(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!validSubmission(body)) {
    return NextResponse.json(
      { error: "Проверьте демографические данные и ответы." },
      { status: 400 }
    );
  }

  try {
    let result: SurveySubmissionResult;

    if (isDemoMode) {
      result = submitDemoSurveyResponse(
        getDemoProfileIdFromToken(accessToken),
        params.surveyId,
        body
      );
    } else {
      result = await supabaseRpc<SurveySubmissionResult>(
        "submit_survey_response",
        accessToken,
        {
          p_survey_id: params.surveyId,
          p_department_name: body.departmentName,
          p_gender: body.gender,
          p_age: body.age,
          p_employee_category: body.employeeCategory,
          p_production_tenure: body.productionTenure,
          p_answers: body.answers
        }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось отправить ответы.";
    const status = message.includes("уже прошли") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
