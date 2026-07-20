import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/Brand";
import { LoginForm } from "@/components/LoginForm";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";

export const metadata = { title: "Вход" };

export default function LoginPage() {
  if (getAccessTokenFromCookies()) redirect("/home");
  return <main className="login-page">
    <section className="login-brand-panel" aria-hidden="true"><div className="login-brand-inner"><BrandLogo priority/><div><span className="login-kicker">Система развития команды</span><h1>Бионит<br/>В Деле</h1><p>Знания, достижения и Бионики — всё, что помогает расти сотрудникам и компании.</p></div><small>Современное производство ветеринарных препаратов</small></div></section>
    <section className="login-form-panel"><div className="login-form-wrap"><div className="login-mobile-logo"><BrandLogo priority/></div><span className="login-kicker">Личный кабинет</span><h2>С возвращением</h2><p>Войдите по табельному номеру или рабочему телефону.</p><LoginForm/></div></section>
  </main>;
}
