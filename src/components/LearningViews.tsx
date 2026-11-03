
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  App,
  Button,
  Collapse,
  Drawer,
  Progress,
  Radio,
  Result,
  Tabs
} from "antd";

import {
  CourseArtwork,
  PageHeader,
  StatusPill
} from "@/components/Brand";

import { Icon } from "@/components/Icon";

import type {
  LearningAttemptResult,
  LearningClassDetail,
  LearningClassSummary
} from "@/types/domain";


export function LearningCatalog({
  courses
}: {
  courses: LearningClassSummary[];
}) {
  const [filter, setFilter] = useState("all");
  const categories = [
    "all",
    ...Array.from(new Set(courses.map((item) => item.category)))
  ];
  const filtered = filter === "all"
    ? courses
    : courses.filter((item) => item.category === filter);
  const activeCourses = filtered.filter((item) => item.courseStatus === "active");
  const inactiveCourses = filtered.filter((item) => item.courseStatus !== "active");
  const passed = courses.filter((item) => item.status === "passed").length;

  const renderCourses = (items: LearningClassSummary[]) => (
    <div className="course-grid">
      {items.map((course) => (
        <Link href={`/learning/${course.id}`} className="course-card" key={course.id} prefetch={false}>
          <CourseArtwork course={course} />
          <div className="course-card-body">
            <div className="course-card-top">
              <span>{course.category}</span>
              <StatusPill status={course.status} />
            </div>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <div className="course-meta">
              <span><Icon name="clock" size={16} />{course.durationMinutes} мин</span>
              <span><Icon name="book" size={16} />{course.modulesCount} модулей</span>
              <span><Icon name="coin" size={16} />{course.reward}</span>
            </div>
            {course.progressPercent > 0 ? <Progress percent={course.progressPercent} showInfo={false} /> : null}
            {course.courseStatus !== "active" ? <small className="course-archive-note">Неактивная программа · доступна HR</small> : null}
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Академия Бионит"
        title="Обучение"
        description="Назначенные учебные программы, материалы и результаты обучения."
      />
      <section className="learning-summary">
        <div>
          <span className="icon-box"><Icon name="learning" /></span>
          <div><strong>{passed} из {courses.length}</strong><span>курсов пройдено</span></div>
        </div>
        <Progress percent={Math.round((passed / Math.max(courses.length, 1)) * 100)} showInfo={false} />
        <small>Количество попыток определяется настройками каждого курса.</small>
      </section>
      {categories.length > 2 ? (
        <div className="filter-row">
          {categories.map((category) => (
            <button type="button" key={category}
              className={filter === category ? "filter-chip active" : "filter-chip"}
              onClick={() => setFilter(category)}>
              {category === "all" ? "Все программы" : category}
            </button>
          ))}
        </div>
      ) : null}
      {activeCourses.length > 0 ? (
        <section className="learning-catalog-section">
          <div className="section-title"><div><span className="eyebrow">Рабочий каталог</span><h2>Действующие программы</h2></div></div>
          {renderCourses(activeCourses)}
        </section>
      ) : null}
      {inactiveCourses.length > 0 ? (
        <section className="learning-catalog-section">
          <div className="section-title"><div><span className="eyebrow">Только для HR и администраторов</span><h2>Черновики и архив</h2></div></div>
          {renderCourses(inactiveCourses)}
        </section>
      ) : null}
      {activeCourses.length === 0 && inactiveCourses.length === 0 ? (
        <div className="empty-card"><Icon name="book" size={36} /><h3>Пока нет назначенных программ</h3><p>Когда HR назначит обучение, оно появится здесь.</p></div>
      ) : null}
    </>
  );
}


export function LearningClassView({
  course
}: {
  course: LearningClassDetail;
}) {
  const { message } = App.useApp();

  const [testOpen, setTestOpen] = useState(false);

  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [result, setResult] =
    useState<LearningAttemptResult | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [completingModuleId, setCompletingModuleId] =
    useState<string | null>(null);

  const [completedModuleIds, setCompletedModuleIds] =
    useState<string[]>([]);

  const completed = course.modules.filter(
    (item) =>
      item.completed ||
      completedModuleIds.includes(item.id)
  ).length;

  const allAnswered =
    Object.keys(answers).length === course.questions.length;


  // Сохранение прогресса изучения модуля
  const completeModule = useCallback(
    async (moduleId: string) => {
      setCompletingModuleId(moduleId);

      try {
        const response = await fetch(
          `/api/learning/modules/${moduleId}/complete`,
          {
            method: "POST"
          }
        );

        const body = (await response.json()) as {
          data?: {
            progressPercent: number;
          };
          error?: string;
        };

        if (!response.ok || !body.data) {
          throw new Error(
            body.error ??
              "Не удалось сохранить прогресс модуля."
          );
        }

        setCompletedModuleIds((current) =>
          current.includes(moduleId)
            ? current
            : [...current, moduleId]
        );

        void message.success(
          "Прогресс модуля сохранён."
        );
      } catch (error) {
        void message.error(
          error instanceof Error
            ? error.message
            : "Ошибка сохранения прогресса."
        );
      } finally {
        setCompletingModuleId(null);
      }
    },
    [message]
  );


  // Формирование списка учебных модулей
  const moduleItems = useMemo(
    () =>
      course.modules.map((module, index) => {
        const isCompleted =
          module.completed ||
          completedModuleIds.includes(module.id);

        return {
          key: module.id,

          label: (
            <div className="module-label">
              <span
                className={
                  isCompleted
                    ? "module-number done"
                    : "module-number"
                }
              >
                {isCompleted ? (
                  <Icon name="check" size={16} />
                ) : (
                  index + 1
                )}
              </span>

              <div>
                <strong>{module.title}</strong>
                <small>
                  {module.durationMinutes} мин
                </small>
              </div>
            </div>
          ),

          children: (
            <div className="module-content">
              <p>{module.content}</p>

              <div className="theory-note">
                <Icon name="spark" />

                <span>
                  Зафиксируйте главный вывод и обсудите
                  непонятные моменты с наставником.
                </span>
              </div>

              <Button
                size="small"
                type={isCompleted ? "default" : "primary"}
                disabled={isCompleted}
                loading={
                  completingModuleId === module.id
                }
                onClick={() =>
                  void completeModule(module.id)
                }
              >
                {isCompleted
                  ? "Модуль изучен"
                  : "Отметить как изученный"}
              </Button>
            </div>
          )
        };
      }),
    [
      course.modules,
      completedModuleIds,
      completingModuleId,
      completeModule
    ]
  );


  // Отправка итогового теста
  const submit = async () => {
    if (!allAnswered) {
      void message.warning(
        "Ответьте на все вопросы."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/learning/attempts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            classId: course.id,
            answers
          })
        }
      );

      const body = (await response.json()) as {
        data?: LearningAttemptResult;
        error?: string;
      };

      if (!response.ok || !body.data) {
        throw new Error(
          body.error ?? "Не удалось отправить тест."
        );
      }

      setResult(body.data);
    } catch (error) {
      void message.error(
        error instanceof Error
          ? error.message
          : "Ошибка отправки теста."
      );
    } finally {
      setSubmitting(false);
    }
  };


  // Повторная попытка
  const resetTest = () => {
    setAnswers({});
    setResult(null);
  };


  return (
    <>
      <PageHeader
        eyebrow={course.category}
        title={course.title}
        description={course.longDescription}
        backHref="/learning"
      />

      <section className="course-detail-hero">
        <CourseArtwork course={course} />

        <div className="course-detail-info">
          <StatusPill status={course.status} />

          <div className="course-meta large">
            <span>
              <Icon name="clock" />
              {course.durationMinutes} мин
            </span>

            <span>
              <Icon name="book" />
              {course.modulesCount} модуля
            </span>

            <span>
              <Icon name="coin" />
              +{course.reward}
            </span>
          </div>

          <div>
            <span>Прогресс теории</span>

            <strong>
              {completed} из {course.modules.length}
            </strong>
          </div>

          <Progress
            percent={
              course.modules.length
                ? Math.round(
                    (completed / course.modules.length) * 100
                  )
                : 0
            }
            showInfo={false}
          />
        </div>

        <div className="test-conditions">
          <span className="icon-box">
            <Icon name="document" />
          </span>

          <strong>Итоговый тест</strong>

          <p>
            Порог {course.passThreshold}% · попыток{" "}
            {course.maxAttempts - course.attemptsUsed} из{" "}
            {course.maxAttempts}
          </p>

          {course.bestScore !== null && (
            <small>
              Лучший результат: {course.bestScore}%
            </small>
          )}
        </div>
      </section>


      <Tabs
        className="content-tabs"
        items={[
          {
            key: "theory",
            label: "Теория",

            children: (
              <section className="modules-section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      Материалы
                    </span>

                    <h2>Модули курса</h2>
                  </div>
                </div>

                <Collapse
                  className="module-collapse"
                  items={moduleItems}
                  defaultActiveKey={
                    course.modules[0]?.id
                  }
                />
              </section>
            )
          },

          {
            key: "test",
            label: "Тест",

            children: (
              <section className="test-launch">
                <span className="test-launch-icon">
                  <Icon name="shield" size={42} />
                </span>

                <div>
                  <span className="eyebrow">
                    Проверка знаний
                  </span>

                  <h2>Готовы пройти тест?</h2>

                  <p>
                    Ответьте на {course.questions.length}{" "}
                    вопроса. Для зачёта необходимо набрать
                    не менее {course.passThreshold}%.
                  </p>

                  <div className="test-rules">
                    <span>
                      <Icon name="trophy" />
                      Награда: {course.reward} Биоников
                    </span>

                    <span>
                      <Icon name="warning" />
                      Не более {course.maxAttempts} попыток
                    </span>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  disabled={
                    course.attemptsUsed >= course.maxAttempts &&
                    course.status !== "passed"
                  }
                  onClick={() => setTestOpen(true)}
                >
                  {course.status === "passed"
                    ? "Пройти ещё раз"
                    : "Начать тест"}
                </Button>
              </section>
            )
          }
        ]}
      />


      <Drawer
        open={testOpen}
        onClose={() => setTestOpen(false)}
        title="Итоговый тест"
        width={620}
        className="test-drawer"
        destroyOnClose={false}
      >
        {result ? (
          <Result
            status={
              result.passed
                ? "success"
                : "warning"
            }
            title={
              result.passed
                ? `Курс пройден: ${result.score}%`
                : `Результат: ${result.score}%`
            }
            subTitle={
              result.passed
                ? `Награда: ${result.rewardGranted} Биоников. Отличная работа!`
                : `Нужно ${course.passThreshold}%. Осталось попыток: ${result.attemptsLeft}.`
            }
            extra={[
              <Button
                key="close"
                type={
                  result.passed
                    ? "primary"
                    : "default"
                }
                onClick={() => setTestOpen(false)}
              >
                Закрыть
              </Button>,

              ...(
                !result.passed &&
                result.attemptsLeft > 0
                  ? [
                      <Button
                        key="retry"
                        type="primary"
                        onClick={resetTest}
                      >
                        Попробовать ещё раз
                      </Button>
                    ]
                  : []
              )
            ]}
          />
        ) : (
          <div className="test-form">
            <div className="test-progress">
              <span>
                Отвечено {Object.keys(answers).length} из{" "}
                {course.questions.length}
              </span>

              <Progress
                percent={Math.round(
                  (Object.keys(answers).length /
                    Math.max(course.questions.length, 1)) *
                    100
                )}
                showInfo={false}
              />
            </div>

            {course.questions.map(
              (question, index) => (
                <fieldset
                  key={question.id}
                  className="test-question"
                >
                  <legend>
                    <span>{index + 1}</span>
                    {question.prompt}
                  </legend>

                  <Radio.Group
                    value={answers[question.id]}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: String(
                          event.target.value
                        )
                      }))
                    }
                  >
                    {question.options.map(
                      (option) => (
                        <Radio
                          key={option.id}
                          value={option.id}
                        >
                          {option.label}
                        </Radio>
                      )
                    )}
                  </Radio.Group>
                </fieldset>
              )
            )}

            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              disabled={!allAnswered}
              onClick={() => void submit()}
            >
              Отправить ответы
            </Button>
          </div>
        )}
      </Drawer>
    </>
  );
}
