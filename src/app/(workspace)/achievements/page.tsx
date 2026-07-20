import { AchievementsView } from "@/components/CommunityViews";
import { loadAchievements } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";
export const metadata = { title: "Достижения" };
export const dynamic = "force-dynamic";
export default async function AchievementsPage() { return <AchievementsView stories={await loadAchievements(requireAccessToken())}/>; }
