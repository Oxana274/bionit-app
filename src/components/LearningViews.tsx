"use client";

import { useCallback, useMemo, useState } from "react";
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
    <PageHeader eyebrow="РђРєР°РґРµРјРёСЏ Р‘РёРѕРЅРёС‚" title="РћР±СѓС‡РµРЅРёРµ" description="РљРѕСЂРѕС‚РєРёРµ РєСѓСЂСЃС‹, РїСЂР°РєС‚РёС‡РµСЃРєР°СЏ С‚РµРѕСЂРёСЏ Рё С‚РµСЃС‚С‹ СЃ РїРѕСЂРѕРіРѕРј 90%."/>
    <section className="learning-summary"><div><span className="icon-box"><Icon name="learning"/></span><div><strong>{passed} РёР· {courses.length}</strong><span>РєСѓСЂСЃРѕРІ РїСЂРѕР№РґРµРЅРѕ</span></div></div><Progress percent={Math.round((passed / Math.max(courses.length, 1)) * 100)} showInfo={false}/><small>РќР° РєР°Р¶РґС‹Р№ С‚РµСЃС‚ РґРѕСЃС‚СѓРїРЅРѕ РЅРµ Р±РѕР»РµРµ С‚СЂС‘С… РїРѕРїС‹С‚РѕРє.</small></section>
    <div className="filter-row">{categories.map((category) => <button type="button" key={category} className={filter === category ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(category)}>{category === "all" ? "Р’СЃРµ РєСѓСЂСЃС‹" : category}</button>)}</div>
    <div className="course-grid">{visible.map((course) => <Link href={`/learning/${course.id}`} className="course-card" key={course.id}><CourseArtwork course={course}/><div className="course-card-body"><div className="course-card-top"><span>{course.category}</span><StatusPill status={course.status}/></div><h2>{course.title}</h2><p>{course.description}</p><div className="course-meta"><span><Icon name="clock" size={16}/>{course.durationMinutes} РјРёРЅ</span><span><Icon name="book" size={16}/>{course.modulesCount} РјРѕРґСѓР»СЏ</span><span><Icon name="coin" size={16}/>{course.reward}</span></div>{course.progressPercent > 0 ? <Progress percent={course.progressPercent} showInfo={false}/> : null}</div></Link>)}</div>
  </>;
}

