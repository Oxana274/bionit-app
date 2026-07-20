import type {
  AchievementStory,
  AdminDashboardData,
  BadgeSummary,
  DashboardData,
  LeaderboardsData,
  LearningAttemptResult,
  LearningClassDetail,
  LearningClassSummary,
  OnboardingData,
  ProfileSummary,
  ShopData
} from "@/types/domain";

const IDS = {
  employee: "10000000-0000-4000-8000-000000000001",
  manager: "10000000-0000-4000-8000-000000000002",
  admin: "10000000-0000-4000-8000-000000000003"
} as const;

const profiles: Record<string, ProfileSummary> = {
  [IDS.employee]: {
    id: IDS.employee,
    firstName: "Анна",
    lastName: "Крылова",
    fullName: "Анна Крылова",
    position: "Инженер-технолог",
    departmentName: "Производство",
    role: "employee",
    avatarUrl: null,
    hiredAt: "2026-06-15",
    balance: 1840
  },
  [IDS.manager]: {
    id: IDS.manager,
    firstName: "Михаил",
    lastName: "Орлов",
    fullName: "Михаил Орлов",
    position: "Начальник отдела контроля качества",
    departmentName: "Контроль качества",
    role: "manager",
    avatarUrl: null,
    hiredAt: "2019-03-11",
    balance: 3280
  },
  [IDS.admin]: {
    id: IDS.admin,
    firstName: "Елена",
    lastName: "Соколова",
    fullName: "Елена Соколова",
    position: "HR-директор",
    departmentName: "HR и развитие",
    role: "admin",
    avatarUrl: null,
    hiredAt: "2016-09-01",
    balance: 4120
  }
};

export function getDemoProfile(id: string): ProfileSummary {
  return profiles[id] ?? profiles[IDS.employee];
}

export const demoBadges: BadgeSummary[] = [
  {
    id: "badge-first",
    code: "FIRST_STEP",
    title: "Первый шаг",
    description: "Завершить первые три задания онбординга",
    kind: "first-step",
    reward: 100,
    earnedAt: "2026-06-17T10:30:00+03:00",
    progressPercent: 100,
    locked: false
  },
  {
    id: "badge-gmp",
    code: "GMP_EXPERT",
    title: "Знаток GMP",
    description: "Сдать курс по GMP с результатом не ниже 90%",
    kind: "gmp",
    reward: 150,
    earnedAt: "2026-07-02T14:10:00+03:00",
    progressPercent: 100,
    locked: false
  },
  {
    id: "badge-team",
    code: "TEAM_PLAYER",
    title: "Командный игрок",
    description: "Принять участие в трёх командных активностях",
    kind: "team",
    reward: 120,
    earnedAt: null,
    progressPercent: 67,
    locked: true
  },
  {
    id: "badge-mentor",
    code: "MENTOR",
    title: "Наставник",
    description: "Успешно провести сотрудника через онбординг",
    kind: "mentor",
    reward: 250,
    earnedAt: null,
    progressPercent: 0,
    locked: true
  },
  {
    id: "badge-35",
    code: "BIONIT_35",
    title: "Бионит 35",
    description: "Участник юбилейной программы компании",
    kind: "anniversary",
    reward: 350,
    earnedAt: "2026-05-20T12:00:00+03:00",
    progressPercent: 100,
    locked: false
  },
  {
    id: "badge-safety",
    code: "SAFETY_FIRST",
    title: "Безопасность прежде всего",
    description: "Завершить курс по охране труда",
    kind: "safety",
    reward: 100,
    earnedAt: null,
    progressPercent: 70,
    locked: true
  },
  {
    id: "badge-streak",
    code: "SEVEN_DAYS",
    title: "Серия 7 дней",
    description: "Заходить в приложение семь дней подряд",
    kind: "streak",
    reward: 70,
    earnedAt: "2026-07-17T09:00:00+03:00",
    progressPercent: 100,
    locked: false
  },
  {
    id: "badge-leader",
    code: "MONTH_LEADER",
    title: "Лидер месяца",
    description: "Занять первое место в ежемесячном рейтинге",
    kind: "leader",
    reward: 500,
    earnedAt: null,
    progressPercent: 32,
    locked: true
  }
];

