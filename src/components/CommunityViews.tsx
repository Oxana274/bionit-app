"use client";

import { Progress, Tabs } from "antd";

import { EmployeeAvatar, PageHeader } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type {
  AchievementStory,
  BadgeSummary,
  LeaderboardsData
} from "@/types/domain";

type BionicTransactionStory = AchievementStory & {
  date: string;
  amount: number;
};

function isBionicTransactionStory(
  story: AchievementStory
): story is BionicTransactionStory {
  const candidate = story as Partial<BionicTransactionStory>;

  return (
    typeof candidate.date === "string" &&
    candidate.date.length > 0 &&
    typeof candidate.amount === "number"
  );
}

function TransactionsView({
  transactions
}: {
  transactions: BionicTransactionStory[];
}) {
  const credited = transactions.reduce(
    (total, item) => total + Math.max(item.amount, 0),
    0
  );
  const debited = transactions.reduce(
    (total, item) => total + Math.abs(Math.min(item.amount, 0)),
    0
  );

  return (
    <>
      <PageHeader
        eyebrow="История Биоников"
        title="Достижения"
        description="Начисления за обучение, вклад в команду и покупки в магазине."
      />

      <section className="badge-summary">
        <span className="icon-box">
          <Icon name="coin" size={30} />
        </span>
        <div>
          <strong>+{formatNumber(credited)}</strong>
          <span>получено Биоников</span>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <strong>−{formatNumber(debited)}</strong>
          <span>потрачено</span>
        </div>
      </section>

      <div className="leaderboard-list" aria-label="История операций с Биониками">
        {transactions.map((transaction) => {
          const positive = transaction.amount >= 0;

          return (
            <article className="leader-row" key={transaction.id}>
              <span
                className="icon-box"
                aria-hidden="true"
                style={{ flex: "0 0 auto" }}
              >
                <Icon name={positive ? "success" : "shop"} size={21} />
              </span>

              <div className="leader-copy">
                <strong>{transaction.title}</strong>
                <span>{formatDate(transaction.date)}</span>
              </div>

              <div
                className="leader-score"
                aria-label={`${positive ? "Начислено" : "Списано"} ${Math.abs(transaction.amount)} Биоников`}
                style={{
                  color: positive ? "#CB342A" : "#1D1D1B",
                  whiteSpace: "nowrap"
                }}
              >
                <Icon name="coin" size={18} />
                <strong>
                  {positive ? "+" : "−"}
                  {formatNumber(Math.abs(transaction.amount))}
                </strong>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function AchievementsView({
  stories
}: {
  stories: AchievementStory[];
}) {
  if (stories.length > 0 && stories.every(isBionicTransactionStory)) {
    return <TransactionsView transactions={stories} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="История Биоников"
        title="Достижения"
        description="Важные этапы Бионит и люди, которые превращают опыт в результат."
      />
      <section className="achievement-hero">
        <div>
          <span>35</span>
          <strong>лет в деле</strong>
          <p>Научный подход, ответственность и энергия команды.</p>
        </div>
        <Icon name="factory" size={92} />
        <div className="hero-pattern" />
      </section>
      <div className="timeline">
        {stories.map((story, index) => (
          <article
            className={`timeline-item accent-${story.accent}`}
            key={story.id}
          >
            <div className="timeline-marker">
              <span>{story.year}</span>
            </div>
            <div className="timeline-line" />
            <div className="timeline-card">
              <div>
                <span className="eyebrow">Этап {index + 1}</span>
                <h2>{story.title}</h2>
                <p>{story.description}</p>
              </div>
              {story.metric ? (
                <strong className="timeline-metric">{story.metric}</strong>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function podiumClass(rank: number): string {
  return rank === 1
    ? "podium first"
    : rank === 2
      ? "podium second"
      : "podium third";
}

export function RatingView({ data }: { data: LeaderboardsData }) {
  const top = data.employees.slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={data.periodLabel}
        title="Рейтинг"
        description="Бионики отражают вклад в обучение, адаптацию и развитие общего дела."
      />
      <section className="podium-row">
        {top.map((row) => (
          <article className={podiumClass(row.rank)} key={row.profileId}>
            <span className="rank-medal">{row.rank}</span>
            <EmployeeAvatar
              fullName={row.fullName}
              size={row.rank === 1 ? 76 : 62}
            />
            <strong>{row.fullName}</strong>
            <small>{row.departmentName}</small>
            <div>
              <Icon name="coin" size={18} />
              {formatNumber(row.score)}
            </div>
          </article>
        ))}
      </section>

      <Tabs
        className="content-tabs"
        items={[
          {
            key: "employees",
            label: "Сотрудники",
            children: (
              <div className="leaderboard-list">
                {data.employees.map((row) => (
                  <div
                    className={row.isCurrentUser ? "leader-row current" : "leader-row"}
                    key={row.profileId}
                  >
                    <span className="leader-rank">{row.rank}</span>
                    <EmployeeAvatar fullName={row.fullName} />
                    <div className="leader-copy">
                      <strong>
                        {row.fullName}
                        {row.isCurrentUser ? <small>Это вы</small> : null}
                      </strong>
                      <span>
                        {row.position} · {row.departmentName}
                      </span>
                    </div>
                    <div className="leader-score">
                      <Icon name="coin" size={18} />
                      <strong>{formatNumber(row.score)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )
          },
          {
            key: "departments",
            label: "Подразделения",
            children: (
              <div className="department-list">
                {data.departments.map((row) => (
                  <article className="department-row" key={row.departmentId}>
                    <span className="department-rank">{row.rank}</span>
                    <span className="icon-box">
                      <Icon name="department" />
                    </span>
                    <div>
                      <strong>{row.departmentName}</strong>
                      <small>{row.membersCount} сотрудников</small>
                      <Progress
                        percent={Math.round(
                          (row.score / Math.max(data.departments[0]?.score ?? 1, 1)) *
                            100
                        )}
                        showInfo={false}
                      />
                    </div>
                    <span className="department-score">
                      {formatNumber(row.score)}
                    </span>
                  </article>
                ))}
              </div>
            )
          }
        ]}
      />
    </>
  );
}

const badgeEmojiByCode: Record<string, string> = {
  FIRST_STEP: "👣",
  ACTIVIST: "⚡",
  MENTOR: "🎓",
  VOLUNTEER: "🐾",
  SPORTSMAN: "⚽",
  MASTER: "🛠️",
  LEGEND: "🏆",
  PROBATION: "✅",
  BIRTHDAY: "🎂",
  NEWBIE: "🚀"
};

function BadgeEmoji({ badge }: { badge: BadgeSummary }) {
  return (
    <span
      className={badge.locked ? "badge-art badge-emoji locked" : "badge-art badge-emoji"}
      aria-hidden="true"
      style={{
        width: 76,
        height: 76,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        border: badge.locked
          ? "2px solid #DADADA"
          : "2px solid rgba(203, 52, 42, 0.24)",
        background: badge.locked ? "#F2F2F2" : "rgba(203, 52, 42, 0.1)",
        fontSize: 36,
        lineHeight: 1,
        filter: badge.locked ? "grayscale(1)" : undefined,
        opacity: badge.locked ? 0.56 : 1
      }}
    >
      {badgeEmojiByCode[badge.code] ?? "🏅"}
    </span>
  );
}

export function BadgesView({ badges }: { badges: BadgeSummary[] }) {
  const earned = badges.filter((item) => !item.locked).length;

  return (
    <>
      <PageHeader
        eyebrow="Коллекция"
        title="Бейджи"
        description="Каждый бейдж отмечает конкретный шаг в развитии, безопасности или работе команды."
      />
      <section className="badge-summary">
        <span className="icon-box">
          <Icon name="badges" size={30} />
        </span>
        <div>
          <strong>
            {earned} из {badges.length}
          </strong>
          <span>бейджей получено</span>
        </div>
        <Progress
          percent={Math.round((earned / Math.max(badges.length, 1)) * 100)}
          showInfo={false}
        />
      </section>
      <div className="badge-grid">
        {badges.map((badge) => (
          <article
            className={badge.locked ? "badge-card locked" : "badge-card"}
            key={badge.id}
          >
            <div className="badge-art-wrap">
              <BadgeEmoji badge={badge} />
              {badge.locked ? (
                <span className="badge-lock">
                  <Icon name="lock" size={15} />
                </span>
              ) : null}
            </div>
            <span className="badge-code">{badge.code}</span>
            <h2>{badge.title}</h2>
            <p>{badge.description}</p>
            {badge.locked ? (
              <div className="badge-progress">
                <span>Прогресс {badge.progressPercent}%</span>
                <Progress percent={badge.progressPercent} showInfo={false} />
              </div>
            ) : (
              <small>
                <Icon name="success" size={16} /> Получен{" "}
                {badge.earnedAt ? formatDate(badge.earnedAt) : ""}
              </small>
            )}
            <div className="badge-reward">
              <Icon name="coin" size={17} />
              {badge.reward}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
