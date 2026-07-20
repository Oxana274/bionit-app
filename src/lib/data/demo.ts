import type {
  AchievementStory,
  AdminDashboardData,
  BadgeSummary,
  DashboardData,
  DepartmentLeaderboardRow,
  EmployeeLeaderboardRow,
  LeaderboardsData,
  LearningClassSummary,
  LearningClassDetail,
  OnboardingData,
  ProfileSummary,
  ShopData,
  ShopOrder,
  ShopProduct,
  UserRole
} from '@/types/domain';

export const DEMO_PROFILE_IDS = {
  employee: '10000000-0000-4000-8000-000000000001',
  manager: '10000000-0000-4000-8000-000000000002',
  admin: '10000000-0000-4000-8000-000000000003'
} as const;

const profiles: Record<string, ProfileSummary> = {
  [DEMO_PROFILE_IDS.employee]: {
    id: DEMO_PROFILE_IDS.employee,
    firstName: 'Анна',
    lastName: 'Крылова',
    fullName: 'Анна Крылова',
    position: 'Менеджер по продажам',
    departmentName: 'Продажи и маркетинг',
    role: 'employee',
    avatarUrl: null,
    hiredAt: '2026-07-20',
    balance: 1840
  },
  [DEMO_PROFILE_IDS.manager]: {
    id: DEMO_PROFILE_IDS.manager,
    firstName: 'Михаил',
    lastName: 'Орлов',
    fullName: 'Михаил Орлов',
    position: 'Начальник отдела контроля качества',
    departmentName: 'Контроль качества',
    role: 'manager',
    avatarUrl: null,
    hiredAt: '2019-03-11',
    balance: 3280
  },
  [DEMO_PROFILE_IDS.admin]: {
    id: DEMO_PROFILE_IDS.admin,
    firstName: 'Елена',
    lastName: 'Соколова',
    fullName: 'Елена Соколова',
    position: 'HR-директор',
    departmentName: 'HR и развитие',
    role: 'admin',
    avatarUrl: null,
    hiredAt: '2016-09-01',
    balance: 4120
  }
};

export function demoProfile(profileId: string): ProfileSummary {
  return profiles[profileId] ?? profiles[DEMO_PROFILE_IDS.employee]!;
}

export const demoLearningCatalog: LearningClassSummary[] = [
  {
    id: '61000000-0000-4000-8000-000000000001',
    title: 'GMP: чистота и качество',
    description: 'Базовые правила работы на современном фармпроизводстве.',
    category: 'Качество',
    durationMinutes: 55,
    reward: 150,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 1,
    progressPercent: 100,
    status: 'passed',
    modulesCount: 3,
    coverKind: 'quality'
  },
  {
    id: '61000000-0000-4000-8000-000000000002',
    title: 'Безопасность на производстве',
    description: 'СИЗ, маршруты и действия при нештатной ситуации.',
    category: 'Безопасность',
    durationMinutes: 40,
    reward: 100,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 70,
    status: 'in_progress',
    modulesCount: 3,
    coverKind: 'safety'
  },
  {
    id: '61000000-0000-4000-8000-000000000003',
    title: 'Продукты Бионит: базовый курс',
    description: 'Назначение ключевых групп ветеринарных препаратов.',
    category: 'Продукты',
    durationMinutes: 75,
    reward: 120,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 20,
    status: 'in_progress',
    modulesCount: 3,
    coverKind: 'product'
  },
  {
    id: '61000000-0000-4000-8000-000000000004',
    title: 'Наставничество без формальностей',
    description: 'Как поддерживать новичка и давать развивающую обратную связь.',
    category: 'Лидерство',
    durationMinutes: 45,
    reward: 180,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: 'not_started',
    modulesCount: 3,
    coverKind: 'leadership'
  }
];

