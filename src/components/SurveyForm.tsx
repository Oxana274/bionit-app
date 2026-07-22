"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  App,
  Button,
  Form,
  Input,
  Progress,
  Radio,
  Select,
  Steps
} from "antd";

import { PageHeader } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import type {
  SurveyAnswerValue,
  SurveyDetail,
  SurveyQuestion,
  SurveySubmission
} from "@/types/domain";

import styles from "./surveys.module.css";

const blockOrder = ["demographics", "scale", "yes_no", "open"] as const;

const blockDescriptions: Record<(typeof blockOrder)[number], string> = {
  demographics:
    "Данные используются только для агрегированной аналитики по группам сотрудников.",
  scale: "Выберите оценку от 1 — минимальная до 5 — максимальная.",
  yes_no: "Отметьте вариант, который точнее всего описывает Ваш опыт.",
  open: "Развёрнутые ответы помогут понять причины оценок и выбрать улучшения."
};

type FormValues = Record<string, SurveyAnswerValue | undefined>;

function fieldsForBlock(
  block: (typeof blockOrder)[number],
  questions: SurveyQuestion[]
): string[] {
  if (block === "demographics") {
    return [
      "departmentName",
      "gender",
      "age",
      "employeeCategory",
      "productionTenure"
    ];
  }

  return questions
    .filter((question) => question.block === block && question.required)
    .map((question) => question.code);
}

