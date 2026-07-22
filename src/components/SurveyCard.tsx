"use client";

import Link from "next/link";
import { Button } from "antd";

import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/utils/format";
import type { SurveyStatus, SurveySummary } from "@/types/domain";

import styles from "./surveys.module.css";

const statusLabel: Record<SurveyStatus, string> = {
  draft: "Скоро",
  active: "Активен",
  closed: "Завершён"
};

function statusClass(status: SurveyStatus): string {
  if (status === "active") return `${styles.status} ${styles.statusActive}`;
  if (status === "closed") return `${styles.status} ${styles.statusClosed}`;
  return `${styles.status} ${styles.statusDraft}`;
}

export function SurveyCard({ survey }: { survey: SurveySummary }) {
  const canStart = survey.status === "active" && !survey.responseSubmitted;
  const canOpen = survey.status === "active" || survey.responseSubmitted;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>
          <Icon name="document" size={25} />
        </span>
        <span className={statusClass(survey.status)}>
          <Icon
            name={survey.status === "active" ? "success" : "clock"}
            size={14}
          />
          {statusLabel[survey.status]}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h2>{survey.title}</h2>
        <p>{survey.description}</p>
        <div className={styles.cardMeta}>
          <span>
            <Icon name="clock" size={15} />
            {survey.estimatedMinutes} мин
          </span>
          <span>
            <Icon name="document" size={15} />
            {survey.questionsCount} вопросов
          </span>
          {survey.endsAt ? (
            <span>
              <Icon name="calendar" size={15} />
              до {formatDate(survey.endsAt, { year: "numeric" })}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.cardActions}>
        {survey.responseSubmitted ? (
          <span className={styles.submitted}>
            <Icon name="success" size={18} />
            Ответы отправлены
          </span>
        ) : (
          <span />
        )}

        <div className={styles.cardButtons}>
          {survey.canViewResults ? (
            <Link href={`/surveys/${survey.id}/results`}>
              <Button icon={<Icon name="trend" size={17} />}>
                Аналитика
              </Button>
            </Link>
          ) : null}
          <Link
            href={canOpen ? `/surveys/${survey.id}` : "/surveys"}
            aria-disabled={!canOpen}
          >
            <Button
              type={canStart ? "primary" : "default"}
              disabled={!canOpen || survey.responseSubmitted}
              icon={<Icon name={canStart ? "arrow-right" : "lock"} size={17} />}
            >
              {survey.responseSubmitted
                ? "Пройден"
                : survey.status === "active"
                  ? "Пройти опрос"
                  : "Опрос недоступен"}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