const detailContent: Record<string, { long: string; modules: string[]; questions: Array<{ prompt: string; options: string[]; correct: number }> }> = {
  '61000000-0000-4000-8000-000000000001': {
    long: 'Курс знакомит с личной гигиеной, ведением записей, предотвращением контаминации и реакцией на отклонения.',
    modules: [
      'GMP обеспечивает воспроизводимое качество препарата на каждом этапе производства.',
      'Соблюдайте порядок переодевания, обработку рук и правила перемещения материалов.',
      'Записывайте действия сразу; при отклонении остановите процесс и сообщите ответственному.'
    ],
    questions: [
      { prompt: 'Когда нужно фиксировать выполненную операцию?', options: ['В конце смены', 'Сразу после выполнения', 'Раз в неделю'], correct: 1 },
      { prompt: 'Что делать при обнаружении отклонения?', options: ['Продолжить работу', 'Скрыть запись', 'Остановить процесс и сообщить ответственному'], correct: 2 },
      { prompt: 'Для чего нужен утверждённый маршрут материалов?', options: ['Для снижения риска контаминации', 'Для удобства парковки', 'Для рекламы'], correct: 0 }
    ]
  },
  '61000000-0000-4000-8000-000000000002': {
    long: 'Практический курс о безопасной работе на производственной площадке.',
    modules: [
      'Перед работой проверьте целостность и соответствие СИЗ зоне.',
      'Перемещайтесь только по разрешённым маршрутам и следуйте маркировке.',
      'При нештатной ситуации остановите работу и действуйте по локальной инструкции.'
    ],
    questions: [
      { prompt: 'Когда проверять средства индивидуальной защиты?', options: ['До начала работы', 'После смены', 'Только при проверке'], correct: 0 },
      { prompt: 'Как действовать при аварийном сигнале?', options: ['Игнорировать', 'Следовать локальному плану реагирования', 'Уйти без уведомления'], correct: 1 },
      { prompt: 'Где разрешено перемещаться на площадке?', options: ['По любому короткому пути', 'Только по разрешённым маршрутам', 'Через склад'], correct: 1 }
    ]
  },
  '61000000-0000-4000-8000-000000000003': {
    long: 'Обзор продуктовых направлений Бионит и правил корректной коммуникации.',
    modules: [
      'Продуктовая информация должна соответствовать актуальной инструкции.',
      'Необходимо различать назначение и ограничения каждой продуктовой группы.',
      'Сложный вопрос клиента передаётся профильному специалисту.'
    ],
    questions: [
      { prompt: 'Где проверять показания препарата?', options: ['В актуальной инструкции', 'По памяти', 'В рекламе конкурента'], correct: 0 },
      { prompt: 'Что делать со сложным вопросом клиента?', options: ['Предположить ответ', 'Передать профильному специалисту', 'Сослаться на слухи'], correct: 1 },
      { prompt: 'Что важнее в продуктовой коммуникации?', options: ['Точность и проверяемость', 'Скорость любой ценой', 'Яркий слоган'], correct: 0 }
    ]
  },
  '61000000-0000-4000-8000-000000000004': {
    long: 'Курс для наставников и руководителей о постановке задач и поддержке новичка.',
    modules: [
      'Согласуйте цели, ритм встреч и каналы для вопросов.',
      'Формулируйте результат, срок, критерии качества и доступные ресурсы.',
      'Обратная связь описывает наблюдаемое поведение и следующий шаг.'
    ],
    questions: [
      { prompt: 'Что должно быть в задаче?', options: ['Только срок', 'Результат, срок, критерии и ресурсы', 'Общее пожелание'], correct: 1 },
      { prompt: 'На чём строится развивающая обратная связь?', options: ['На ярлыках', 'На наблюдаемом поведении и следующем шаге', 'На сравнении'], correct: 1 },
      { prompt: 'Что согласовать с новичком в начале?', options: ['Цели, ритм встреч и каналы вопросов', 'Только дату финала', 'Ничего'], correct: 0 }
    ]
  }
};

export function demoLearningDetail(classId: string): LearningClassDetail | null {
  const card = demoLearningCatalog.find((item) => item.id === classId);
  const source = detailContent[classId];
  if (!card || !source) return null;
  return {
    ...card,
    longDescription: source.long,
    bestScore: card.status === 'passed' ? 100 : null,
    modules: source.modules.map((content, index) => ({
      id: `${classId}-module-${index + 1}`,
      title: ['Ключевые принципы', 'Практика на площадке', 'Проверка и следующий шаг'][index] ?? `Модуль ${index + 1}`,
      sortOrder: index + 1,
      durationMinutes: Math.max(8, Math.round(card.durationMinutes / source.modules.length)),
      content,
      completed: index < Math.round(card.modulesCount * card.progressPercent / 100)
    })),
    questions: source.questions.map((question, questionIndex) => ({
      id: `${classId}-question-${questionIndex + 1}`,
      prompt: question.prompt,
      sortOrder: questionIndex + 1,
      options: question.options.map((label, optionIndex) => ({
        id: `${classId}-question-${questionIndex + 1}-option-${optionIndex + 1}`,
        label
      }))
    }))
  };
}

