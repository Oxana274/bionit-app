import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { loadCurrentProfile } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";
import { supabaseRpc } from "@/lib/supabase/rest";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const accessToken = requireAccessToken();
  try {
    const profile = await loadCurrentProfile(accessToken);
    let academyAdmin = false;
    try {
      academyAdmin = await supabaseRpc<boolean>("is_academy_admin", accessToken);
    } catch {
      academyAdmin = false;
    }
    return <WorkspaceShell profile={profile} academyAdmin={academyAdmin}>{children}</WorkspaceShell>;
  } catch {
    redirect("/login?expired=1");
  }
}
