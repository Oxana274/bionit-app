'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Empty,
  Form,
  Input,
  List,
  Progress,
  Skeleton,
  Space,
  Tag,
  Tabs,
  Typography,
  message,
  type TabsProps,
} from 'antd';
import {
  useOnboardingStages,
  useOnboardingProgress,
  useOnboardingTasks,
  useTaskCompletions,
  useCompleteTask,
  useKnowledgeArticles,
  useFaqQuestions,
  useAskQuestion,
  type OnboardingStage,
  type KnowledgeArticle,
  type FaqQuestion,
} from '@/hooks/useOnboarding';

type OnboardingViewProps = {
  initial: {
    assignmentId: string;
    title: string;
    startDate: string;
    dueDate: string;
    mentorName: string;
    mentorPosition: string;
    stages: any[];
    knowledge: any[];
    questions: any[];
  };
};

function StageCard({
  stage,
  isCompleted,
  tasks,
  completions,
  completingTaskId,
  onCompleteTask,
}: {
  stage: OnboardingStage;
  isCompleted: boolean;
  tasks: { id: string; name: string; description: string | null; isRequired: boolean }[];
  completions: { taskId: string }[];
  completingTaskId: string | null;
  onCompleteTask: (taskId: string) => void;
}) {
  const completedCount = tasks.filter((t) => completions.some((c) => c.taskId === t.id)).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card
      bordered={false}
      style={{
        opacity: isCompleted ? 0.7 : 1,
        borderLeft: isCompleted ? '4px solid #2F9E44' : '4px solid #CB342A',
        marginBottom: 16,
      }}
    >
      <Space direction="vertical" size={14} style={{ width: '100%' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center" size={10}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: isCompleted ? '#F0FFF4' : '#FFF1F0',
              display: 'grid', placeItems: 'center', fontSize: 22,
            }}>
              {stage.icon ?? '📌'}
            </div>
            <Space direction="vertical" size={2}>
              <Typography.Text strong style={{ fontSize: 17 }}>{stage.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>{stage.description}</Typography.Text>
            </Space>
          </Space>
          {isCompleted && <Tag color="green">Пройден</Tag>}
        </Space>
        <Progress percent={percent} strokeColor="#CB342A" />
        {tasks.map((task) => {
          const done = completions.some((c) => c.taskId === task.id);
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F4F4F4' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: done ? '#2F9E44' : '#F4F4F4',
                color: done ? '#FFFFFF' : '#878787',
                display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0,
              }}>
                {done ? '✓' : '○'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography.Text style={{ fontSize: 14 }} delete={done} type={done ? 'secondary' : undefined}>
                  {task.name}
                </Typography.Text>
                {task.description && (
                  <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{task.description}</Typography.Text>
                )}
              </div>
              {!done && (
                <Button size="small" type="primary" loading={completingTaskId === task.id} onClick={() => onCompleteTask(task.id)}>
                  Готово
                </Button>
              )}
            </div>
          );
        })}
      </Space>
    </Card>
  );
}

