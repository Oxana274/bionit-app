import { redirect } from "next/navigation";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";

export default function IndexPage() {
  redirect(getAccessTokenFromCookies() ? "/home" : "/login");
}
