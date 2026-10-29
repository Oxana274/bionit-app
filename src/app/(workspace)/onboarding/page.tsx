
import { redirect } from "next/navigation";

export const metadata = { title: "Онбординг" };
export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  redirect("/learning");
}
