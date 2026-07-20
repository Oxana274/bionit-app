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
    id: DEMO_PROFILE_IDS.employee, firstName: 'Анна', lastName: 'Крылова', fullName: 'Анна Крылова',
    position: 'Менеджер по продажам', departmentName: 'Продажи и маркетинг', role: 'employee',
    avatarUrl: null, hiredAt: '2026-07-20', balance: 1840
  },
  [DEMO_PROFILE_IDS.manager]: {
    id: DEMO_PROFILE_IDS.manager, firstName: 'Михаил', lastName: 'Орлов', fullName: 'Михаил Орлов',
    position: 'Начальник отдела контроля качества', departmentName: 'Контроль качества', role: 'manager',
    avatarUrl: null, hiredAt: '2019-03-11', balance: 3280
  },
  [DEMO_PROFILE_IDS.admin]: {
    id: DEMO_PROFILE_IDS.admin, firstName: 'Елена', lastName: 'Соколова', fullName: 'Елена Соколова',
    position: 'HR-директор', departmentName: 'HR и развитие', role: 'admin',
    avatarUrl: null, hiredAt: '2016-09-01', balance: 4120
  }
};

export function demoProfile(profileId: string): ProfileSummary {
  return profiles[profileId] ?? profiles[DEMO_PROFILE_IDS.employee]!;
}

export const demoLearningCatalog: LearningClassSummary[] = [
  { id: '61000000-0000-4000-8000-000000000001', title: 'GMP: чистота и качество', description: 'Базовые правила работы на современном фармпроизводстве.', category: 'Качество', durationMinutes: 55, reward: 150, passThreshold: 90, maxAttempts: 3, attemptsUsed: 1, progressPercent: 100, status: 'passed', modulesCount: 3, coverKind: 'quality' },
  { id: '61000000-0000-4000-8000-000000000002', title: 'Безопасность на производстве', description: 'СИЗ, маршруты и действия.', category: 'Безопасность', durationMinutes: 40, reward: 100, passThreshold: 90, maxAttempts: 3, attemptsUsed: 0, progressPercent: 70, status: 'in_progress', modulesCount: 3, coverKind: 'safety' },
  { id: '61000000-0000-4000-8000-000000000003', title: 'Продукты Бионит', description: 'Назначение ключевых групп.', category: 'Продукты', durationMinutes: 75, reward: 120, passThreshold: 90, maxAttempts: 3, attemptsUsed: 0, progressPercent: 20, status: 'in_progress', modulesCount: 3, coverKind: 'product' },
  { id: '61000000-0000-4000-8000-000000000004', title: 'Наставничество', description: 'Как поддерживать новичка.', category: 'Лидерство', durationMinutes: 45, reward: 180, passThreshold: 90, maxAttempts: 3, attemptsUsed: 0, progressPercent: 0, status: 'not_started', modulesCount: 3, coverKind: 'leadership' }
];

const detailContent: Record<string, { long: string; modules: string[]; questions: Array<{ prompt: string; options: string[]; correct: number }> }> = {
  '61000000-0000-4000-8000-000000000001': {
    long: 'Курс знакомит с личной гигиеной, ведением записей, предотвращением контаминации.',
    modules: ['GMP обеспечивает качество.', 'Соблюдайте порядок переодевания.', 'Записывайте действия сразу.'],
    questions: [
      { prompt: 'Когда фиксировать операцию?', options: ['В конце смены', 'Сразу после выполнения', 'Раз в неделю'], correct: 1 },
      { prompt: 'Что делать при отклонении?', options: ['Продолжить', 'Скрыть запись', 'Остановить и сообщить'], correct: 2 },
      { prompt: 'Для чего маршрут материалов?', options: ['Снижение риска', 'Парковка', 'Реклама'], correct: 0 }
    ]
  },
  '61000000-0000-4000-8000-000000000002': {
    long: 'Практический курс о безопасной работе.',
    modules: ['Проверьте СИЗ.', 'Перемещайтесь по маршрутам.', 'Действуйте по инструкции.'],
    questions: [
      { prompt: 'Когда проверять СИЗ?', options: ['До работы', 'После смены', 'При проверке'], correct: 0 },
      { prompt: 'Действия при сигнале?', options: ['Игнорировать', 'Следовать плану', 'Уйти'], correct: 1 },
      { prompt: 'Где перемещаться?', options: ['По короткому пути', 'По маршрутам', 'Через склад'], correct: 1 }
    ]
  },
  '61000000-0000-4000-8000-000000000003': {
    long: 'Обзор продуктовых направлений.',
    modules: ['Информация по инструкции.', 'Различайте назначение.', 'Вопросы эксперту.'],
    questions: [
      { prompt: 'Где проверять показания?', options: ['В инструкции', 'По памяти', 'В рекламе'], correct: 0 },
      { prompt: 'Сложный вопрос клиента?', options: ['Предположить', 'Передать эксперту', 'Слухи'], correct: 1 },
      { prompt: 'Что важнее в коммуникации?', options: ['Точность', 'Скорость', 'Слоган'], correct: 0 }
    ]
  },
  '61000000-0000-4000-8000-000000000004': {
    long: 'Курс для наставников.',
    modules: ['Согласуйте цели.', 'Формулируйте результат.', 'Обратная связь.'],
    questions: [
      { prompt: 'Что должно быть в задаче?', options: ['Срок', 'Результат, срок, критерии', 'Пожелание'], correct: 1 },
      { prompt: 'На чём строится обратная связь?', options: ['Ярлыки', 'Наблюдаемое поведение', 'Сравнение'], correct: 1 },
      { prompt: 'Что согласовать с новичком?', options: ['Цели и ритм', 'Дату финала', 'Ничего'], correct: 0 }
    ]
  }
};

