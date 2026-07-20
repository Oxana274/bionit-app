"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { App, Button, Collapse, Drawer, Progress, Radio, Result, Tabs } from "antd";
import { CourseArtwork, PageHeader, StatusPill } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import type { LearningAttemptResult, LearningClassDetail, LearningClassSummary } from "@/types/domain";

export function LearningCatalog({ courses }: { courses: LearningClassSummary[] }) {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(courses.map((item) => item.category)))];
  const visible = filter === "all" ? courses : courses.filter((item) => item.category === filter);
  const passed = courses.filter((item) => item.status === "passed").length;
  return <>
    <PageHeader eyebrow="Академия Бионит" title="Обучение" description="Короткие классы, практическая теория и тесты с порогом 90%."/>
    <section className="learning-summary"><div><span className="icon-box"><Icon name="learning"/></span><div><strong>{passed} из {courses.length}</strong><span>классов пройдено</span></div></div><Progress percent={Math.round((passed / Math.max(courses.length, 1)) * 100)} showInfo={false}/><small>На каждый тест доступно не более трёх попыток.</small></section>
    <div className="filter-row">{categories.map((category) => <button type="button" key={category} className={filter === category ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(category)}>{category === "all" ? "Все классы" : category}</button>)}</div>
    <div className="course-grid">{visible.map((course) => <Link href={`/learning/${course.id}`} className="course-card" key={course.id}><CourseArtwork course={course}/><div className="course-card-body"><div className="course-card-top"><span>{course.category}</span><StatusPill status={course.status}/></div><h2>{course.title}</h2><p>{course.description}</p><div className="course-meta"><span><Icon name="clock" size={16}/>{course.durationMinutes} мин</span><span><Icon name="book" size={16}/>{course.modulesCount} модуля</span><span><Icon name="coin" size={16}/>{course.reward}</span></div>{course.progressPercent > 0 ? <Progress percent={course.progressPercent} showInfo={false}/> : null}</div></Link>)}</div>
  </>;
}

export function LearningClassView({ course }: { course: LearningClassDetail }) {
  const { message } = App.useApp();
  const [testOpen, setTestOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LearningAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const completed = course.modules.filter((item) => item.completed).length;
  const allAnswered = Object.keys(answers).length === course.questions.length;

  const moduleItems = useMemo(() => course.modules.map((module, index) => ({
    key: module.id,
    label: <div className="module-label"><span className={module.completed ? "module-number done" : "module-number"}>{module.completed ? <Icon name="check" size={16}/> : index + 1}</span><div><strong>{module.title}</strong><small>{module.durationMinutes} мин</small></div></div>,
    children: <div className="module-content"><p>{module.content}</p><div className="theory-note"><Icon name="spark"/><span>Зафиксируйте главный вывод и обсудите непонятные моменты с наставником.</span></div></div>
  })), [course.modules]);

  const submit = async () => {
    if (!allAnswered) {
      void message.warning("Ответьте на все вопросы.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/learning/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: course.id, answers })
      });
      const body = (await response.json()) as { data?: LearningAttemptResult; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Не удалось отправить тест.");
      setResult(body.data);
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setResult(null);
  };

  return <>
    <PageHeader eyebrow={course.category} title={course.title} description={course.longDescription} backHref="/learning"/>
    <section className="course-detail-hero"><CourseArtwork course={course}/><div className="course-detail-info"><StatusPill status={course.status}/><div className="course-meta large"><span><Icon name="clock"/> {course.durationMinutes} мин</span><span><Icon name="book"/> {course.modulesCount} модуля</span><span><Icon name="coin"/> +{course.reward}</span></div><div><span>Прогресс теории</span><strong>{completed} из {course.modules.length}</strong></div><Progress percent={course.progressPercent} showInfo={false}/></div><div className="test-conditions"><span className="icon-box"><Icon name="document"/></span><strong>Итоговый тест</strong><p>Порог {course.passThreshold}% · попыток {course.maxAttempts - course.attemptsUsed} из {course.maxAttempts}</p>{course.bestScore !== null ? <small>Лучший результат: {course.bestScore}%</small> : null}</div></section>

    <Tabs className="content-tabs" items={[
      { key: "theory", label: "Теория", children: <section className="modules-section"><div className="section-title"><div><span className="eyebrow">Материалы</span><h2>Модули класса</h2></div></div><Collapse className="module-collapse" items={moduleItems} defaultActiveKey={course.modules[0]?.id}/></section> },
      { key: "test", label: "Тест", children: <section className="test-launch"><span className="test-launch-icon"><Icon name="shield" size={42}/></span><div><span className="eyebrow">Проверка знаний</span><h2>Готовы пройти тест?</h2><p>Ответьте на {course.questions.length} вопроса. Для зачёта необходимо набрать не менее {course.passThreshold}%.</p><div className="test-rules"><span><Icon name="trophy"/>Награда: {course.reward} Биоников</span><span><Icon name="warning"/>Не более {course.maxAttempts} попыток</span></div></div><Button type="primary" size="large" disabled={course.attemptsUsed >= course.maxAttempts && course.status !== "passed"} onClick={() => setTestOpen(true)}>{course.status === "passed" ? "Пройти ещё раз" : "Начать тест"}</Button></section> }
    ]}/>

    <Drawer open={testOpen} onClose={() => setTestOpen(false)} title="Итоговый тест" width={620} className="test-drawer" destroyOnClose={false}>
      {result ? <Result status={result.passed ? "success" : "warning"} title={result.passed ? `Класс пройден: ${result.score}%` : `Результат: ${result.score}%`} subTitle={result.passed ? `Награда: ${result.rewardGranted} Биоников. Отличная работа!` : `Нужно ${course.passThreshold}%. Осталось попыток: ${result.attemptsLeft}.`} extra={[<Button key="close" type={result.passed ? "primary" : "default"} onClick={() => setTestOpen(false)}>Закрыть</Button>, ...(!result.passed && result.attemptsLeft > 0 ? [<Button key="retry" type="primary" onClick={resetTest}>Попробовать ещё раз</Button>] : [])]}/> : <div className="test-form"><div className="test-progress"><span>Отвечено {Object.keys(answers).length} из {course.questions.length}</span><Progress percent={Math.round((Object.keys(answers).length / Math.max(course.questions.length, 1)) * 100)} showInfo={false}/></div>{course.questions.map((question, index) => <fieldset key={question.id} className="test-question"><legend><span>{index + 1}</span>{question.prompt}</legend><Radio.Group value={answers[question.id]} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: String(event.target.value) }))}>{question.options.map((option) => <Radio key={option.id} value={option.id}>{option.label}</Radio>)}</Radio.Group></fieldset>)}<Button type="primary" size="large" block loading={submitting} disabled={!allAnswered} onClick={() => void submit()}>Отправить ответы</Button></div>}
    </Drawer>
  </>;
}
