import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatNumber, initials } from "@/lib/utils/format";
import type { BadgeKind, LearningClassSummary, ShopProduct } from "@/types/domain";

export function BrandLogo({ compact = false, priority = false }: { compact?: boolean; priority?: boolean }) {
  return (
    <Image
      src={compact ? "/brand/logo-mark.svg" : "/brand/logo-bionit.svg"}
      alt="Бионит"
      width={compact ? 48 : 154}
      height={compact ? 48 : 55}
      priority={priority}
    />
  );
}

export function EmployeeAvatar({ fullName, size = 44 }: { fullName: string; size?: number }) {
  return <span className="employee-avatar" style={{ width: size, height: size, fontSize: Math.max(12, size * .3) }}>{initials(fullName)}</span>;
}

export function BionicCoin({ value, compact = false }: { value: number; compact?: boolean }) {
  return <span className={compact ? "coin-pill coin-pill-compact" : "coin-pill"}><Icon name="coin" size={compact ? 17 : 21}/><strong>{formatNumber(value)}</strong>{compact ? null : <span>Биоников</span>}</span>;
}

export function PageHeader({ eyebrow, title, description, backHref }: { eyebrow: string; title: string; description?: string; backHref?: string }) {
  return <header className="page-header">
    {backHref ? <Link href={backHref} className="back-link"><Icon name="arrow-left" size={19}/>Назад</Link> : null}
    <div className="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    {description ? <p>{description}</p> : null}
  </header>;
}

export function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    not_started: "Не начато",
    in_progress: "В процессе",
    completed: "Выполнено",
    overdue: "Просрочено",
    passed: "Пройдено",
    failed: "Не пройдено",
    new: "Новый",
    approved: "Подтверждён",
    assembling: "Собирается",
    ready: "Готов",
    issued: "Выдан",
    cancelled: "Отменён",
    active: "Активен",
    inactive: "Неактивен"
  };
  return <span className={`status-pill status-${status}`}>{labels[status] ?? status}</span>;
}

export function BadgeArtwork({ kind, locked = false }: { kind: BadgeKind; locked?: boolean }) {
  const shapes: Record<BadgeKind, React.ReactNode> = {
    "first-step": <><path d="M25 40 34 49 54 24"/><path d="M54 40a20 20 0 1 1-6-22"/></>,
    gmp: <><path d="M24 18h28v38H24z"/><path d="M31 29h14M31 37h14M31 45h8m6 4 4 4 9-11"/></>,
    team: <><circle cx="29" cy="29" r="8"/><circle cx="50" cy="31" r="7"/><path d="M14 58c2-12 8-17 15-17s13 5 15 17m-2-14c10 0 16 5 18 14"/></>,
    mentor: <><circle cx="29" cy="28" r="8"/><path d="M14 57c2-12 8-17 15-17s13 5 15 17M51 22v28m-10-14h20"/></>,
    anniversary: <><path d="M17 27h42v30H17zM17 36h42M38 27v30"/><path d="M38 27c-9 0-15-4-15-9 0-4 3-7 7-7 6 0 9 7 8 16Zm0 0c9 0 15-4 15-9 0-4-3-7-7-7-6 0-9 7-8 16Z"/></>,
    safety: <><path d="M38 11 59 19v14c0 14-9 25-21 30-12-5-21-16-21-30V19l21-8Z"/><path d="m28 36 7 7 14-17"/></>,
    streak: <><path d="M39 10c2 12-9 16-9 27 0 7 4 13 10 16M42 22c9 8 15 14 15 23 0 10-8 18-19 18s-19-8-19-18c0-7 4-13 9-18"/><path d="M38 42c5 4 7 7 7 11a7 7 0 0 1-14 0c0-4 2-7 7-11Z"/></>,
    leader: <><path d="M25 16h26v13a13 13 0 0 1-26 0V16Z"/><path d="M25 21H14v4c0 11 7 17 16 17m21-21h11v4c0 11-7 17-16 17M38 42v12M26 64h24M30 54h16v10H30"/></>
  };
  return <svg className={locked ? "badge-art locked" : "badge-art"} viewBox="0 0 76 76" fill="none" aria-hidden="true"><circle cx="38" cy="38" r="35" fill="currentColor" opacity=".1"/><circle cx="38" cy="38" r="29" stroke="currentColor" opacity=".24" strokeWidth="2"/><g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{shapes[kind]}</g></svg>;
}

export function CourseArtwork({ course }: { course: Pick<LearningClassSummary, "coverKind" | "category"> }) {
  const icon = course.coverKind === "quality" ? "document" : course.coverKind === "safety" ? "shield" : course.coverKind === "product" ? "factory" : "team";
  return <div className={`course-art course-art-${course.coverKind}`}><span>{course.category}</span><Icon name={icon} size={58} strokeWidth={1.5}/><div className="course-art-pattern"/></div>;
}

export function ProductArtwork({ product }: { product: ShopProduct }) {
  const art: Record<ShopProduct["kind"], React.ReactNode> = {
    polo: <><path d="m42 23 18-8 18 8 18 11-10 17-10-6v47H44V45l-10 6-10-17 18-11Z"/><path d="M51 19c2 11 16 11 18 0M60 31v13"/></>,
    sweatshirt: <><path d="m44 22 16-7 16 7 19 13-9 18-10-6v45H44V47l-10 6-9-18 19-13Z"/><path d="M50 19c1 10 19 10 20 0"/></>,
    thermos: <><rect x="43" y="22" width="34" height="72" rx="12"/><path d="M48 15h24v10H48zM48 45h24"/></>,
    tote: <><path d="M32 35h56l-5 60H37l-5-60Z"/><path d="M47 38V27a13 13 0 0 1 26 0v11"/></>,
    notebook: <><rect x="38" y="18" width="44" height="78" rx="5"/><path d="M48 18v78M55 36h18M55 45h18"/></>,
    pins: <><circle cx="42" cy="45" r="17"/><circle cx="77" cy="44" r="16"/><circle cx="60" cy="76" r="16"/><path d="m38 45 3 3 6-7m25 3h10m-5-5v10M54 76h12"/></>
  };
  return <svg className={`product-art product-art-${product.kind}`} viewBox="0 0 120 112" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{art[product.kind]}</g><circle cx="60" cy="60" r="49" fill="currentColor" opacity=".06"/></svg>;
}
