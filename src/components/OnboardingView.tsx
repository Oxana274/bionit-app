"use client";

import { Fragment, useMemo, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { App, Button, Collapse, Input, Modal, Progress, Tabs } from "antd";
import { EmployeeAvatar, PageHeader, StatusPill } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/utils/format";
import type {
  KnowledgeArticle,
  OnboardingData,
  OnboardingQuestion,
  OnboardingTask
} from "@/types/domain";

type TableAlignment = "left" | "center" | "right";

type ArticleTextBlock = {
  type: "text";
  content: string;
};

type ArticleTableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
  alignments: TableAlignment[];
};

type ArticleBlock = ArticleTextBlock | ArticleTableBlock;

const articleTableWrapperStyle: CSSProperties = {
  width: "100%",
  margin: "20px 0 24px",
  overflowX: "auto",
  border: "1px solid #DADADA",
  borderRadius: 14,
  background: "#FFFFFF",
  boxShadow: "0 8px 24px rgba(29, 29, 27, 0.06)"
};

const articleTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  borderSpacing: 0,
  fontSize: 14,
  lineHeight: 1.45
};

const articleTableHeaderCellStyle: CSSProperties = {
  padding: "12px 14px",
  border: "1px solid #A71916",
  background: "#CB342A",
  color: "#FFFFFF",
  fontWeight: 700,
  verticalAlign: "top",
  whiteSpace: "normal"
};

const articleTableCellStyle: CSSProperties = {
  padding: "12px 14px",
  border: "1px solid #DADADA",
  color: "#1D1D1B",
  verticalAlign: "top",
  whiteSpace: "pre-line"
};

/**
 * Разбивает строку markdown-таблицы на ячейки.
 * Поддерживает как строки с внешними пайпами, так и без них.
 */
function splitMarkdownTableRow(line: string): string[] {
  const escapedPipePlaceholder = "\uE000";
  const normalized = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .replace(/\\\|/g, escapedPipePlaceholder);

  return normalized.split("|").map((cell) =>
    cell
      .replaceAll(escapedPipePlaceholder, "|")
      .trim()
  );
}

function isMarkdownTableSeparator(line: string): boolean {
  const cells = splitMarkdownTableRow(line);

  return (
    cells.length >= 2 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")))
  );
}

function isMarkdownTableRow(line: string): boolean {
  if (!line.includes("|")) return false;

  return splitMarkdownTableRow(line).length >= 2;
}

function getTableAlignment(separatorCell: string): TableAlignment {
  const normalized = separatorCell.replace(/\s+/g, "");
  const startsWithColon = normalized.startsWith(":");
  const endsWithColon = normalized.endsWith(":");

  if (startsWithColon && endsWithColon) return "center";
  if (endsWithColon) return "right";

  return "left";
}

/**
 * Преобразует body статьи в последовательность обычных текстовых блоков
 * и markdown-таблиц. Внешняя markdown-библиотека не требуется.
 */
function parseArticleBody(source: string): ArticleBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let textLines: string[] = [];

  const flushText = () => {
    const content = textLines.join("\n").trim();

    if (content) {
      blocks.push({ type: "text", content });
    }

    textLines = [];
  };

  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index] ?? "";
    const separatorLine = lines[index + 1] ?? "";

    const tableStartsHere =
      isMarkdownTableRow(currentLine) &&
      isMarkdownTableSeparator(separatorLine);

    if (!tableStartsHere) {
      textLines.push(currentLine);
      index += 1;
      continue;
    }

    flushText();

    const headers = splitMarkdownTableRow(currentLine);
    const separatorCells = splitMarkdownTableRow(separatorLine);
    const alignments = headers.map((_, columnIndex) =>
      getTableAlignment(separatorCells[columnIndex] ?? "---")
    );
    const rows: string[][] = [];

    index += 2;

    while (index < lines.length) {
      const rowLine = lines[index] ?? "";

      if (
        !rowLine.trim() ||
        !isMarkdownTableRow(rowLine) ||
        isMarkdownTableSeparator(rowLine)
      ) {
        break;
      }

      const parsedCells = splitMarkdownTableRow(rowLine);
      const normalizedCells = headers.map(
        (_, columnIndex) => parsedCells[columnIndex] ?? ""
      );

      rows.push(normalizedCells);
      index += 1;
    }

    blocks.push({
      type: "table",
      headers,
      rows,
      alignments
    });
  }

  flushText();

  return blocks;
}

function renderInlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const tokens = value
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean);

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-inline-${index}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={key}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={key}
          style={{
            padding: "2px 5px",
            borderRadius: 5,
            background: "#F2F2F2",
            fontFamily: "monospace",
            fontSize: "0.92em"
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return token;
  });
}

