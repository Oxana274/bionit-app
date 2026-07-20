import { HomeView } from "@/components/HomeView";
import { loadDashboard } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata = { title: "Главная" };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await loadDashboard(requireAccessToken());
  return <HomeView data={data}/>;
}
