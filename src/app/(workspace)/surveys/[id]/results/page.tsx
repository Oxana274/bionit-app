import type { Metadata } from "next";

import { SurveyResults } from "@/components/SurveyResults";
import { loadSurveyResults } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";
import type { SurveyFilterState } from "@/types/domain";

export const metadata: Metadata = { title: "Аналитика опроса" };
export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value?.trim() || null;
}

export default async function SurveyResultsPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const accessToken = requireAccessToken();
  const filters: SurveyFilterState = {
    department: first(searchParams.department),
    employeeCategory: first(searchParams.employeeCategory),
    productionTenure: first(searchParams.productionTenure)
  };
  const results = await loadSurveyResults(accessToken, params.id, filters);

  return <SurveyResults initial={results} />;
}
