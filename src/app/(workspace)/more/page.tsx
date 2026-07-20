import type { Metadata } from "next";
import { MoreView } from "@/components/MoreView";
import { loadCurrentProfile } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ещё" };

export default async function MorePage() {
  const accessToken = requireAccessToken();
  const profile = await loadCurrentProfile(accessToken);
  return <MoreView profile={profile}/>;
}
