export function getDemoOnboarding(): OnboardingData {
  return {
    assignmentId: 'sales-onboarding-assignment-demo',
    title: 'Менеджер по продажам: индивидуальный план',
    mentorName: 'Валерий Распопов',
    mentorPosition: 'Руководитель направления продаж',
    startDate: '2026-07-20',
    dueDate: '2026-11-14',
    progressPercent: 30,
    stages: [
      {
        id: 'stage-1',
        title: 'Welcome-тренинг',
        description: 'Первые 7 дней: компания, правила работы, карта поддержки и план.',
        sortOrder: 1,
        status: 'in_progress',
        tasks: [
          {
            id: 'task-1',
            title: 'Пройти Welcome-тренинг',
            description: 'История Бионит, продукт, клиенты, ценность.',
            points: 50,
            dueDate: '2026-07-20',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T09:00:00Z'
          },
          {
            id: 'task-2',
            title: 'Представить Бионит за 30 секунд',
            description: 'Кто мы, что делаем и зачем клиенту.',
            points: 30,
            dueDate: '2026-07-21',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T12:30:00Z'
          },
          {
            id: 'task-3',
            title: 'Сверить карту поддержки',
            description: 'Кто за что отвечает и куда эскалировать.',
            points: 30,
            dueDate: '2026-07-21',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T14:00:00Z'
          },
          {
            id: 'task-4',
            title: 'Проверить доступы',
            description: 'Bitrix, CRM, почта, 1С.',
            points: 40,
            dueDate: '2026-07-22',
            status: 'in_progress',
            required: true,
            completedAt: null
          },
          {
            id: 'task-5',
            title: 'Разобрать правила работы',
            description: 'Результат, срок, критерий, риск.',
            points: 40,
            dueDate: '2026-07-24',
            status: 'not_started',
            required: true,
            completedAt: null
          },
          {
            id: 'task-6',
            title: 'Согласовать план 14 дней',
            description: 'Контрольные точки и задачи.',
            points: 60,
            dueDate: '2026-07-26',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: 'stage-2',
        title: 'Продуктовая база',
        description: 'Ассортимент, инструкции, ограничения.',
        sortOrder: 2,
        status: 'not_started',
        tasks: []
      },
      {
        id: 'stage-3',
        title: 'Работа с клиентами',
        description: 'CRM, контакты, сделки.',
        sortOrder: 3,
        status: 'not_started',
        tasks: []
      },
      {
        id: 'stage-4',
        title: 'План адаптации',
        description: 'KPI, территория, воронка.',
        sortOrder: 4,
        status: 'not_started',
        tasks: []
      },
      {
        id: 'stage-5',
        title: 'Финиш',
        description: 'Итоги и развитие.',
        sortOrder: 5,
        status: 'not_started',
        tasks: []
      }
    ],
    knowledge: [
      {
        id: 'a1',
        title: 'Бионит: компания и продукт',
        summary: 'История и продуктовая линейка.',
        category: 'Продажи',
        readMinutes: 7,
        body: 'Бионит — производитель ветеринарных препаратов с 1991 года...'
      },
      {
        id: 'a2',
        title: 'Правила работы',
        summary: 'Как ставить задачи и управлять рисками.',
        category: 'Продажи',
        readMinutes: 6,
        body: 'Каждая задача должна иметь результат, срок, критерий качества...'
      },
      {
        id: 'a3',
        title: 'Карта поддержки',
        summary: 'Кто помогает и какие системы использовать.',
        category: 'Продажи',
        readMinutes: 6,
        body: 'Bitrix24, CRM, 1С — ключевые инструменты...'
      },
      {
        id: 'a4',
        title: 'Первые 14 дней',
        summary: 'Контрольные точки адаптации.',
        category: 'Продажи',
        readMinutes: 5,
        body: 'День 1, 3, 7, 14 — ключевые этапы...'
      }
    ],
    questions: []
  };
}

// важно — чтобы loader не сломался
export const demoOnboarding = getDemoOnboarding;
