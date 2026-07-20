import { OnboardingView } from "@/components/OnboardingView";
import { loadOnboarding } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata = { title: "Онбординг" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  return <OnboardingView initial={await loadOnboarding(requireAccessToken())}/>;
}
