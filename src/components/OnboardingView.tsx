"use client";

import { useMemo, useState } from "react";
import { App, Button, Collapse, Input, Modal, Progress, Tabs } from "antd";
import { EmployeeAvatar, PageHeader, StatusPill } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/utils/format";
import type { KnowledgeArticle, OnboardingData, OnboardingQuestion, OnboardingTask } from "@/types/domain";

export function OnboardingView({ initial }: { initial: OnboardingData }) {
  const { message } = App.useApp();
  const [stages, setStages] = useState(initial.stages);
  const [questions, setQuestions] = useState(initial.questions);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const selectedArticle = useMemo<KnowledgeArticle | null>(() => {
    if (!selectedArticleId) return null;
    return initial.knowledge.find((item) => item.id === selectedArticleId) ?? null;
  }, [initial.knowledge, selectedArticleId]);

  const progress = useMemo(() => {
    const tasks = stages.flatMap((stage) => stage.tasks);
    const complete = tasks.filter((task) => task.status === "completed").length;
    return { complete, total: tasks.length, percent: Math.round((complete / Math.max(tasks.length, 1)) * 100) };
  }, [stages]);

  const completeTask = async (task: OnboardingTask) => {
    if (task.status === "completed") return;
    setCompleting(task.id);
    try {
      const response = await fetch(`/api/onboarding/tasks/${task.id}/complete`, { method: "POST" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Не удалось завершить задание.");
      setStages((current) => current.map((stage) => ({
        ...stage,
        tasks: stage.tasks.map((item) => item.id === task.id ? { ...item, status: "completed", completedAt: new Date().toISOString() } : item)
      })));
      void message.success(`Задание выполнено: +${task.points} Биоников`);
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setCompleting(null);
    }
  };

  const ask = async () => {
    const text = question.trim();
    if (text.length < 8) {
      void message.warning("Добавьте больше деталей в вопрос.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/onboarding/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: initial.assignmentId, question: text })
      });
      const body = (await response.json()) as { data?: OnboardingQuestion; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Не удалось отправить вопрос.");
      setQuestions((current) => [body.data as OnboardingQuestion, ...current]);
      setQuestion("");
      void message.success("Вопрос отправлен наставнику");
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setSending(false);
    }
  };

  const articleText = selectedArticle?.body?.trim() || selectedArticle?.summary || "";
  const articleParagraphs = articleText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return <>
    <PageHeader eyebrow="Адаптация" title="Онбординг" description="Ваш маршрут от первого рабочего дня до уверенного старта."/>
    <section className="onboarding-summary">
      <div className="summary-copy"><span className="eyebrow light">Активная программа</span><h2>{initial.title}</h2><p>С {formatDate(initial.startDate)} до {formatDate(initial.dueDate)}</p><div className="mentor-row"><EmployeeAvatar fullName={initial.mentorName}/><div><span>Ваш наставник</span><strong>{initial.mentorName}</strong><small>{initial.mentorPosition}</small></div></div></div>
      <div className="summary-progress"><Progress type="circle" percent={progress.percent} size={128} strokeWidth={9}/><strong>{progress.complete} из {progress.total}</strong><span>заданий выполнено</span></div>
      <div className="hero-pattern"/>
    </section>

    <Tabs className="content-tabs" items={[
      {
        key: "route",
        label: "Этапы и задания",
        children: <div className="stage-list">{stages.map((stage, stageIndex) => <article className="stage-card" key={stage.id}>
          <header><span className="stage-number">{stageIndex + 1}</span><div><h3>{stage.title}</h3><p>{stage.description}</p></div><StatusPill status={stage.status}/></header>
          <div className="task-list">{stage.tasks.map((task) => <div className={task.status === "completed" ? "task-row completed" : "task-row"} key={task.id}>
            <button type="button" className="task-check" aria-label={`Завершить ${task.title}`} onClick={() => void completeTask(task)} disabled={task.status === "completed" || completing === task.id}>{task.status === "completed" ? <Icon name="check" size={18}/> : completing === task.id ? <span className="spinner"/> : null}</button>
            <div className="task-copy"><div><strong>{task.title}</strong><span className="task-points">+{task.points}</span></div><p>{task.description}</p><small>{task.dueDate ? <><Icon name="calendar" size={15}/> до {formatDate(task.dueDate)}</> : null}</small></div>
          </div>)}</div>
        </article>)}</div>
      },
      {
        key: "knowledge",
        label: "База знаний",
        children: <div className="knowledge-grid">{initial.knowledge.map((item) => (
          <article
            className="knowledge-card"
            key={item.id}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`Открыть статью «${item.title}»`}
            onClick={() => setSelectedArticleId(item.id)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setSelectedArticleId(item.id);
            }}
          >
            <span className="icon-box"><Icon name="book"/></span>
            <div><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><small><Icon name="clock" size={15}/>{item.readMinutes} мин</small></div>
            <Icon name="chevron-right"/>
          </article>
        ))}</div>
      },
      {
        key: "questions",
        label: "Вопросы",
        children: <div className="questions-layout"><section className="ask-card"><span className="icon-box"><Icon name="message"/></span><h3>Спросить наставника</h3><p>Опишите ситуацию — вопрос увидят наставник и HR.</p><Input.TextArea value={question} onChange={(event) => setQuestion(event.target.value)} rows={5} maxLength={500} showCount placeholder="Например: где найти актуальную инструкцию..."/><Button type="primary" loading={sending} onClick={() => void ask()}>Отправить вопрос</Button></section><section className="question-history"><h3>История вопросов</h3>{questions.length ? <Collapse ghost items={questions.map((item) => ({ key: item.id, label: <div className="question-label"><span>{item.question}</span><StatusPill status={item.status}/></div>, children: item.answer ? <div className="answer-box"><strong>Ответ наставника</strong><p>{item.answer}</p></div> : <p className="muted">Ответ появится здесь после обработки вопроса.</p> }))}/> : <p className="muted">Вы ещё не задавали вопросов.</p>}</section></div>
      }
    ]}/>

    <Modal
      open={selectedArticle !== null}
      onCancel={() => setSelectedArticleId(null)}
      footer={null}
      title={selectedArticle?.title ?? "Статья"}
      centered
      width={640}
      keyboard
      maskClosable
      forceRender
      getContainer={false}
      zIndex={2000}
    >
      {selectedArticle ? (
        <div className="article-modal">
          <span>{selectedArticle.category} · {selectedArticle.readMinutes} мин</span>
          {articleParagraphs.map((paragraph, index) => (
            <p key={`${selectedArticle.id}-paragraph-${index}`} style={{ whiteSpace: "pre-line" }}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </Modal>
  </>;
}
