import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { loadCurrentProfile } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const accessToken = requireAccessToken();
  try {
    const profile = await loadCurrentProfile(accessToken);
    return <WorkspaceShell profile={profile}>{children}</WorkspaceShell>;
  } catch {
    redirect("/login?expired=1");
  }
}