export function demoLearningDetail(classId: string): LearningClassDetail {
  const card = demoLearningCatalog.find((item) => item.id === classId);
  const source = detailContent[classId];
  if (!card || !source) throw new Error(`Класс ${classId} не найден`);
  return {
    ...card,
    longDescription: source.long,
    bestScore: card.status === 'passed' ? 100 : null,
    modules: source.modules.map((content, index) => ({
      id: `${classId}-module-${index + 1}`,
      title: ['Ключевые принципы', 'Практика на площадке', 'Проверка'][index] ?? `Модуль ${index + 1}`,
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
  { id: '81000000-0000-4000-8000-000000000001', code: 'FIRST_STEP', title: 'Первый шаг', description: '3 задания онбординга.', kind: 'first-step', reward: 100, earnedAt: '2026-06-18T10:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000002', code: 'GMP_EXPERT', title: 'Знаток GMP', description: 'Сдать GMP.', kind: 'gmp', reward: 150, earnedAt: '2026-07-10T10:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000003', code: 'TEAM_PLAYER', title: 'Командный игрок', description: '3 активности.', kind: 'team', reward: 120, earnedAt: null, progressPercent: 67, locked: true },
  { id: '81000000-0000-4000-8000-000000000004', code: 'MENTOR', title: 'Наставник', description: 'Провести онбординг.', kind: 'mentor', reward: 250, earnedAt: null, progressPercent: 0, locked: true },
  { id: '81000000-0000-4000-8000-000000000005', code: 'BIONIT_35', title: 'Бионит 35', description: 'Юбилей.', kind: 'anniversary', reward: 350, earnedAt: '2026-07-12T09:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000006', code: 'SAFETY_FIRST', title: 'Безопасность', description: 'Курс по ОТ.', kind: 'safety', reward: 100, earnedAt: null, progressPercent: 70, locked: true },
  { id: '81000000-0000-4000-8000-000000000007', code: 'SEVEN_DAYS', title: 'Серия 7 дней', description: '7 дней подряд.', kind: 'streak', reward: 70, earnedAt: '2026-07-17T08:00:00Z', progressPercent: 100, locked: false },
  { id: '81000000-0000-4000-8000-000000000008', code: 'MONTH_LEADER', title: 'Лидер месяца', description: '1 место.', kind: 'leader', reward: 500, earnedAt: null, progressPercent: 34, locked: true }
];

export const demoAchievementStories: AchievementStory[] = [
  { id: 'h1', year: 1991, title: 'Начало', description: 'Старт.', accent: 'red', metric: '1' },
  { id: 'h2', year: 2000, title: 'Производство', description: 'Запуск.', accent: 'light', metric: '2' },
  { id: 'h3', year: 2012, title: 'Расширение', description: 'Рост.', accent: 'dark', metric: '3' },
  { id: 'h4', year: 2021, title: 'Качество', description: 'Обновление.', accent: 'light', metric: '4' },
  { id: 'h5', year: 2026, title: '35 лет', description: 'Опыт.', accent: 'red', metric: '5' }
];

export function getDemoOnboarding(): OnboardingData {
  return {
    assignmentId: 'demo', title: 'План', mentorName: 'Наставник', mentorPosition: 'HR',
    startDate: '2026-07-20', dueDate: '2026-11-14', progressPercent: 30,
    stages: [
      { id: 's1', title: 'Welcome', description: '7 дней', sortOrder: 1, status: 'in_progress', tasks: [
        { id: 't1', title: 'Пройти тренинг', description: 'История', points: 50, dueDate: '2026-07-20', status: 'completed', required: true, completedAt: '2026-07-20T09:00:00Z' },
        { id: 't2', title: 'Представить Бионит', description: '30 секунд', points: 30, dueDate: '2026-07-21', status: 'completed', required: true, completedAt: '2026-07-20T12:30:00Z' },
        { id: 't3', title: 'Сверить карту', description: 'Контакты', points: 30, dueDate: '2026-07-21', status: 'completed', required: true, completedAt: '2026-07-20T14:00:00Z' },
        { id: 't4', title: 'Проверить доступы', description: 'Системы', points: 40, dueDate: '2026-07-22', status: 'in_progress', required: true, completedAt: null },
        { id: 't5', title: 'Правила задач', description: 'Сроки', points: 40, dueDate: '2026-07-24', status: 'not_started', required: true, completedAt: null },
        { id: 't6', title: 'План 14 дней', description: 'Точки', points: 60, dueDate: '2026-07-26', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: 's2', title: 'Продукты', description: '14 дней', sortOrder: 2, status: 'not_started', tasks: [
        { id: 't7', title: 'Продуктовый минимум', description: 'Группы', points: 120, dueDate: '2026-08-09', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: 's3', title: 'Клиенты', description: '30 дней', sortOrder: 3, status: 'not_started', tasks: [
        { id: 't8', title: 'Контакты', description: 'CRM', points: 150, dueDate: '2026-09-08', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: 's4', title: 'Адаптация', description: '60 дней', sortOrder: 4, status: 'not_started', tasks: [
        { id: 't9', title: 'План продаж', description: 'KPI', points: 200, dueDate: '2026-11-07', status: 'not_started', required: true, completedAt: null }
      ]},
      { id: 's5', title: 'Финиш', description: '7 дней', sortOrder: 5, status: 'not_started', tasks: [
        { id: 't10', title: 'Итоги', description: 'ОС', points: 250, dueDate: '2026-11-14', status: 'not_started', required: true, completedAt: null }
      ]}
    ],
    knowledge: [
      { id: 'k1', title: 'Бионит', summary: 'Компания', category: 'Продажи', readMinutes: 7, body: 'История...' },
      { id: 'k2', title: 'Правила', summary: 'Задачи', category: 'Продажи', readMinutes: 6, body: 'Прозрачность...' }
    ],
    questions: [
      { id: 'q1', question: 'Где задачи?', answer: 'CRM и Битрикс24.', status: 'answered', createdAt: '2026-07-20T15:00:00Z', answeredAt: '2026-07-20T16:00:00Z' }
    ]
  };
}

export const demoOnboarding = getDemoOnboarding;

export const demoEmployees: EmployeeLeaderboardRow[] = [
  { rank: 1, profileId: DEMO_PROFILE_IDS.admin, fullName: 'Елена Соколова', position: 'HR', departmentName: 'HR', score: 920, avatarUrl: null, isCurrentUser: false },
  { rank: 2, profileId: DEMO_PROFILE_IDS.manager, fullName: 'Михаил Орлов', position: 'ОКК', departmentName: 'Качество', score: 780, avatarUrl: null, isCurrentUser: false },
  { rank: 3, profileId: DEMO_PROFILE_IDS.employee, fullName: 'Анна Крылова', position: 'Менеджер', departmentName: 'Продажи', score: 690, avatarUrl: null, isCurrentUser: true }
];

export const demoDepartments: DepartmentLeaderboardRow[] = [
  { rank: 1, departmentId: '1', departmentName: 'Качество', score: 4280, membersCount: 18 },
  { rank: 2, departmentId: '2', departmentName: 'Производство', score: 3960, membersCount: 62 }
];

export function demoLeaderboards(profileId: string): LeaderboardsData {
  return {
    employees: demoEmployees.map((e) => ({ ...e, isCurrentUser: e.profileId === profileId })),
    departments: demoDepartments,
    periodLabel: 'Июль 2026'
  };
}

export const demoProducts: ShopProduct[] = [
  { id: '1', title: 'Поло', description: 'Фирменное', price: 900, stock: 26, kind: 'polo', featured: true, variants: [] },
  { id: '2', title: 'Термос', description: 'Стальной', price: 650, stock: 24, kind: 'thermos', featured: false, variants: [] }
];

const demoOrder: ShopOrder = { id: '1', number: 'BD-001', productTitle: 'Пины', variantTitle: null, quantity: 1, total: 100, status: 'approved', createdAt: '2026-07-19T10:00:00Z' };

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
  if (questionIds.some((id) => !Object.keys(answers).includes(id))) throw new Error('Ответьте на все вопросы.');
  let correct = 0;
  for (const qid of questionIds) { if (answers[qid] === correctAnswers[qid]) correct++; }
  const score = Math.round((correct / questionIds.length) * 100);
  const passed = score >= 90;
  return { attemptId: `demo-${Date.now()}`, score, passed, attemptsUsed: passed ? 1 : 2, attemptsLeft: passed ? 2 : 1, rewardGranted: passed ? 150 : 0 };
}