function ArticleCard({ article }: { article: KnowledgeArticle }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatContent = (text: string): string => {
    return text
      .replace(/\\n\\n/g, '\n\n')
      .replace(/\\n/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '«$1»')
      .replace(/^###\s+(.*$)/gm, '$1')
      .replace(/^##\s+(.*$)/gm, '$1')
      .replace(/^#\s+(.*$)/gm, '$1');
  };

  const cleanContent = formatContent(article.content);

  return (
    <Card bordered={false} style={{ width: '100%', cursor: 'pointer', marginBottom: 12 }} onClick={() => setIsOpen(!isOpen)}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space align="center" size={10}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: '#F4F4F4', display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>📖</div>
          <Space direction="vertical" size={2} style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text strong style={{ fontSize: 16 }}>{article.title}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>{article.category ?? 'Без категории'}</Typography.Text>
          </Space>
        </Space>
        {isOpen ? (
          <div style={{ background: '#FAFAFA', borderRadius: 16, padding: 16, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#1D1D1B' }}>
            {cleanContent}
          </div>
        ) : (
          <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 14 }} ellipsis={{ rows: 2 }}>
            {cleanContent.slice(0, 150)}...
          </Typography.Paragraph>
        )}
        <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} style={{ padding: 0 }}>
          {isOpen ? 'Свернуть' : 'Читать полностью'}
        </Button>
      </Space>
    </Card>
  );
}

function FaqCard({ question }: { question: FaqQuestion }) {
  return (
    <Card bordered={false} style={{ width: '100%', marginBottom: 12 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space align="start" size={10}>
          <Tag color="orange">{question.status === 'pending' ? 'Ожидает' : question.status === 'answered' ? 'Отвечен' : 'Закрыт'}</Tag>
          <Typography.Text strong>Вопрос</Typography.Text>
        </Space>
        <Typography.Paragraph style={{ margin: 0 }}>{question.question}</Typography.Paragraph>
        {question.answer && (
          <div style={{ background: '#F4F4F4', borderRadius: 14, padding: 12 }}>
            <Typography.Text type="secondary">Ответ:</Typography.Text>
            <Typography.Paragraph style={{ margin: '4px 0 0' }}>{question.answer}</Typography.Paragraph>
          </div>
        )}
      </Space>
    </Card>
  );
}

export function OnboardingView({ initial }: OnboardingViewProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [askForm] = Form.useForm<{ question: string }>();

  const stagesQuery = useOnboardingStages();
  const progressQuery = useOnboardingProgress('demo-user');
  const articlesQuery = useKnowledgeArticles();
  const faqQuery = useFaqQuestions('demo-user');
  const completeTask = useCompleteTask('demo-user');
  const askQuestion = useAskQuestion('demo-user');

  const stages = stagesQuery.data ?? [];
  const progress = progressQuery.data ?? [];
  const articles = articlesQuery.data ?? [];
  const faq = faqQuery.data ?? [];

  const handleCompleteTask = async (taskId: string): Promise<void> => {
    setCompletingTaskId(taskId);
    try {
      await completeTask.mutateAsync(taskId);
      void messageApi.success('Задание отмечено!');
    } catch (error) {
      void messageApi.error(error instanceof Error ? error.message : 'Не удалось отметить задание');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleAskQuestion = async (values: { question: string }): Promise<void> => {
    try {
      await askQuestion.mutateAsync(values.question);
      void messageApi.success('Вопрос отправлен наставнику');
      askForm.resetFields();
    } catch (error) {
      void messageApi.error(error instanceof Error ? error.message : 'Не удалось задать вопрос');
    }
  };

  const tabs: TabsProps['items'] = [
    {
      key: 'tracker',
      label: 'Этапы и задания',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {stagesQuery.isLoading ? <Skeleton active /> :
           stages.length === 0 ? <Empty description="Этапы онбординга пока не назначены" /> :
           stages.map((stage) => {
             const stageProgress = progress.find((p) => p.stageId === stage.id);
             const isCompleted = stageProgress?.isCompleted ?? false;
             const TasksWrapper = () => {
               const tasksQuery = useOnboardingTasks(stage.id);
               const completionsQuery = useTaskCompletions('demo-user');
               const tasks = tasksQuery.data ?? [];
               const completions = (completionsQuery.data ?? []).map((c) => ({ taskId: c.taskId }));
               return (
                 <StageCard
                   key={stage.id}
                   stage={stage}
                   isCompleted={isCompleted}
                   tasks={tasks}
                   completions={completions}
                   completingTaskId={completingTaskId}
                   onCompleteTask={handleCompleteTask}
                 />
               );
             };
             return <TasksWrapper key={stage.id} />;
           })}
        </Space>
      ),
    },
    {
      key: 'knowledge',
      label: 'База знаний',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {articlesQuery.isLoading ? <Skeleton active /> :
           articles.length === 0 ? <Empty description="Статьи пока не добавлены" /> :
           articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </Space>
      ),
    },
    {
      key: 'faq',
      label: 'Вопросы',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card bordered={false}>
            <Form form={askForm} layout="vertical" onFinish={handleAskQuestion}>
              <Form.Item name="question" rules={[{ required: true, message: 'Введите вопрос' }]}>
                <Input.TextArea rows={3} placeholder="Задайте вопрос наставнику..." maxLength={500} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>Отправить</Button>
            </Form>
          </Card>
          {faqQuery.isLoading ? <Skeleton active /> :
           faq.length === 0 ? <Empty description="У вас пока нет вопросов" /> :
           faq.map((q) => <FaqCard key={q.id} question={q} />)}
        </Space>
      ),
    },
  ];

  return (
    <section>
      {contextHolder}
      <Space direction="vertical" size={18} style={{ width: '100%' }}>
        <Card bordered={false} style={{ overflow: 'hidden', background: 'linear-gradient(135deg, #CB342A 0%, #A71916 100%)', color: '#FFFFFF' }}>
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, fontWeight: 700 }}>Бионит Старт</Typography.Text>
            <Typography.Title level={1} style={{ margin: 0, color: '#FFFFFF', fontSize: 30, lineHeight: 1.1, letterSpacing: -1.2 }}>
              Добро пожаловать в команду!
            </Typography.Title>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.45 }}>
              Пройдите онбординг, изучите материалы и получите бейдж «Новичок».
            </Typography.Text>
          </Space>
        </Card>
        <Tabs items={tabs} />
      </Space>
    </section>
  );
}