export const demoCourses: LearningClassSummary[] = [
  {
    id: "61000000-0000-4000-8000-000000000001",
    title: "GMP: чистота и качество",
    description: "Базовые правила работы на современном фармпроизводстве.",
    category: "Качество",
    durationMinutes: 55,
    reward: 150,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 1,
    progressPercent: 100,
    status: "passed",
    modulesCount: 3,
    coverKind: "quality"
  },
  {
    id: "61000000-0000-4000-8000-000000000002",
    title: "Безопасность на производстве",
    description: "СИЗ, маршруты и действия при нештатной ситуации.",
    category: "Безопасность",
    durationMinutes: 40,
    reward: 100,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 70,
    status: "in_progress",
    modulesCount: 3,
    coverKind: "safety"
  },
  {
    id: "61000000-0000-4000-8000-000000000003",
    title: "Продукты Бионит: базовый курс",
    description: "Назначение ключевых групп ветеринарных препаратов.",
    category: "Продукты",
    durationMinutes: 75,
    reward: 120,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 20,
    status: "in_progress",
    modulesCount: 4,
    coverKind: "product"
  },
  {
    id: "61000000-0000-4000-8000-000000000004",
    title: "Наставничество без формальностей",
    description: "Как поддерживать новичка и давать развивающую обратную связь.",
    category: "Лидерство",
    durationMinutes: 45,
    reward: 180,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: "not_started",
    modulesCount: 3,
    coverKind: "leadership"
  }
];

const modulesByKind = {
  quality: [
    ["Что такое GMP", "GMP обеспечивает воспроизводимое качество препарата на каждом этапе производства."],
    ["Чистые зоны и гигиена", "Соблюдайте порядок переодевания, обработку рук и правила перемещения материалов."],
    ["Записи и отклонения", "Записывайте действия сразу; при отклонении остановите процесс и сообщите ответственному."]
  ],
  safety: [
    ["Средства индивидуальной защиты", "Перед работой проверьте целостность и соответствие СИЗ зоне."],
    ["Маршруты и зоны доступа", "Перемещайтесь только по разрешённым маршрутам и следуйте маркировке."],
    ["Нештатная ситуация", "Остановите работу безопасным способом и действуйте по локальному плану."]
  ],
  product: [
    ["Продуктовые направления", "Компания выпускает препараты для разных видов животных и задач."],
    ["Инструкция — главный источник", "Назначение и ограничения всегда сверяются с актуальной инструкцией."],
    ["Качество и прослеживаемость", "Каждая серия проходит контроль и имеет комплект записей."],
    ["Коммуникация с клиентом", "Используйте подтверждённые сведения, сложные вопросы передавайте специалисту."]
  ],
  leadership: [
    ["Контракт на адаптацию", "Договоритесь о целях, ритме встреч и каналах вопросов."],
    ["Понятные задачи", "Задача содержит результат, срок, критерии и ресурсы."],
    ["Обратная связь", "Обсуждайте наблюдаемое поведение, последствия и следующий шаг."]
  ]
} as const;

const questionsByKind = {
  quality: [
    ["Когда вносить запись о выполненной операции?", "Сразу после операции", "В конце недели", "Только по просьбе"],
    ["Что делать при обнаружении отклонения?", "Остановить процесс и сообщить", "Продолжить и сообщить позже", "Исправить без записи"],
    ["Зачем нужна прослеживаемость?", "Чтобы восстановить историю серии", "Для красивого отчёта", "Только для склада"]
  ],
  safety: [
    ["Что сделать с повреждённым СИЗ?", "Заменить до начала работы", "Использовать до конца смены", "Передать коллеге"],
    ["Как перемещаться по площадке?", "Только по разрешённым маршрутам", "По кратчайшему пути", "Маршрут не важен"],
    ["Первое действие при нештатной ситуации?", "Остановить работу и предупредить", "Продолжить работу", "Уйти без уведомления"]
  ],
  product: [
    ["Где проверять способ применения препарата?", "В актуальной инструкции", "По памяти", "В рекламе"],
    ["Что делать с вопросом вне компетенции?", "Передать профильному специалисту", "Предположить ответ", "Сослаться на слухи"],
    ["Что обеспечивает прослеживаемость серии?", "Комплект записей по процессу", "Только упаковка", "Устное подтверждение"]
  ],
  leadership: [
    ["Что есть в хорошо поставленной задаче?", "Результат, срок, критерии и ресурсы", "Только срок", "Общее пожелание"],
    ["На чём строится развивающая обратная связь?", "На наблюдаемом поведении и следующем шаге", "На ярлыках", "На сравнении"],
    ["Что согласовать в начале адаптации?", "Цели, ритм встреч и каналы вопросов", "Только дату финала", "Ничего"]
  ]
} as const;

