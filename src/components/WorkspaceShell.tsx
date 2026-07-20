"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "antd";
import { BrandLogo, BionicCoin, EmployeeAvatar } from "@/components/Brand";
import { Icon, type IconName } from "@/components/Icon";
import { useSession } from "@/providers/SessionProvider";
import type { ProfileSummary } from "@/types/domain";

const mainNavigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/home", label: "Главная", icon: "home" },
  { href: "/onboarding", label: "Онбординг", icon: "onboarding" },
  { href: "/learning", label: "Обучение", icon: "learning" },
  { href: "/rating", label: "Рейтинг", icon: "rating" },
  { href: "/more", label: "Ещё", icon: "more" }
];

const extendedNavigation: Array<{ href: string; label: string; icon: IconName }> = [
  ...mainNavigation.slice(0, 4),
  { href: "/achievements", label: "Достижения", icon: "achievements" },
  { href: "/badges", label: "Бейджи", icon: "badges" },
  { href: "/shop", label: "Магазин", icon: "shop" }
];

function active(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/home" && pathname.startsWith(`${href}/`));
}

export function WorkspaceShell({ profile, children }: { profile: ProfileSummary; children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useSession();
  const navigation = [
    ...extendedNavigation,
    ...(["hr", "admin"].includes(profile.role)
      ? [{ href: "/admin", label: "Админ-панель", icon: "admin" as IconName }]
      : [])
  ];

  return <div className="workspace-shell">
    <aside className="desktop-sidebar">
      <Link href="/home" className="sidebar-logo"><BrandLogo /></Link>
      <nav className="sidebar-nav" aria-label="Основная навигация">
        {navigation.map((item) => <Link key={item.href} href={item.href} className={active(pathname, item.href) ? "sidebar-link active" : "sidebar-link"}><Icon name={item.icon}/><span>{item.label}</span></Link>)}
      </nav>
      <div className="sidebar-profile"><EmployeeAvatar fullName={profile.fullName}/><div><strong>{profile.fullName}</strong><small>{profile.position}</small></div></div>
      <Button type="text" className="sidebar-logout" icon={<Icon name="logout" size={19}/>} onClick={() => void signOut()}>Выйти</Button>
    </aside>

    <div className="workspace-main">
      <header className="app-header">
        <Link href="/home" className="mobile-brand"><BrandLogo compact priority/><span><strong>Бионит В Деле</strong><small>{profile.departmentName}</small></span></Link>
        <div className="header-actions"><BionicCoin value={profile.balance} compact/><EmployeeAvatar fullName={profile.fullName} size={40}/></div>
      </header>
      <main className="workspace-content">{children}</main>
      <nav className="bottom-navigation" aria-label="Мобильная навигация">
        {mainNavigation.map((item) => <Link key={item.href} href={item.href} className={active(pathname, item.href) ? "bottom-link active" : "bottom-link"}><span><Icon name={item.icon} size={22}/></span><small>{item.label}</small></Link>)}
      </nav>
    </div>
  </div>;
}
