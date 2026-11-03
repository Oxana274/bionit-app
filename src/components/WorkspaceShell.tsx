
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "antd";

import { BrandLogo, EmployeeAvatar } from "@/components/Brand";
import { Icon, type IconName } from "@/components/Icon";
import { useSession } from "@/providers/SessionProvider";
import type { ProfileSummary } from "@/types/domain";

const learningNavigation: Array<{
  href: string;
  label: string;
  icon: IconName;
}> = [
  { href: "/learning", label: "Академия Бионит", icon: "learning" }
];

function active(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    (href !== "/home" && pathname.startsWith(`${href}/`))
  );
}

export function WorkspaceShell({
  profile,
  academyAdmin = false,
  children
}: {
  profile: ProfileSummary;
  academyAdmin?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useSession();

  const navigation = [
    ...learningNavigation,
    ...(academyAdmin
      ? [{ href: "/academy-admin", label: "Управление обучением", icon: "admin" as IconName }]
      : [])
  ];

  return (
    <div className="workspace-shell">
      <aside className="desktop-sidebar">
        <Link href="/home" className="sidebar-logo">
          <BrandLogo />
        </Link>

        <nav className="sidebar-nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={
                active(pathname, item.href)
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-profile">
          <EmployeeAvatar fullName={profile.fullName} />
          <div>
            <strong>{profile.fullName}</strong>
            <small>{profile.position}</small>
          </div>
        </div>

        <Button
          type="text"
          className="sidebar-logout"
          icon={<Icon name="logout" size={19} />}
          onClick={() => void signOut()}
        >
          Выйти
        </Button>
      </aside>

      <div className="workspace-main">
        <header className="app-header">
          <Link href="/learning" className="mobile-brand">
            <BrandLogo compact priority />
            <span>
              <strong>Бионит В Деле</strong>
              <small>{profile.departmentName}</small>
            </span>
          </Link>

          <div className="header-actions">
            <EmployeeAvatar fullName={profile.fullName} size={40} />
          </div>
        </header>

        <main className="workspace-content">{children}</main>

        <nav className="bottom-navigation" aria-label="Мобильная навигация">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={
                active(pathname, item.href)
                  ? "bottom-link active"
                  : "bottom-link"
              }
            >
              <span>
                <Icon name={item.icon} size={22} />
              </span>
              <small>{item.label}</small>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
