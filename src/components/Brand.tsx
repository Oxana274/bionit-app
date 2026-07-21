import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { formatNumber, initials } from "@/lib/utils/format";
import type {
  BadgeKind,
  LearningClassSummary,
  ShopProduct
} from "@/types/domain";

export function BrandLogo({
  compact = false,
  priority = false
}: {
  compact?: boolean;
  priority?: boolean;
}) {
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

export function EmployeeAvatar({
  fullName,
  size = 44
}: {
  fullName: string;
  size?: number;
}) {
  return (
    <span
      className="employee-avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.3)
      }}
    >
      {initials(fullName)}
    </span>
  );
}

export function BionicCoin({
  value,
  compact = false
}: {
  value: number;
  compact?: boolean;
}) {
  return (
    <span className={compact ? "coin-pill coin-pill-compact" : "coin-pill"}>
      <Icon name="coin" size={compact ? 17 : 21} />
      <strong>{formatNumber(value)}</strong>
      {compact ? null : <span>Биоников</span>}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref
}: {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <header className="page-header">
      {backHref ? (
        <Link href={backHref} className="back-link">
          <Icon name="arrow-left" size={19} />
          Назад
        </Link>
      ) : null}
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
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

  return (
    <span className={`status-pill status-${status}`}>
      {labels[status] ?? status}
    </span>
  );
}

const badgeEmojiByKind: Record<BadgeKind, string> = {
  "first-step": "👣",
  gmp: "🧪",
  team: "🤝",
  mentor: "🎓",
  anniversary: "🎂",
  safety: "🦺",
  streak: "🔥",
  leader: "🏆"
};

export function BadgeArtwork({
  kind,
  locked = false
}: {
  kind: BadgeKind;
  locked?: boolean;
}) {
  return (
    <span
      className={locked ? "badge-art badge-emoji locked" : "badge-art badge-emoji"}
      aria-hidden="true"
      style={{
        width: 76,
        height: 76,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        border: locked ? "2px solid #DADADA" : "2px solid rgba(203, 52, 42, 0.24)",
        background: locked ? "#F2F2F2" : "rgba(203, 52, 42, 0.1)",
        fontSize: 36,
        lineHeight: 1,
        filter: locked ? "grayscale(1)" : undefined,
        opacity: locked ? 0.56 : 1
      }}
    >
      {badgeEmojiByKind[kind]}
    </span>
  );
}

export function CourseArtwork({
  course
}: {
  course: Pick<LearningClassSummary, "coverKind" | "category">;
}) {
  const icon =
    course.coverKind === "quality"
      ? "document"
      : course.coverKind === "safety"
        ? "shield"
        : course.coverKind === "product"
          ? "factory"
          : "team";

  return (
    <div className={`course-art course-art-${course.coverKind}`}>
      <span>{course.category}</span>
      <Icon name={icon} size={58} strokeWidth={1.5} />
      <div className="course-art-pattern" />
    </div>
  );
}

export function ProductArtwork({ product }: { product: ShopProduct }) {
  const art: Record<ShopProduct["kind"], ReactNode> = {
    polo: (
      <>
        <path d="m42 23 18-8 18 8 18 11-10 17-10-6v47H44V45l-10 6-10-17 18-11Z" />
        <path d="M51 19c2 11 16 11 18 0M60 31v13" />
      </>
    ),
    sweatshirt: (
      <>
        <path d="m44 22 16-7 16 7 19 13-9 18-10-6v45H44V47l-10 6-9-18 19-13Z" />
        <path d="M50 19c1 10 19 10 20 0" />
      </>
    ),
    thermos: (
      <>
        <rect x="43" y="22" width="34" height="72" rx="12" />
        <path d="M48 15h24v10H48zM48 45h24" />
      </>
    ),
    tote: (
      <>
        <path d="M32 35h56l-5 60H37l-5-60Z" />
        <path d="M47 38V27a13 13 0 0 1 26 0v11" />
      </>
    ),
    notebook: (
      <>
        <rect x="38" y="18" width="44" height="78" rx="5" />
        <path d="M48 18v78M55 36h18M55 45h18" />
      </>
    ),
    pins: (
      <>
        <circle cx="42" cy="45" r="17" />
        <circle cx="77" cy="44" r="16" />
        <circle cx="60" cy="76" r="16" />
        <path d="m38 45 3 3 6-7m25 3h10m-5-5v10M54 76h12" />
      </>
    )
  };

  return (
    <svg
      className={`product-art product-art-${product.kind}`}
      viewBox="0 0 120 112"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {art[product.kind]}
      </g>
      <circle cx="60" cy="60" r="49" fill="currentColor" opacity=".06" />
    </svg>
  );
}
