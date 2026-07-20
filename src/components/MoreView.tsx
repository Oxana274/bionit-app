"use client";

import Link from "next/link";
import { Button } from "antd";
import { BionicCoin, EmployeeAvatar, PageHeader } from "@/components/Brand";
import { Icon, type IconName } from "@/components/Icon";
import { useSession } from "@/providers/SessionProvider";
import type { ProfileSummary } from "@/types/domain";

const items: Array<{ href: string; title: string; description: string; icon: IconName }> = [
  { href: "/achievements", title: "Достижения", description: "35 лет истории и важные вехи компании", icon: "achievements" },
  { href: "/badges", title: "Бейджи", description: "Награды за знания, вклад и развитие", icon: "badges" },
  { href: "/shop", title: "Магазин", description: "Фирменный мерч за Бионики", icon: "shop" }
];

export function MoreView({ profile }: { profile: ProfileSummary }) {
  const { signOut } = useSession();
  const links = [
    ...items,
    ...(["hr", "admin"].includes(profile.role)
      ? [{ href: "/admin", title: "Админ-панель", description: "Заказы, сотрудники и доступы", icon: "admin" as IconName }]
      : [])
  ];

  return <div className="more-page">
    <PageHeader eyebrow="Навигация" title="Ещё" description="Все дополнительные возможности Бионит В Деле."/>

    <section className="profile-card">
      <EmployeeAvatar fullName={profile.fullName} size={72}/>
      <div className="profile-card-main"><h2>{profile.fullName}</h2><p>{profile.position}</p><span><Icon name="department" size={17}/>{profile.departmentName}</span></div>
      <BionicCoin value={profile.balance}/>
      <div className="hero-pattern"/>
    </section>

    <section className="more-links">
      {links.map((item) => <Link className="more-link-card" href={item.href} key={item.href}>
        <span className="more-link-icon"><Icon name={item.icon}/></span>
        <div><h3>{item.title}</h3><p>{item.description}</p></div>
        <Icon name="chevron-right" size={20}/>
      </Link>)}
    </section>

    <section className="support-card">
      <span><Icon name="help"/></span><div><h3>Нужна помощь?</h3><p>По вопросам доступа, начислений и работы приложения обратитесь в HR.</p></div>
    </section>

    <Button className="logout-mobile-button" danger size="large" icon={<Icon name="logout" size={19}/>} onClick={() => void signOut()}>Выйти из приложения</Button>
  </div>;
}