export function demoCorrectAnswers(classId: string): Record<string, string> {
  const source = detailContent[classId];
  if (!source) return {};
  return Object.fromEntries(source.questions.map((q, qi) => [
    `${classId}-question-${qi + 1}`,
    `${classId}-question-${qi + 1}-option-${q.correct + 1}`
  ]));
}

export const demoBadges: BadgeSummary[] = [
  { id: '81000000-0000-4000-8000-000000000001', code: 'FIRST_STEP', title: 'Первый шаг', description: 'Завершить первые три задания онбординга.', kind: 'first-step', reward: 100, earnedAt: '2026-06-18T10:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000002', code: 'GMP_EXPERT', title: 'Знаток GMP', description: 'Сдать курс по GMP с результатом не ниже 90%.', kind: 'gmp', reward: 150, earnedAt: '2026-07-10T10:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000003', code: 'TEAM_PLAYER', title: 'Командный игрок', description: 'Принять участие в трёх командных активностях.', kind: 'team', reward: 120, earnedAt: null, progressPercent: 67, locked: true },
  { id: '81000000-0000-4000-8000-000000000004', code: 'MENTOR', title: 'Наставник', description: 'Успешно провести сотрудника через онбординг.', kind: 'mentor', reward: 250, earnedAt: null, progressPercent: 0, locked: true },
  { id: '81000000-0000-4000-8000-000000000005', code: 'BIONIT_35', title: 'Бионит 35', description: 'Участник юбилейной программы компании.', kind: 'anniversary', reward: 350, earnedAt: '2026-07-12T09:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000006', code: 'SAFETY_FIRST', title: 'Безопасность прежде всего', description: 'Завершить курс по охране труда.', kind: 'safety', reward: 100, earnedAt: null, progressPercent: 70, locked: true },
  { id: '81000000-0000-4000-8000-000000000007', code: 'SEVEN_DAYS', title: 'Серия 7 дней', description: 'Заходить в приложение семь дней подряд.', kind: 'streak', reward: 70, earnedAt: '2026-07-17T08:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000008', code: 'MONTH_LEADER', title: 'Лидер месяца', description: 'Занять первое место в ежемесячном рейтинге.', kind: 'leader', reward: 500, earnedAt: null, progressPercent: 34, locked: true }
];

