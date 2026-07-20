import { LearningCatalog } from "@/components/LearningViews";
import { loadLearningCatalog } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata = { title: "Обучение" };
export const dynamic = "force-dynamic";

export default async function LearningPage() {
  return <LearningCatalog courses={await loadLearningCatalog(requireAccessToken())}/>;
}
