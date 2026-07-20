import { LearningClassView } from "@/components/LearningViews";
import { loadLearningClass } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LearningClassPage({ params }: { params: { classId: string } }) {
  return <LearningClassView course={await loadLearningClass(requireAccessToken(), params.classId)}/>;
}