export function LearningClassView({ course }: { course: LearningClassDetail }) {
  const { message } = App.useApp();
  const [testOpen, setTestOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LearningAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completingModuleId, setCompletingModuleId] = useState<string | null>(null);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const completed = course.modules.filter((item) => item.completed || completedModuleIds.includes(item.id)).length;
  const allAnswered = Object.keys(answers).length === course.questions.length;

    const completeModule = useCallback(async (moduleId: string) => {
    setCompletingModuleId(moduleId);
    try {
      const response = await fetch(`/api/learning/modules/${moduleId}/complete`, { method: "POST" });
      const body = await response.json() as { data?: { progressPercent: number }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РїСЂРѕРіСЂРµСЃСЃ РјРѕРґСѓР»СЏ.");
      setCompletedModuleIds((current) => current.includes(moduleId) ? current : [...current, moduleId]);
      void message.success("РџСЂРѕРіСЂРµСЃСЃ РјРѕРґСѓР»СЏ СЃРѕС…СЂР°РЅС‘РЅ.");
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ РїСЂРѕРіСЂРµСЃСЃР°.");
    } finally {
      setCompletingModuleId(null);
    }
  }, [message]);

  const moduleItems = useMemo(() => course.modules.map((module, index) => {
    const isCompleted = module.completed || completedModuleIds.includes(module.id);
    return {
      key: module.id,
      label: <div className="module-label"><span className={isCompleted ? "module-number done" : "module-number"}>{isCompleted ? <Icon name="check" size={16}/> : index + 1}</span><div><strong>{module.title}</strong><small>{module.durationMinutes} РјРёРЅ</small></div></div>,
      children: <div className="module-content"><p>{module.content}</p><div className="theory-note"><Icon name="spark"/><span>Р—Р°С„РёРєСЃРёСЂСѓР№С‚Рµ РіР»Р°РІРЅС‹Р№ РІС‹РІРѕРґ Рё РѕР±СЃСѓРґРёС‚Рµ РЅРµРїРѕРЅСЏС‚РЅС‹Рµ РјРѕРјРµРЅС‚С‹ СЃ РЅР°СЃС‚Р°РІРЅРёРєРѕРј.</span></div><Button size="small" type={isCompleted ? "default" : "primary"} disabled={isCompleted} loading={completingModuleId === module.id} onClick={() => void completeModule(module.id)}>{isCompleted ? "РњРѕРґСѓР»СЊ РёР·СѓС‡РµРЅ" : "РћС‚РјРµС‚РёС‚СЊ РєР°Рє РёР·СѓС‡РµРЅРЅС‹Р№"}</Button></div>
    };
  }), [course.modules, completedModuleIds, completingModuleId, completeModule]);

  const submit = async () => {
    if (!allAnswered) {
      void message.warning("РћС‚РІРµС‚СЊС‚Рµ РЅР° РІСЃРµ РІРѕРїСЂРѕСЃС‹.");
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
      if (!response.ok || !body.data) throw new Error(body.error ?? "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ С‚РµСЃС‚.");
      setResult(body.data);
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "РћС€РёР±РєР°");
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
    <section className="course-detail-hero"><CourseArtwork course={course}/><div className="course-detail-info"><StatusPill status={course.status}/><div className="course-meta large"><span><Icon name="clock"/> {course.durationMinutes} РјРёРЅ</span><span><Icon name="book"/> {course.modulesCount} РјРѕРґСѓР»СЏ</span><span><Icon name="coin"/> +{course.reward}</span></div><div><span>РџСЂРѕРіСЂРµСЃСЃ С‚РµРѕСЂРёРё</span><strong>{completed} РёР· {course.modules.length}</strong></div><Progress percent={course.modules.length ? Math.round((completed / course.modules.length) * 100) : 0} showInfo={false}/></div><div className="test-conditions"><span className="icon-box"><Icon name="document"/></span><strong>РС‚РѕРіРѕРІС‹Р№ С‚РµСЃС‚</strong><p>РџРѕСЂРѕРі {course.passThreshold}% В· РїРѕРїС‹С‚РѕРє {course.maxAttempts - course.attemptsUsed} РёР· {course.maxAttempts}</p>{course.bestScore !== null ? <small>Р›СѓС‡С€РёР№ СЂРµР·СѓР»СЊС‚Р°С‚: {course.bestScore}%</small> : null}</div></section>

    <Tabs className="content-tabs" items={[
      { key: "theory", label: "РўРµРѕСЂРёСЏ", children: <section className="modules-section"><div className="section-title"><div><span className="eyebrow">РњР°С‚РµСЂРёР°Р»С‹</span><h2>РњРѕРґСѓР»Рё РєСѓСЂСЃР°</h2></div></div><Collapse className="module-collapse" items={moduleItems} defaultActiveKey={course.modules[0]?.id}/></section> },
      { key: "test", label: "РўРµСЃС‚", children: <section className="test-launch"><span className="test-launch-icon"><Icon name="shield" size={42}/></span><div><span className="eyebrow">РџСЂРѕРІРµСЂРєР° Р·РЅР°РЅРёР№</span><h2>Р“РѕС‚РѕРІС‹ РїСЂРѕР№С‚Рё С‚РµСЃС‚?</h2><p>РћС‚РІРµС‚СЊС‚Рµ РЅР° {course.questions.length} РІРѕРїСЂРѕСЃР°. Р”Р»СЏ Р·Р°С‡С‘С‚Р° РЅРµРѕР±С…РѕРґРёРјРѕ РЅР°Р±СЂР°С‚СЊ РЅРµ РјРµРЅРµРµ {course.passThreshold}%.</p><div className="test-rules"><span><Icon name="trophy"/>РќР°РіСЂР°РґР°: {course.reward} Р‘РёРѕРЅРёРєРѕРІ</span><span><Icon name="warning"/>РќРµ Р±РѕР»РµРµ {course.maxAttempts} РїРѕРїС‹С‚РѕРє</span></div></div><Button type="primary" size="large" disabled={course.attemptsUsed >= course.maxAttempts && course.status !== "passed"} onClick={() => setTestOpen(true)}>{course.status === "passed" ? "РџСЂРѕР№С‚Рё РµС‰С‘ СЂР°Р·" : "РќР°С‡Р°С‚СЊ С‚РµСЃС‚"}</Button></section> }
    ]}/>

    <Drawer open={testOpen} onClose={() => setTestOpen(false)} title="РС‚РѕРіРѕРІС‹Р№ С‚РµСЃС‚" width={620} className="test-drawer" destroyOnClose={false}>
      {result ? <Result status={result.passed ? "success" : "warning"} title={result.passed ? `РљСѓСЂСЃ РїСЂРѕР№РґРµРЅ: ${result.score}%` : `Р РµР·СѓР»СЊС‚Р°С‚: ${result.score}%`} subTitle={result.passed ? `РќР°РіСЂР°РґР°: ${result.rewardGranted} Р‘РёРѕРЅРёРєРѕРІ. РћС‚Р»РёС‡РЅР°СЏ СЂР°Р±РѕС‚Р°!` : `РќСѓР¶РЅРѕ ${course.passThreshold}%. РћСЃС‚Р°Р»РѕСЃСЊ РїРѕРїС‹С‚РѕРє: ${result.attemptsLeft}.`} extra={[<Button key="close" type={result.passed ? "primary" : "default"} onClick={() => setTestOpen(false)}>Р—Р°РєСЂС‹С‚СЊ</Button>, ...(!result.passed && result.attemptsLeft > 0 ? [<Button key="retry" type="primary" onClick={resetTest}>РџРѕРїСЂРѕР±РѕРІР°С‚СЊ РµС‰С‘ СЂР°Р·</Button>] : [])]}/> : <div className="test-form"><div className="test-progress"><span>РћС‚РІРµС‡РµРЅРѕ {Object.keys(answers).length} РёР· {course.questions.length}</span><Progress percent={Math.round((Object.keys(answers).length / Math.max(course.questions.length, 1)) * 100)} showInfo={false}/></div>{course.questions.map((question, index) => <fieldset key={question.id} className="test-question"><legend><span>{index + 1}</span>{question.prompt}</legend><Radio.Group value={answers[question.id]} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: String(event.target.value) }))}>{question.options.map((option) => <Radio key={option.id} value={option.id}>{option.label}</Radio>)}</Radio.Group></fieldset>)}<Button type="primary" size="large" block loading={submitting} disabled={!allAnswered} onClick={() => void submit()}>РћС‚РїСЂР°РІРёС‚СЊ РѕС‚РІРµС‚С‹</Button></div>}
    </Drawer>
  </>;
}

