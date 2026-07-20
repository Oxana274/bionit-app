import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminView } from "@/components/AdminView";
import { loadAdminDashboard } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Админ-панель" };

export default async function AdminPage() {
  const accessToken = requireAccessToken();
  try {
    const data = await loadAdminDashboard(accessToken);
    return <AdminView initial={data}/>;
  } catch {
    redirect("/home");
  }
}
