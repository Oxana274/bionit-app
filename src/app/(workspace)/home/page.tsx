import { redirect } from "next/navigation";

export const metadata = { title: "Академия Бионит" };

export default function HomePage() {
  redirect("/learning");
}