function renderTextBlock(content: string, keyPrefix: string): ReactNode[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, paragraphIndex) => {
      const lines = paragraph.split("\n");

      return (
        <p key={`${keyPrefix}-paragraph-${paragraphIndex}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={`${keyPrefix}-line-${paragraphIndex}-${lineIndex}`}>
              {renderInlineMarkdown(
                line,
                `${keyPrefix}-${paragraphIndex}-${lineIndex}`
              )}
              {lineIndex < lines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </p>
      );
    });
}

function ArticleTable({
  block,
  articleId,
  tableIndex
}: {
  block: ArticleTableBlock;
  articleId: string;
  tableIndex: number;
}) {
  const minimumTableWidth = Math.max(560, block.headers.length * 180);

  return (
    <div
      key={`${articleId}-table-${tableIndex}`}
      role="region"
      aria-label={`Таблица ${tableIndex + 1}`}
      tabIndex={0}
      style={articleTableWrapperStyle}
    >
      <table
        style={{
          ...articleTableStyle,
          minWidth: minimumTableWidth
        }}
      >
        <thead>
          <tr>
            {block.headers.map((header, columnIndex) => (
              <th
                key={`${articleId}-table-${tableIndex}-header-${columnIndex}`}
                scope="col"
                style={{
                  ...articleTableHeaderCellStyle,
                  textAlign: block.alignments[columnIndex] ?? "left"
                }}
              >
                {renderInlineMarkdown(
                  header,
                  `${articleId}-table-${tableIndex}-header-${columnIndex}`
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr
              key={`${articleId}-table-${tableIndex}-row-${rowIndex}`}
              style={{
                background: rowIndex % 2 === 0 ? "#FFFFFF" : "#F7F7F7"
              }}
            >
              {block.headers.map((_, columnIndex) => (
                <td
                  key={`${articleId}-table-${tableIndex}-row-${rowIndex}-cell-${columnIndex}`}
                  style={{
                    ...articleTableCellStyle,
                    textAlign: block.alignments[columnIndex] ?? "left"
                  }}
                >
                  {renderInlineMarkdown(
                    row[columnIndex] ?? "",
                    `${articleId}-table-${tableIndex}-row-${rowIndex}-cell-${columnIndex}`
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OnboardingView({ initial }: { initial: OnboardingData }) {
  const { message } = App.useApp();
  const [stages, setStages] = useState(initial.stages);
  const [questions, setQuestions] = useState(initial.questions);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const progress = useMemo(() => {
    const tasks = stages.flatMap((stage) => stage.tasks);
    const complete = tasks.filter((task) => task.status === "completed").length;

    return {
      complete,
      total: tasks.length,
      percent: Math.round((complete / Math.max(tasks.length, 1)) * 100)
    };
  }, [stages]);

  const selectedArticle = useMemo<KnowledgeArticle | null>(() => {
    if (!selectedArticleId) return null;

    return initial.knowledge.find((item) => item.id === selectedArticleId) ?? null;
  }, [initial.knowledge, selectedArticleId]);

  const completeTask = async (task: OnboardingTask) => {
    if (task.status === "completed") return;

    setCompleting(task.id);

    try {
      const response = await fetch(`/api/onboarding/tasks/${task.id}/complete`, {
        method: "POST"
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Не удалось завершить задание.");
      }

      setStages((current) =>
        current.map((stage) => ({
          ...stage,
          tasks: stage.tasks.map((item) =>
            item.id === task.id
              ? {
                  ...item,
                  status: "completed",
                  completedAt: new Date().toISOString()
                }
              : item
          )
        }))
      );

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
        body: JSON.stringify({
          assignmentId: initial.assignmentId,
          question: text
        })
      });
      const body = (await response.json()) as {
        data?: OnboardingQuestion;
        error?: string;
      };

      if (!response.ok || !body.data) {
        throw new Error(body.error ?? "Не удалось отправить вопрос.");
      }

      setQuestions((current) => [body.data as OnboardingQuestion, ...current]);
      setQuestion("");
      void message.success("Вопрос отправлен наставнику");
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setSending(false);
    }
  };

  const openArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
  };

  const closeArticle = () => {
    setSelectedArticleId(null);
  };

  const handleArticleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    articleId: string
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openArticle(articleId);
  };

  const articleText =
    selectedArticle?.body?.trim() || selectedArticle?.summary || "";

  const articleBlocks = useMemo(
    () => parseArticleBody(articleText),
    [articleText]
  );

  return (
    <>
      <PageHeader
        eyebrow="Адаптация"
        title="Онбординг"
        description="Ваш маршрут от первого рабочего дня до уверенного старта."
      />

      <section className="onboarding-summary">
        <div className="summary-copy">
          <span className="eyebrow light">Активная программа</span>
          <h2>{initial.title}</h2>
          <p>
            С {formatDate(initial.startDate)} до {formatDate(initial.dueDate)}
          </p>

          <div className="mentor-row">
            <EmployeeAvatar fullName={initial.mentorName} />
            <div>
              <span>Ваш наставник</span>
              <strong>{initial.mentorName}</strong>
              <small>{initial.mentorPosition}</small>
            </div>
          </div>
        </div>

        <div className="summary-progress">
          <Progress
            type="circle"
            percent={progress.percent}
            size={128}
            strokeWidth={9}
          />
          <strong>
            {progress.complete} из {progress.total}
          </strong>
          <span>заданий выполнено</span>
        </div>

        <div className="hero-pattern" />
      </section>

      <Tabs
        className="content-tabs"
        items={[
          {
            key: "route",
            label: "Этапы и задания",
            children: (
              <div className="stage-list">
                {stages.map((stage, stageIndex) => (
                  <article className="stage-card" key={stage.id}>
                    <header>
                      <span className="stage-number">{stageIndex + 1}</span>
                      <div>
                        <h3>{stage.title}</h3>
                        <p>{stage.description}</p>
                      </div>
                      <StatusPill status={stage.status} />
                    </header>

                    <div className="task-list">
                      {stage.tasks.map((task) => (
                        <div
                          className={
                            task.status === "completed"
                              ? "task-row completed"
                              : "task-row"
                          }
                          key={task.id}
                        >
                          <button
                            type="button"
                            className="task-check"
                            aria-label={`Завершить ${task.title}`}
                            onClick={() => void completeTask(task)}
                            disabled={
                              task.status === "completed" ||
                              completing === task.id
                            }
                          >
                            {task.status === "completed" ? (
                              <Icon name="check" size={18} />
                            ) : completing === task.id ? (
                              <span className="spinner" />
                            ) : null}
                          </button>

                          <div className="task-copy">
                            <div>
                              <strong>{task.title}</strong>
                              <span className="task-points">+{task.points}</span>
                            </div>
                            <p>{task.description}</p>
                            <small>
                              {task.dueDate ? (
                                <>
                                  <Icon name="calendar" size={15} /> до{" "}
                                  {formatDate(task.dueDate)}
                                </>
                              ) : null}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )
          },
          {
            key: "knowledge",
            label: "База знаний",
            children: (
              <div className="knowledge-grid">
                {initial.knowledge.map((item) => (
                  <article
                    className="knowledge-card"
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="dialog"
                    aria-label={`Открыть статью «${item.title}»`}
                    onClick={() => openArticle(item.id)}
                    onKeyDown={(event) =>
                      handleArticleKeyDown(event, item.id)
                    }
                  >
                    <span className="icon-box">
                      <Icon name="book" />
                    </span>

                    <div>
                      <span>{item.category}</span>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <small>
                        <Icon name="clock" size={15} />
                        {item.readMinutes} мин
                      </small>
                    </div>

                    <Icon name="chevron-right" />
                  </article>
                ))}
              </div>
            )
          },
          {
            key: "questions",
            label: "Вопросы",
            children: (
              <div className="questions-layout">
                <section className="ask-card">
                  <span className="icon-box">
                    <Icon name="message" />
                  </span>
                  <h3>Спросить наставника</h3>
                  <p>Опишите ситуацию — вопрос увидят наставник и HR.</p>
                  <Input.TextArea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    rows={5}
                    maxLength={500}
                    showCount
                    placeholder="Например: где найти актуальную инструкцию..."
                  />
                  <Button
                    type="primary"
                    loading={sending}
                    onClick={() => void ask()}
                  >
                    Отправить вопрос
                  </Button>
                </section>

                <section className="question-history">
                  <h3>История вопросов</h3>
                  {questions.length ? (
                    <Collapse
                      ghost
                      items={questions.map((item) => ({
                        key: item.id,
                        label: (
                          <div className="question-label">
                            <span>{item.question}</span>
                            <StatusPill status={item.status} />
                          </div>
                        ),
                        children: item.answer ? (
                          <div className="answer-box">
                            <strong>Ответ наставника</strong>
                            <p>{item.answer}</p>
                          </div>
                        ) : (
                          <p className="muted">
                            Ответ появится здесь после обработки вопроса.
                          </p>
                        )
                      }))}
                    />
                  ) : (
                    <p className="muted">Вы ещё не задавали вопросов.</p>
                  )}
                </section>
              </div>
            )
          }
        ]}
      />

      <Modal
        open={selectedArticle !== null}
        onCancel={closeArticle}
        footer={null}
        title={selectedArticle?.title ?? "Статья"}
        centered
        width={720}
        keyboard
        maskClosable
        forceRender
        getContainer={false}
        zIndex={2000}
        styles={{
          body: {
            maxHeight: "72vh",
            overflowY: "auto",
            paddingRight: 4
          }
        }}
      >
        {selectedArticle ? (
          <div className="article-modal">
            <span>
              {selectedArticle.category} · {selectedArticle.readMinutes} мин
            </span>

            {articleBlocks.length > 0 ? (
              articleBlocks.map((block, blockIndex) =>
                block.type === "table" ? (
                  <ArticleTable
                    key={`${selectedArticle.id}-table-block-${blockIndex}`}
                    block={block}
                    articleId={selectedArticle.id}
                    tableIndex={blockIndex}
                  />
                ) : (
                  <div
                    key={`${selectedArticle.id}-text-block-${blockIndex}`}
                    className="article-text-block"
                  >
                    {renderTextBlock(
                      block.content,
                      `${selectedArticle.id}-text-${blockIndex}`
                    )}
                  </div>
                )
              )
            ) : (
              <p>Текст статьи пока не добавлен.</p>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
