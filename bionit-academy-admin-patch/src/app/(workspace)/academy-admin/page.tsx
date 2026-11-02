import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyAdminView } from "@/components/AcademyAdminView";
import { supabaseRpc } from "@/lib/supabase/rest";
import { requireAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Академия Бионит — управление" };
export const dynamic = "force-dynamic";

export default async function AcademyAdminPage() {
  const token = requireAccessToken();
  try {
    const allowed = await supabaseRpc<boolean>("is_academy_admin", token);
    if (!allowed) redirect("/home");
    return <AcademyAdminView />;
  } catch {
    redirect("/home");
  }
}