function CompletionCard({ alreadySubmitted = false }: { alreadySubmitted?: boolean }) {
  return (
    <section className={styles.completedCard}>
      <div>
        <span className={styles.completedIcon}>
          <Icon name="success" size={42} strokeWidth={1.8} />
        </span>
        <h2>{alreadySubmitted ? "Опрос уже пройден" : "Спасибо за ответы!"}</h2>
        <p>
          {alreadySubmitted
            ? "Для одного сотрудника доступна одна отправка. Ваши ответы уже учтены в общей аналитике."
            : "Ответы сохранены и будут учтены только в агрегированных показателях подразделений и компании."}
        </p>
        <Link href="/surveys">
          <Button type="primary" size="large" icon={<Icon name="arrow-left" size={18} />}>
            К списку опросов
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function SurveyForm({ initial }: { initial: SurveyDetail }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questionsByBlock = useMemo(() => {
    return Object.fromEntries(
      blockOrder.map((block) => [
        block,
        initial.questions
          .filter((question) => question.block === block)
          .sort((left, right) => left.sortOrder - right.sortOrder)
      ])
    ) as Record<(typeof blockOrder)[number], SurveyQuestion[]>;
  }, [initial.questions]);

  const currentBlock = blockOrder[step] ?? blockOrder[0];
  const currentQuestions = questionsByBlock[currentBlock];
  const progressPercent = Math.round(((step + 1) / blockOrder.length) * 100);

  const goNext = async () => {
    try {
      await form.validateFields(fieldsForBlock(currentBlock, initial.questions));
      setStep((current) => Math.min(current + 1, blockOrder.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      void message.warning("Заполните обязательные поля текущего блока.");
    }
  };

  const submit = async (values: FormValues) => {
    const answers: Record<string, SurveyAnswerValue> = {};
    initial.questions
      .filter((question) => question.number !== null)
      .forEach((question) => {
        answers[question.code] = values[question.code] ?? null;
      });

    const payload: SurveySubmission = {
      departmentName: String(values.departmentName ?? ""),
      gender: values.gender === "М" ? "М" : "Ж",
      age: Number(values.age),
      employeeCategory: String(values.employeeCategory ?? ""),
      productionTenure: String(values.productionTenure ?? ""),
      answers
    };

    setSubmitting(true);
    try {
      const response = await fetch(`/api/surveys/${initial.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Не удалось отправить ответы.");
      }

      setSubmitted(true);
      void message.success("Ответы отправлены");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      void message.error(
        error instanceof Error ? error.message : "Не удалось отправить ответы."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initial.responseSubmitted || submitted) {
    return (
      <div className={styles.page}>
        <PageHeader
          eyebrow="Опросы"
          title={initial.title}
          backHref="/surveys"
        />
        <CompletionCard alreadySubmitted={initial.responseSubmitted} />
      </div>
    );
  }

  if (initial.status !== "active") {
    return (
      <div className={styles.page}>
        <PageHeader
          eyebrow="Опросы"
          title={initial.title}
          description={initial.description}
          backHref="/surveys"
        />
        <section className={styles.completedCard}>
          <div>
            <span className={styles.completedIcon}>
              <Icon name="lock" size={38} />
            </span>
            <h2>Опрос сейчас закрыт</h2>
            <p>После открытия администратором здесь появится форма для ответов.</p>
            <Link href="/surveys">
              <Button size="large">К списку опросов</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.formTop}>
        <PageHeader
          eyebrow="Опрос вовлечённости"
          title={initial.title}
          description={initial.description}
          backHref="/surveys"
        />
        <Steps
          current={step}
          responsive={false}
          size="small"
          items={blockOrder.map((block) => ({
            title: questionsByBlock[block][0]?.blockTitle ?? block
          }))}
        />
        <Progress
          className={styles.formProgress}
          percent={progressPercent}
          showInfo={false}
          strokeColor="#CB342A"
        />
      </div>

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={(values) => void submit(values)}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
      >
        <section className={styles.blockCard}>
          <header className={styles.blockHeading}>
            <span>
              Блок {step} из {blockOrder.length - 1}
            </span>
            <h2>{currentQuestions[0]?.blockTitle ?? "Вопросы"}</h2>
            <p>{blockDescriptions[currentBlock]}</p>
          </header>

          {currentBlock === "demographics" ? (
            <div className={styles.demographicsGrid}>
              <Form.Item
                name="departmentName"
                label="Подразделение"
                rules={[{ required: true, message: "Выберите подразделение." }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Выберите подразделение"
                  options={initial.departments.map((value) => ({ value, label: value }))}
                />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Пол"
                rules={[{ required: true, message: "Выберите вариант." }]}
              >
                <Radio.Group className={styles.booleanGroup} optionType="button">
                  <Radio.Button value="М">М</Radio.Button>
                  <Radio.Button value="Ж">Ж</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="age"
                label="Возраст"
                rules={[
                  { required: true, message: "Укажите возраст." },
                  {
                    pattern: /^(?:1[6-9]|[2-9]\d|100)$/,
                    message: "Укажите возраст от 16 до 100 лет."
                  }
                ]}
              >
                <Input
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="Например, 35"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item
                name="employeeCategory"
                label="Категория сотрудника"
                rules={[{ required: true, message: "Выберите категорию." }]}
              >
                <Select
                  placeholder="Выберите категорию"
                  options={initial.employeeCategories.map((value) => ({
                    value,
                    label: value
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="productionTenure"
                label="Стаж на производстве"
                rules={[{ required: true, message: "Выберите стаж." }]}
              >
                <Select
                  placeholder="Выберите стаж"
                  options={initial.tenureOptions.map((value) => ({
                    value,
                    label: value
                  }))}
                />
              </Form.Item>
            </div>
          ) : (
            <div className={styles.questionList}>
              {currentQuestions.map((question) => (
                <article className={styles.questionCard} key={question.id}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>
                      {question.number}
                    </span>
                    <strong>{question.title}</strong>
                  </div>

                  {question.type === "scale_1_5" ? (
                    <>
                      <Form.Item
                        name={question.code}
                        rules={[
                          { required: true, message: "Выберите оценку." }
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <Radio.Group
                          className={styles.scaleGroup}
                          optionType="button"
                          buttonStyle="solid"
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Radio.Button value={value} key={value}>
                              {value}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                      <div className={styles.scaleLegend}>
                        <span>Совсем не согласен(на)</span>
                        <span>Полностью согласен(на)</span>
                      </div>
                    </>
                  ) : question.type === "yes_no" ? (
                    <Form.Item
                      name={question.code}
                      rules={[
                        { required: true, message: "Выберите ответ." }
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Radio.Group
                        className={styles.booleanGroup}
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Radio.Button value={true}>Да</Radio.Button>
                        <Radio.Button value={false}>Нет</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name={question.code}
                      rules={
                        question.required
                          ? [{ required: true, message: "Введите ответ." }]
                          : undefined
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <Input.TextArea
                        rows={4}
                        maxLength={2000}
                        showCount
                        placeholder="Введите ответ"
                      />
                    </Form.Item>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <div className={styles.formActions}>
          <Button
            size="large"
            disabled={step === 0 || submitting}
            icon={<Icon name="arrow-left" size={18} />}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Назад
          </Button>

          {step < blockOrder.length - 1 ? (
            <Button
              type="primary"
              size="large"
              icon={<Icon name="arrow-right" size={18} />}
              onClick={() => void goNext()}
            >
              Далее
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
              icon={<Icon name="success" size={18} />}
            >
              Отправить ответы
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
