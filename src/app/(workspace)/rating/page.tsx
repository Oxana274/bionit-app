import { RatingView } from "@/components/CommunityViews";
import { loadLeaderboards } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";
export const metadata = { title: "Рейтинг" };
export const dynamic = "force-dynamic";
export default async function RatingPage() { return <RatingView data={await loadLeaderboards(requireAccessToken())}/>; }
