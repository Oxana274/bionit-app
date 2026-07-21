import type { Metadata } from "next";

import { PageHeader } from "@/components/Brand";
import { SurveyCard } from "@/components/SurveyCard";
import { loadSurveys } from "@/lib/data/loaders";
import { requireAccessToken } from "@/lib/supabase/server";

import styles from "@/components/surveys.module.css";

export const metadata: Metadata = { title: "Опросы" };
export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const accessToken = requireAccessToken();
  const surveys = await loadSurveys(accessToken);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Вовлечённость"
        title="Опросы"
        description="Поделитесь мнением о работе, взаимодействии и условиях в компании. Ответы используются в агрегированной HR-аналитике."
      />

      {surveys.length > 0 ? (
        <section className={styles.list}>
          {surveys.map((survey) => (
            <SurveyCard survey={survey} key={survey.id} />
          ))}
        </section>
      ) : (
        <section className={styles.empty}>
          Сейчас нет доступных опросов. Новые опросы появятся здесь после
          открытия администратором.
        </section>
      )}
    </div>
  );
}
