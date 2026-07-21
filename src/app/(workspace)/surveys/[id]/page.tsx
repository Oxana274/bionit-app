import type { Metadata } from "next";

import { SurveyForm } from "@/components/SurveyForm";
import { loadSurvey } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Пройти опрос" };
export const dynamic = "force-dynamic";

export default async function SurveyPage({
  params
}: {
  params: { id: string };
}) {
  const accessToken = requireAccessToken();
  const survey = await loadSurvey(accessToken, params.id);

  return <SurveyForm initial={survey} />;
}