export function getDemoLearningClass(classId: string): LearningClassDetail {
  const summary = demoCourses.find((item) => item.id === classId) ?? demoCourses[0];
  const modules = modulesByKind[summary.coverKind].map(([title, content], index) => ({
    id: `${summary.id}-module-${index + 1}`,
    title,
    content,
    sortOrder: index + 1,
    durationMinutes: Math.max(8, Math.round(summary.durationMinutes / summary.modulesCount)),
    completed: index < Math.ceil((summary.progressPercent / 100) * summary.modulesCount)
  }));
  const questions = questionsByKind[summary.coverKind].map(([prompt, correct, wrong1, wrong2], index) => ({
    id: `${summary.id}-q-${index + 1}`,
    prompt,
    sortOrder: index + 1,
    options: [
      { id: `${summary.id}-q-${index + 1}-correct`, label: correct },
      { id: `${summary.id}-q-${index + 1}-wrong-1`, label: wrong1 },
      { id: `${summary.id}-q-${index + 1}-wrong-2`, label: wrong2 }
    ]
  }));
  return {
    ...summary,
    longDescription: `${summary.description} Материал разбит на короткие модули и завершается тестом. Для прохождения необходимо набрать не менее ${summary.passThreshold}%.`,
    modules,
    questions,
    bestScore: summary.status === "passed" ? 100 : null
  };
}

export function submitDemoLearningAttempt(
  classId: string,
  answers: Record<string, string>
): LearningAttemptResult {
  const detail = getDemoLearningClass(classId);
  const correct = detail.questions.filter(
    (question) => answers[question.id] === `${question.id}-correct`
  ).length;
  const score = Math.round((correct / detail.questions.length) * 100);
  return {
    attemptId: crypto.randomUUID(),
    score,
    passed: score >= detail.passThreshold,
    attemptsUsed: Math.min(detail.attemptsUsed + 1, detail.maxAttempts),
    attemptsLeft: Math.max(detail.maxAttempts - detail.attemptsUsed - 1, 0),
    rewardGranted: score >= detail.passThreshold && detail.status !== "passed" ? detail.reward : 0
  };
}

export function getDemoDashboard(id: string): DashboardData {
  const profile = getDemoProfile(id);
  return {
    profile,
    stats: {
      onboardingPercent: profile.role === "employee" ? 67 : 100,
      learningPercent: profile.role === "employee" ? 48 : 86,
      companyRank: profile.role === "admin" ? 1 : profile.role === "manager" ? 2 : 8,
      badgeCount: profile.role === "employee" ? 4 : 6
    },
    activeOnboarding:
      profile.role === "employee"
        ? {
            assignmentId: "assignment-demo",
            title: "Добро пожаловать в Бионит",
            currentStage: "Первый месяц",
            completedTasks: 6,
            totalTasks: 9,
            dueDate: "2026-07-31"
          }
        : null,
    recommendedClass: demoCourses[1],
    latestBadge: demoBadges[6],
    weeklyEarned: 220
  };
}

