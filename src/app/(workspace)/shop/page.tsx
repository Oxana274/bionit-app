import type { Metadata } from "next";
import { ShopView } from "@/components/ShopView";
import { loadShop } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Магазин" };

export default async function ShopPage() {
  const accessToken = requireAccessToken();
  const data = await loadShop(accessToken);
  return <ShopView initial={data}/>;
}
