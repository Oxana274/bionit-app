import { BadgesView } from "@/components/CommunityViews";
import { loadBadges } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";
export const metadata = { title: "Бейджи" };
export const dynamic = "force-dynamic";
export default async function BadgesPage() { return <BadgesView badges={await loadBadges(requireAccessToken())}/>; }