export function getDemoOnboarding(): OnboardingData {
  return {
    assignmentId: "assignment-demo",
    title: "Добро пожаловать в Бионит",
    mentorName: "Михаил Орлов",
    mentorPosition: "Начальник отдела контроля качества",
    startDate: "2026-06-15",
    dueDate: "2026-07-31",
    progressPercent: 67,
    stages: [
      {
        id: "stage-day-one",
        title: "Первый день",
        description: "Оформление, безопасность и знакомство с командой.",
        sortOrder: 1,
        status: "completed",
        tasks: [
          ["mentor", "Познакомиться с наставником", "Обсудить план первых недель.", 30],
          ["ppe", "Получить комплект СИЗ", "Проверить размеры и правила хранения.", 30],
          ["briefing", "Пройти вводный инструктаж", "Подтвердить прохождение.", 50]
        ].map(([id, title, description, points]) => ({
          id: String(id),
          title: String(title),
          description: String(description),
          points: Number(points),
          dueDate: "2026-06-15",
          status: "completed" as const,
          required: true,
          completedAt: "2026-06-15T14:00:00+03:00"
        }))
      },
      {
        id: "stage-week-one",
        title: "Первая неделя",
        description: "Погружение в производство и стандарты GMP.",
        sortOrder: 2,
        status: "completed",
        tasks: [
          ["structure", "Изучить структуру компании", "Познакомиться с отделами.", 40],
          ["gmp", "Изучить вводный материал по GMP", "Отметить ключевые правила.", 60],
          ["tour", "Пройти экскурсию по производству", "Маршрут согласует наставник.", 80]
        ].map(([id, title, description, points]) => ({
          id: String(id),
          title: String(title),
          description: String(description),
          points: Number(points),
          dueDate: "2026-06-22",
          status: "completed" as const,
          required: true,
          completedAt: "2026-06-21T14:30:00+03:00"
        }))
      },
      {
        id: "stage-month-one",
        title: "Первый месяц",
        description: "Самостоятельная работа, обратная связь и итоги адаптации.",
        sortOrder: 3,
        status: "in_progress",
        tasks: [
          {
            id: "safety-course",
            title: "Завершить курс по безопасности",
            description: "Порог прохождения — 90%, доступно три попытки.",
            points: 100,
            dueDate: "2026-07-24",
            status: "in_progress",
            required: true,
            completedAt: null
          },
          {
            id: "survey",
            title: "Заполнить опрос по адаптации",
            description: "Оценить понятность задач и поддержку.",
            points: 70,
            dueDate: "2026-07-28",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "final-meeting",
            title: "Провести итоговую встречу",
            description: "Подвести итоги с наставником и руководителем.",
            points: 120,
            dueDate: "2026-07-31",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      }
    ],
    knowledge: [
      {
        id: "history",
        title: "35 лет Бионит",
        summary: "Как компания выросла в современное производство ветеринарных препаратов.",
        category: "О компании",
        readMinutes: 6,
        body: "Бионит объединяет научный подход, производственную дисциплину и заботу о здоровье животных."
      },
      {
        id: "safety",
        title: "Безопасность на площадке",
        summary: "Маршруты, СИЗ, зоны доступа и действия при нештатных ситуациях.",
        category: "Безопасность",
        readMinutes: 8,
        body: "Перед входом в производственные зоны проверьте комплект СИЗ и соблюдайте маркированные маршруты."
      },
      {
        id: "gmp",
        title: "GMP в ежедневной работе",
        summary: "Почему документирование и чистота напрямую влияют на качество препаратов.",
        category: "Качество",
        readMinutes: 10,
        body: "Каждый сотрудник фиксирует действия своевременно и работает только по актуальным инструкциям."
      }
    ],
    questions: [
      {
        id: "question-1",
        question: "Где получить дополнительный комплект защитных перчаток?",
        answer: "Обратитесь к мастеру смены или на склад СИЗ.",
        status: "answered",
        createdAt: "2026-06-17T10:00:00+03:00",
        answeredAt: "2026-06-17T10:40:00+03:00"
      }
    ]
  };
}

export const demoAchievements: AchievementStory[] = [
  { id: "a1", year: 1991, title: "Начало пути", description: "Команда Бионит начинает развивать ветеринарное фармацевтическое направление.", accent: "red", metric: "1 команда" },
  { id: "a2", year: 2000, title: "Собственное производство", description: "Запускаются новые производственные процессы и система контроля качества.", accent: "light", metric: "Новый этап" },
  { id: "a3", year: 2012, title: "Расширение продуктовой линейки", description: "Компания укрепляет экспертизу и выводит новые решения для здоровья животных.", accent: "dark", metric: "Больше решений" },
  { id: "a4", year: 2021, title: "Современное производство", description: "Процессы обновляются с фокусом на качество и развитие сотрудников.", accent: "light", metric: "Качество" },
  { id: "a5", year: 2026, title: "35 лет в деле", description: "Опыт, научный подход и энергия команды объединяются в новой системе развития.", accent: "red", metric: "35 лет" }
];

export function getDemoLeaderboards(id: string): LeaderboardsData {
  const rows = [
    [IDS.admin, "Елена Соколова", "HR-директор", "HR и развитие", 4120],
    [IDS.manager, "Михаил Орлов", "Начальник отдела контроля качества", "Контроль качества", 3280],
    ["p4", "Мария Фролова", "Специалист по качеству", "Контроль качества", 2740],
    ["p5", "Сергей Волков", "Мастер смены", "Производство", 2310],
    [IDS.employee, "Анна Крылова", "Инженер-технолог", "Производство", 1840]
  ] as const;
  return {
    periodLabel: "Июль 2026",
    employees: rows.map(([profileId, fullName, position, departmentName, score], index) => ({
      rank: index + 1,
      profileId,
      fullName,
      position,
      departmentName,
      score,
      avatarUrl: null,
      isCurrentUser: profileId === id
    })),
    departments: [
      { rank: 1, departmentId: "d1", departmentName: "Контроль качества", score: 12840, membersCount: 18 },
      { rank: 2, departmentId: "d2", departmentName: "Производство", score: 11320, membersCount: 56 },
      { rank: 3, departmentId: "d3", departmentName: "HR и развитие", score: 7890, membersCount: 8 },
      { rank: 4, departmentId: "d4", departmentName: "Исследования и разработки", score: 6540, membersCount: 14 }
    ]
  };
}

export function getDemoShop(id: string): ShopData {
  return {
    balance: getDemoProfile(id).balance,
    products: [
      { id: "polo", title: "Поло Бионит", description: "Красное или белое поло с вышитым логотипом.", price: 900, stock: 26, kind: "polo", featured: true, variants: [
        { id: "polo-red-m", title: "Красное · M", stock: 8 },
        { id: "polo-red-l", title: "Красное · L", stock: 7 },
        { id: "polo-white-m", title: "Белое · M", stock: 5 }
      ] },
      { id: "sweatshirt", title: "Свитшот «В деле»", description: "Тёплый фирменный свитшот для команды.", price: 1200, stock: 19, kind: "sweatshirt", featured: true, variants: [
        { id: "sweat-gray-m", title: "Графит · M", stock: 5 },
        { id: "sweat-red-l", title: "Красный · L", stock: 4 }
      ] },
      { id: "thermos", title: "Термос", description: "Стальной термос с монохромным логотипом.", price: 650, stock: 24, kind: "thermos", featured: false, variants: [] },
      { id: "tote", title: "Сумка «Несём здоровье»", description: "Хлопковая сумка с фирменным паттерном.", price: 420, stock: 32, kind: "tote", featured: false, variants: [] },
      { id: "notebook", title: "Блокнот", description: "Красный блокнот с капсульным паттерном.", price: 280, stock: 40, kind: "notebook", featured: false, variants: [] },
      { id: "pins", title: "Набор пинов", description: "Три фирменных пина для бейджа или сумки.", price: 100, stock: 49, kind: "pins", featured: false, variants: [] }
    ],
    recentOrders: [
      { id: "order-1", number: "BD-2026-01001", productTitle: "Набор пинов", variantTitle: null, quantity: 1, total: 100, status: "approved", createdAt: "2026-07-19T10:00:00+03:00" }
    ]
  };
}

export function getDemoAdminDashboard(): AdminDashboardData {
  return {
    metrics: { newOrders: 7, activeEmployees: 130, onboardingInProgress: 9, learningPassRate: 92 },
    orders: [
      { id: "order-a", number: "BD-0268", productTitle: "Поло Бионит", variantTitle: "Красное · M", quantity: 1, total: 900, status: "new", createdAt: "2026-07-20T09:14:00+03:00", employeeName: "Анна Крылова" },
      { id: "order-b", number: "BD-0267", productTitle: "Термос", variantTitle: null, quantity: 1, total: 650, status: "approved", createdAt: "2026-07-19T15:40:00+03:00", employeeName: "Михаил Орлов" },
      { id: "order-c", number: "BD-0266", productTitle: "Свитшот «В деле»", variantTitle: "Красный · L", quantity: 1, total: 1200, status: "assembling", createdAt: "2026-07-19T11:05:00+03:00", employeeName: "Мария Фролова" }
    ],
    employees: Object.values(profiles).map((profile, index) => ({
      id: profile.id,
      employeeNumber: index === 0 ? "1001" : index === 1 ? "1002" : "9001",
      fullName: profile.fullName,
      departmentName: profile.departmentName,
      position: profile.position,
      role: profile.role,
      status: "active" as const,
      authLinked: true
    })),
    departments: [
      { id: "21000000-0000-4000-8000-000000000001", name: "Производство" },
      { id: "21000000-0000-4000-8000-000000000002", name: "Контроль качества" },
      { id: "21000000-0000-4000-8000-000000000003", name: "HR и развитие" },
      { id: "21000000-0000-4000-8000-000000000004", name: "Исследования и разработки" },
      { id: "21000000-0000-4000-8000-000000000005", name: "Продажи и маркетинг" }
    ]
  };
}