export const demoAchievementStories: AchievementStory[] = [
  { id: 'history-1991', year: 1991, title: 'Начало пути', description: 'Команда Бионит начинает развивать ветеринарное фармацевтическое направление.', accent: 'red', metric: '1 команда' },
  { id: 'history-2000', year: 2000, title: 'Собственное производство', description: 'Запускаются новые производственные процессы и система контроля качества.', accent: 'light', metric: 'Новый этап' },
  { id: 'history-2012', year: 2012, title: 'Расширение продуктовой линейки', description: 'Компания укрепляет экспертизу и выводит новые решения для здоровья животных.', accent: 'dark', metric: 'Больше решений' },
  { id: 'history-2021', year: 2021, title: 'Современное производство', description: 'Процессы обновляются с фокусом на качество и развитие сотрудников.', accent: 'light', metric: 'Качество' },
  { id: 'history-2026', year: 2026, title: '35 лет в деле', description: 'Опыт, научный подход и энергия команды объединяются в новой системе развития.', accent: 'red', metric: '35 лет' }
];

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
        id: '52000000-0000-4000-8000-000000000101',
        title: 'Welcome-тренинг',
        description: 'Первые 7 дней: компания, правила работы, карта поддержки, доступы и личный план первых двух недель.',
        sortOrder: 1,
        status: 'in_progress',
        tasks: [
          { id: 'sales-task-progress-101', title: 'Пройти Welcome-тренинг', description: 'Узнать историю Бионит, миссию «От фермы до дома», продукт, клиентов и маршрут адаптации.', points: 50, dueDate: '2026-07-20', status: 'completed', required: true, completedAt: '2026-07-20T09:00:00Z' },
          { id: 'sales-task-progress-102', title: 'Представить Бионит за 30 секунд', description: 'Подготовить короткое объяснение.', points: 30, dueDate: '2026-07-21', status: 'completed', required: true, completedAt: '2026-07-20T12:30:00Z' },
          { id: 'sales-task-progress-103', title: 'Сверить карту поддержки', description: 'Зафиксировать контакты.', points: 30, dueDate: '2026-07-21', status: 'completed', required: true, completedAt: '2026-07-20T14:00:00Z' },
          { id: 'sales-task-progress-104', title: 'Проверить рабочие доступы', description: 'Битрикс24, почта, CRM, 1С.', points: 40, dueDate: '2026-07-22', status: 'in_progress', required: true, completedAt: null },
          { id: 'sales-task-progress-105', title: 'Разобрать правила задач, сроков и рисков', description: 'Результат, срок, критерий качества.', points: 40, dueDate: '2026-07-24', status: 'not_started', required: true, completedAt: null },
          { id: 'sales-task-progress-106', title: 'Согласовать личный план первых 14 дней', description: 'Контрольные точки на дни 1, 3, 7 и 14.', points: 60, dueDate: '2026-07-26', status: 'not_started', required: true, completedAt: null }
        ]
      },
      { id: '52000000-0000-4000-8000-000000000102', title: 'Продуктовая база', description: 'Освоение продуктовых направлений.', sortOrder: 2, status: 'not_started', tasks: [
        { id: 'sales-task-progress-107', title: 'Освоить продуктовый минимум менеджера', description: 'Изучить ключевые продуктовые группы.', points: 120, dueDate: '2026-08-09', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: '52000000-0000-4000-8000-000000000103', title: 'Работа с клиентами', description: 'CRM, контакты, сделки.', sortOrder: 3, status: 'not_started', tasks: [
        { id: 'sales-task-progress-108', title: 'Провести первые клиентские контакты', description: 'Зафиксировать в CRM.', points: 150, dueDate: '2026-09-08', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: '52000000-0000-4000-8000-000000000104', title: 'План адаптации', description: 'KPI, воронка, маржа.', sortOrder: 4, status: 'not_started', tasks: [
        { id: 'sales-task-progress-109', title: 'Защитить 60-дневный план продаж', description: 'План по клиентской базе.', points: 200, dueDate: '2026-11-07', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: '52000000-0000-4000-8000-000000000105', title: 'Финиш', description: 'Итоги и развитие.', sortOrder: 5, status: 'not_started', tasks: [
        { id: 'sales-task-progress-110', title: 'Подвести итоги адаптации', description: 'Обратная связь.', points: 250, dueDate: '2026-11-14', status: 'not_started', required: true, completedAt: null }
      ]}
    ],
    knowledge: [
      { id: '54000000-0000-4000-8000-000000000101', title: 'Бионит: компания, продукт и клиенты', summary: 'История компании.', category: 'Продажи', readMinutes: 7, body: 'Бионит начал работу во Владимире в 1991 году...' },
      { id: '54000000-0000-4000-8000-000000000102', title: 'Правила игры', summary: 'Задачи, сроки и риски.', category: 'Продажи', readMinutes: 6, body: 'Прозрачность, аккуратность и ответственность...' },
      { id: '54000000-0000-4000-8000-000000000103', title: 'Карта поддержки', summary: 'Рабочие системы.', category: 'Продажи', readMinutes: 6, body: 'Битрикс24, CRM, 1С...' },
      { id: '54000000-0000-4000-8000-000000000104', title: 'Первые 14 дней', summary: 'Контрольные точки.', category: 'Продажи', readMinutes: 5, body: 'День 1, 3, 7, 14...' }
    ],
    questions: [
      { id: 'sales-question-demo-1', question: 'Где смотреть задачи и историю по клиенту?', answer: 'В CRM и Битрикс24.', status: 'answered', createdAt: '2026-07-20T15:00:00Z', answeredAt: '2026-07-20T16:00:00Z' }
    ]
  };
}

export const demoOnboarding = getDemoOnboarding;

export const demoEmployees: EmployeeLeaderboardRow[] = [
  { rank: 1, profileId: DEMO_PROFILE_IDS.admin, fullName: 'Елена Соколова', position: 'HR-директор', departmentName: 'HR и развитие', score: 920, avatarUrl: null, isCurrentUser: false },
  { rank: 2, profileId: DEMO_PROFILE_IDS.manager, fullName: 'Михаил Орлов', position: 'Начальник ОКК', departmentName: 'Контроль качества', score: 780, avatarUrl: null, isCurrentUser: false },
  { rank: 3, profileId: DEMO_PROFILE_IDS.employee, fullName: 'Анна Крылова', position: 'Менеджер по продажам', departmentName: 'Продажи', score: 690, avatarUrl: null, isCurrentUser: true }
];

export const demoDepartments: DepartmentLeaderboardRow[] = [
  { rank: 1, departmentId: '21000000-0000-4000-8000-000000000002', departmentName: 'Контроль качества', score: 4280, membersCount: 18 },
  { rank: 2, departmentId: '21000000-0000-4000-8000-000000000001', departmentName: 'Производство', score: 3960, membersCount: 62 }
];

export function demoLeaderboards(profileId: string): LeaderboardsData {
  return {
    employees: demoEmployees.map((e) => ({ ...e, isCurrentUser: e.profileId === profileId })),
    departments: demoDepartments,
    periodLabel: 'Июль 2026'
  };
}

export const demoProducts: ShopProduct[] = [
  { id: '91000000-0000-4000-8000-000000000001', title: 'Поло Бионит', description: 'Фирменное поло.', price: 900, stock: 26, kind: 'polo', featured: true, variants: [] },
  { id: '91000000-0000-4000-8000-000000000003', title: 'Термос', description: 'Стальной термос.', price: 650, stock: 24, kind: 'thermos', featured: false, variants: [] }
];

const demoOrder: ShopOrder = { id: '93000000-0000-4000-8000-000000000001', number: 'BD-2026-01001', productTitle: 'Набор пинов', variantTitle: null, quantity: 1, total: 100, status: 'approved', createdAt: '2026-07-19T10:00:00Z' };

export function demoShop(profileId: string): ShopData {
  return { balance: demoProfile(profileId).balance, products: demoProducts, recentOrders: [demoOrder] };
}

export function demoDashboard(profileId: string): DashboardData {
  const profile = demoProfile(profileId);
  return {
    profile,
    stats: { onboardingPercent: 30, learningPercent: 48, companyRank: 3, badgeCount: 4 },
    activeOnboarding: { assignmentId: 'demo', title: 'План', currentStage: 'Welcome', completedTasks: 3, totalTasks: 10, dueDate: '2026-11-14' },
    recommendedClass: demoLearningCatalog[0] ?? null,
    latestBadge: demoBadges[0] ?? null,
    weeklyEarned: 370
  };
}

export function demoAdminDashboard(): AdminDashboardData {
  return {
    metrics: { newOrders: 3, activeEmployees: 130, onboardingInProgress: 7, learningPassRate: 93 },
    orders: [{ ...demoOrder, employeeName: 'Анна Крылова' }],
    employees: [{ id: '1', employeeNumber: '1001', fullName: 'Анна Крылова', departmentName: 'Продажи', position: 'Менеджер', role: 'employee', status: 'active', authLinked: true }],
    departments: [{ id: '1', name: 'Продажи' }]
  };
}

export function isDemoAdminRole(role: UserRole): boolean { return role === 'hr' || role === 'admin'; }
export function demoExportTables(): Record<string, Array<Record<string, unknown>>> { return {}; }

// Алиасы
export const getDemoProfile = demoProfile;
export const getDemoShop = demoShop;
export const getDemoDashboard = demoDashboard;
export const demoCourses = demoLearningCatalog;
export const getDemoLearningClass = demoLearningDetail;
export const demoAchievements = demoAchievementStories;
export const getDemoLeaderboards = demoLeaderboards;
export const getDemoAdminDashboard = demoAdminDashboard;

export function submitDemoLearningAttempt(
  classId: string,
  answers: Record<string, string>
): { attemptId: string; score: number; passed: boolean; attemptsUsed: number; attemptsLeft: number; rewardGranted: number } {
  const correctAnswers = demoCorrectAnswers(classId);
  const questionIds = Object.keys(correctAnswers);
  if (questionIds.length === 0) throw new Error('Класс не найден.');
  const answeredIds = Object.keys(answers);
  if (questionIds.some((id) => !answeredIds.includes(id))) throw new Error('Ответьте на все вопросы.');
  let correct = 0;
  for (const qid of questionIds) { if (answers[qid] === correctAnswers[qid]) correct++; }
  const score = Math.round((correct / questionIds.length) * 100);
  const passed = score >= 90;
  return { attemptId: `demo-${Date.now()}`, score, passed, attemptsUsed: passed ? 1 : 2, attemptsLeft: passed ? 2 : 1, rewardGranted: passed ? 150 : 0 };
}
