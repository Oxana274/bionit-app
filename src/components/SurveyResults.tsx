"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Select } from "antd";

import { PageHeader } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import type { SurveyFilterState, SurveyResultsData } from "@/types/domain";

import styles from "./surveys.module.css";

function percent(value: number): string {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value)}%`;
}

function share(value: number): string {
  return `${value.toFixed(2)} (${percent(value * 100)})`;
}

export function SurveyResults({ initial }: { initial: SurveyResultsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const applied = initial.filters.applied;

  const updateFilter = (key: keyof SurveyFilterState, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      router.refresh();
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
      router.refresh();
    });
  };

  const hasFilters = Boolean(
    applied.department || applied.employeeCategory || applied.productionTenure
  );

  const departmentColumns = useMemo(
    () => initial.departments.filter((department) => department.respondentCount > 0),
    [initial.departments]
  );

  return (
    <div className={styles.page}>
      <div className={styles.resultsHeader}>
        <PageHeader
          eyebrow="HR-аналитика"
          title={initial.survey.title}
          description="Агрегированные показатели вовлечённости по компании и подразделениям."
          backHref="/surveys"
        />
        <Button
          icon={<Icon name="arrow-left" size={17} />}
          onClick={() => router.push("/admin")}
        >
          В админ-панель
        </Button>
      </div>

      <section className={styles.filtersCard} aria-busy={pending}>
        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label htmlFor="survey-department-filter">Подразделение</label>
            <Select
              id="survey-department-filter"
              allowClear
              showSearch
              optionFilterProp="label"
              value={applied.department ?? undefined}
              placeholder="Все подразделения"
              loading={pending}
              options={initial.filters.departments.map((value) => ({
                value,
                label: value
              }))}
              onChange={(value) => updateFilter("department", value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="survey-category-filter">Категория сотрудников</label>
            <Select
              id="survey-category-filter"
              allowClear
              value={applied.employeeCategory ?? undefined}
              placeholder="Все категории"
              loading={pending}
              options={initial.filters.employeeCategories.map((value) => ({
                value,
                label: value
              }))}
              onChange={(value) => updateFilter("employeeCategory", value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="survey-tenure-filter">Стаж</label>
            <Select
              id="survey-tenure-filter"
              allowClear
              value={applied.productionTenure ?? undefined}
              placeholder="Любой стаж"
              loading={pending}
              options={initial.filters.tenureOptions.map((value) => ({
                value,
                label: value
              }))}
              onChange={(value) => updateFilter("productionTenure", value)}
            />
          </div>

          <Button disabled={!hasFilters || pending} onClick={clearFilters}>
            Сбросить фильтры
          </Button>
        </div>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metric}>
          <span className={styles.metricIcon}>
            <Icon name="trend" size={21} />
          </span>
          <strong>{initial.totals.enps.toFixed(2)}</strong>
          <span>eNPS, средний балл из 5</span>
        </article>
        <article className={styles.metric}>
          <span className={styles.metricIcon}>
            <Icon name="team" size={21} />
          </span>
          <strong>{share(initial.totals.q20Share)}</strong>
          <span>Q20: есть лучший друг на работе</span>
        </article>
        <article className={styles.metric}>
          <span className={styles.metricIcon}>
            <Icon name="employee" size={21} />
          </span>
          <strong>
            {initial.totals.respondentCount} / {initial.totals.employeeTotal}
          </strong>
          <span>опрошено сотрудников</span>
        </article>
        <article className={styles.metric}>
          <span className={styles.metricIcon}>
            <Icon name="success" size={21} />
          </span>
          <strong>{percent(initial.totals.responseRatePercent)}</strong>
          <span>доля участия от 134 сотрудников</span>
        </article>
      </section>

      <div className={styles.resultsGrid}>
        <section className={styles.resultsCard}>
          <h2>Показатели по подразделениям</h2>
          <p>
            eNPS рассчитан как средний балл по вопросам 1–3. Q20 — доля
            ответов «Да» от 0 до 1, отображённая в процентах.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Подразделение</th>
                  <th>Ответов</th>
                  <th>eNPS / 5</th>
                  <th>Q20</th>
                </tr>
              </thead>
              <tbody>
                {initial.departments.map((department) => (
                  <tr key={department.departmentName}>
                    <td>{department.departmentName}</td>
                    <td>{department.respondentCount}</td>
                    <td>{department.enps.toFixed(2)}</td>
                    <td>{share(department.q20Share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.resultsCard}>
          <h2>Процент ответов «Да» по вопросам Q4–Q20</h2>
          <p>
            В таблице показана доля положительных ответов по компании и
            каждому подразделению с полученными ответами.
          </p>
          {departmentColumns.length === 0 ? (
            <div className={styles.empty}>По выбранным фильтрам ответов нет.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th>Вопрос</th>
                    <th>Компания</th>
                    {departmentColumns.map((department) => (
                      <th key={department.departmentName}>
                        {department.departmentName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initial.yesNoQuestions.map((question) => (
                    <tr key={question.code}>
                      <td>
                        <strong>Q{question.number}.</strong> {question.title}
                      </td>
                      <td>
                        <span className={styles.matrixValue}>
                          {percent(question.overallPercent)}
                        </span>
                      </td>
                      {departmentColumns.map((department) => (
                        <td key={`${question.code}-${department.departmentName}`}>
                          <span className={styles.matrixValue}>
                            {percent(
                              department.yesPercentages[question.code] ?? 0
                            )}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
