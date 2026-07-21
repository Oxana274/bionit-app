import type {
  AchievementStory,
  AdminDashboardData,
  BadgeSummary,
  DashboardData,
  DepartmentLeaderboardRow,
  EmployeeLeaderboardRow,
  LeaderboardsData,
  LearningAttemptResult,
  LearningClassDetail,
  LearningClassSummary,
  OnboardingData,
  ProfileSummary,
  ShopData,
  ShopOrder,
  ShopProduct,
  UserRole
} from "@/types/domain";

export const DEMO_PROFILE_IDS = {
  employee: "10000000-0000-4000-8000-000000000001",
  manager: "10000000-0000-4000-8000-000000000002",
  admin: "10000000-0000-4000-8000-000000000003"
} as const;

const profiles: Record<string, ProfileSummary> = {
  [DEMO_PROFILE_IDS.employee]: {
    id: DEMO_PROFILE_IDS.employee,
    firstName: "Анна",
    lastName: "Крылова",
    fullName: "Анна Крылова",
    position: "Менеджер по продажам",
    departmentName: "Продажи и маркетинг",
    role: "employee",
    avatarUrl: null,
    hiredAt: "2026-06-15",
    balance: 1840
  },
  [DEMO_PROFILE_IDS.manager]: {
    id: DEMO_PROFILE_IDS.manager,
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
  [DEMO_PROFILE_IDS.admin]: {
    id: DEMO_PROFILE_IDS.admin,
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

export function getDemoProfile(profileId: string): ProfileSummary {
  return profiles[profileId] ?? profiles[DEMO_PROFILE_IDS.employee]!;
}

export const demoProfile = getDemoProfile;

export const demoBadges: BadgeSummary[] = [
  {
    id: "b1",
    code: "FIRST_STEP",
    title: "Первые шаги",
    description: "Получить 50 Биоников.",
    kind: "first-step",
    reward: 100,
    earnedAt: "2026-06-18T10:00:00Z",
    progressPercent: 100,
    locked: false
  },
  {
    id: "b2",
    code: "ACTIVIST",
    title: "Активист",
    description: "Получить 5 достижений.",
    kind: "team",
    reward: 120,
    earnedAt: null,
    progressPercent: 60,
    locked: true
  },
  {
    id: "b3",
    code: "MENTOR",
    title: "Наставник",
    description: "Участие в обучении студентов.",
    kind: "mentor",
    reward: 250,
    earnedAt: null,
    progressPercent: 0,
    locked: true
  },
  {
    id: "b4",
    code: "VOLUNTEER",
    title: "Волонтёр",
    description: "Помощь приюту для животных.",
    kind: "team",
    reward: 150,
    earnedAt: null,
    progressPercent: 0,
    locked: true
  },
  {
    id: "b5",
    code: "SPORTSMAN",
    title: "Спортсмен",
    description: "Участие в спортивных мероприятиях.",
    kind: "team",
    reward: 150,
    earnedAt: "2026-07-01T10:00:00Z",
    progressPercent: 100,
    locked: false
  },
  {
    id: "b6",
    code: "MASTER",
    title: "Мастер своего дела",
    description: "Получить 500 Биоников.",
    kind: "leader",
    reward: 500,
    earnedAt: null,
    progressPercent: 37,
    locked: true
  },
  {
    id: "b7",
    code: "LEGEND",
    title: "Легенда Бионит",
    description: "Получить 2000 Биоников.",
    kind: "leader",
    reward: 1000,
    earnedAt: null,
    progressPercent: 9,
    locked: true
  },
  {
    id: "b8",
    code: "PROBATION",
    title: "Испытание пройдено",
    description: "Окончание испытательного срока.",
    kind: "first-step",
    reward: 200,
    earnedAt: null,
    progressPercent: 0,
    locked: true
  },
  {
    id: "b9",
    code: "BIRTHDAY",
    title: "Именинник",
    description: "День рождения.",
    kind: "anniversary",
    reward: 150,
    earnedAt: "2026-07-12T09:00:00Z",
    progressPercent: 100,
    locked: false
  },
  {
    id: "b10",
    code: "NEWBIE",
    title: "Новичок",
    description: "Завершение онбординга.",
    kind: "first-step",
    reward: 300,
    earnedAt: null,
    progressPercent: 30,
    locked: true
  }
];

export const demoLearningCatalog: LearningClassSummary[] = [
  {
    id: "61000000-0000-4000-8000-000000000101",
    title: "Класс А: Охрана труда",
    description: "Обязательный вводный класс: риски, СИЗ и действия при происшествиях.",
    category: "Охрана труда",
    durationMinutes: 45,
    reward: 100,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: "not_started",
    modulesCount: 3,
    coverKind: "safety"
  },
  {
    id: "61000000-0000-4000-8000-000000000102",
    title: "Класс Б: GMP",
    description: "Базовые принципы надлежащей производственной практики на фармпроизводстве.",
    category: "GMP",
    durationMinutes: 60,
    reward: 150,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: "not_started",
    modulesCount: 3,
    coverKind: "quality"
  },
  {
    id: "61000000-0000-4000-8000-000000000103",
    title: "Класс В: Электробезопасность",
    description: "Безопасная работа с электрооборудованием и первая реакция на аварийную ситуацию.",
    category: "Электробезопасность",
    durationMinutes: 50,
    reward: 200,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: "not_started",
    modulesCount: 3,
    coverKind: "safety"
  },
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
    modulesCount: 3,
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

export const demoCourses = demoLearningCatalog;

type DemoLearningQuestion = {
  prompt: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
};

type DemoLearningContent = {
  longDescription: string;
  modules: Array<{ title: string; content: string }>;
  questions: DemoLearningQuestion[];
};

const learningContent: Record<string, DemoLearningContent> = {
  "61000000-0000-4000-8000-000000000101": {
    longDescription:
      "Вводный класс по охране труда для сотрудников производственной компании. Материал охватывает основные опасности, применение СИЗ и порядок действий при происшествиях.",
    modules: [
      {
        title: "Опасности и ответственность",
        content:
          "До начала работы оцените рабочую зону, соблюдайте знаки безопасности и не приступайте к операции без обучения и допуска. О замеченном риске необходимо сообщить руководителю."
      },
      {
        title: "Средства индивидуальной защиты",
        content:
          "Используйте только исправные СИЗ, соответствующие операции и зоне. Проверяйте их до начала работы, а повреждённые средства заменяйте."
      },
      {
        title: "Происшествие и эвакуация",
        content:
          "Остановите работу безопасным способом, предупредите людей рядом, сообщите ответственному и действуйте по плану эвакуации."
      }
    ],
    questions: [
      {
        prompt: "Что сделать перед началом работы с потенциально опасным оборудованием?",
        options: [
          "Проверить допуск, рабочую зону и СИЗ",
          "Сразу включить оборудование",
          "Попросить коллегу выполнить операцию без инструктажа"
        ],
        correctIndex: 0
      },
      {
        prompt: "Как поступить с повреждённым СИЗ?",
        options: [
          "Использовать до конца смены",
          "Заменить до начала работы",
          "Передать другому сотруднику"
        ],
        correctIndex: 1
      },
      {
        prompt: "Какое первое действие при нештатной ситуации?",
        options: [
          "Продолжить работу до конца операции",
          "Уйти, никого не предупредив",
          "Безопасно остановить работу и сообщить ответственному"
        ],
        correctIndex: 2
      }
    ]
  },
  "61000000-0000-4000-8000-000000000102": {
    longDescription:
      "Класс знакомит с базовыми принципами GMP: личной гигиеной, предотвращением контаминации, документированием операций и реакцией на отклонения.",
    modules: [
      {
        title: "Зачем нужен GMP",
        content:
          "GMP обеспечивает воспроизводимое качество продукции. Процесс должен выполняться по утверждённым процедурам, а критические действия — быть прослеживаемыми."
      },
      {
        title: "Гигиена и предотвращение контаминации",
        content:
          "Соблюдайте порядок переодевания, обработку рук, зонирование и маршруты персонала и материалов."
      },
      {
        title: "Записи и отклонения",
        content:
          "Запись вносится сразу после операции. При отклонении необходимо остановить процесс, сохранить факты и сообщить ответственному."
      }
    ],
    questions: [
      {
        prompt: "Когда нужно внести запись о выполненной операции?",
        options: ["Сразу после операции", "В конце недели", "Только по просьбе руководителя"],
        correctIndex: 0
      },
      {
        prompt: "Что делать при обнаружении отклонения?",
        options: [
          "Скрыть отклонение",
          "Остановить процесс и сообщить ответственному",
          "Продолжить работу без записи"
        ],
        correctIndex: 1
      },
      {
        prompt: "Для чего нужна прослеживаемость?",
        options: [
          "Только для отчётности склада",
          "Для красивой презентации",
          "Чтобы восстановить историю серии и принятых решений"
        ],
        correctIndex: 2
      }
    ]
  },
  "61000000-0000-4000-8000-000000000103": {
    longDescription:
      "Класс по электробезопасности объясняет правила допуска к электрооборудованию, безопасное отключение и действия при поражении электрическим током.",
    modules: [
      {
        title: "Допуск и осмотр оборудования",
        content:
          "Работать с электрооборудованием можно только в пределах своей квалификации и допуска. Перед использованием проверьте кабель, вилку, корпус и защитные устройства."
      },
      {
        title: "Безопасное отключение",
        content:
          "Перед очисткой, ремонтом или устранением неисправности оборудование должно быть отключено и защищено от случайного включения."
      },
      {
        title: "Поражение электрическим током",
        content:
          "Не касайтесь пострадавшего, пока источник энергии не отключён. Обесточьте установку безопасным способом, вызовите помощь и действуйте по инструкции первой помощи."
      }
    ],
    questions: [
      {
        prompt: "Что проверить перед использованием электрооборудования?",
        options: [
          "Только наличие кнопки запуска",
          "Кабель, вилку, корпус и защитные устройства",
          "Только дату изготовления"
        ],
        correctIndex: 1
      },
      {
        prompt: "Что необходимо сделать перед очисткой оборудования?",
        options: [
          "Отключить и исключить случайное включение",
          "Оставить оборудование работающим",
          "Только предупредить коллегу"
        ],
        correctIndex: 0
      },
      {
        prompt: "Можно ли касаться пострадавшего до отключения источника тока?",
        options: [
          "Да, если надеты обычные перчатки",
          "Да, если действовать быстро",
          "Нет, сначала необходимо безопасно обесточить установку"
        ],
        correctIndex: 2
      }
    ]
  },
  "61000000-0000-4000-8000-000000000001": {
    longDescription:
      "Курс знакомит с личной гигиеной, ведением записей, предотвращением контаминации и реакцией на отклонения.",
    modules: [
      {
        title: "Что такое GMP",
        content: "GMP обеспечивает воспроизводимое качество препарата на каждом этапе производства."
      },
      {
        title: "Чистые зоны и гигиена",
        content: "Соблюдайте порядок переодевания, обработку рук и правила перемещения материалов."
      },
      {
        title: "Записи и отклонения",
        content: "Записывайте действия сразу; при отклонении остановите процесс и сообщите ответственному."
      }
    ],
    questions: [
      {
        prompt: "Когда фиксировать операцию?",
        options: ["В конце смены", "Сразу после выполнения", "Раз в неделю"],
        correctIndex: 1
      },
      {
        prompt: "Что делать при отклонении?",
        options: ["Продолжить", "Скрыть запись", "Остановить и сообщить"],
        correctIndex: 2
      },
      {
        prompt: "Для чего нужен маршрут материалов?",
        options: ["Снижение риска контаминации", "Парковка", "Реклама"],
        correctIndex: 0
      }
    ]
  },
  "61000000-0000-4000-8000-000000000002": {
    longDescription: "Практический курс о безопасной работе на производственной площадке.",
    modules: [
      {
        title: "Средства индивидуальной защиты",
        content: "Перед работой проверьте целостность и соответствие СИЗ зоне."
      },
      {
        title: "Маршруты и зоны доступа",
        content: "Перемещайтесь только по разрешённым маршрутам и следуйте маркировке."
      },
      {
        title: "Нештатная ситуация",
        content: "Остановите работу безопасным способом и действуйте по локальному плану."
      }
    ],
    questions: [
      {
        prompt: "Когда проверять СИЗ?",
        options: ["До начала работы", "После смены", "Только при проверке"],
        correctIndex: 0
      },
      {
        prompt: "Как действовать при аварийном сигнале?",
        options: ["Игнорировать", "Следовать локальному плану", "Уйти без уведомления"],
        correctIndex: 1
      },
      {
        prompt: "Где разрешено перемещаться?",
        options: ["По любому короткому пути", "Только по разрешённым маршрутам", "Через склад"],
        correctIndex: 1
      }
    ]
  },
  "61000000-0000-4000-8000-000000000003": {
    longDescription: "Обзор продуктовых направлений Бионит и правил корректной коммуникации.",
    modules: [
      {
        title: "Продуктовые направления",
        content: "Компания выпускает препараты для разных видов животных и задач."
      },
      {
        title: "Инструкция — главный источник",
        content: "Назначение и ограничения всегда сверяются с актуальной инструкцией."
      },
      {
        title: "Коммуникация с клиентом",
        content: "Используйте подтверждённые сведения, сложные вопросы передавайте специалисту."
      }
    ],
    questions: [
      {
        prompt: "Где проверять способ применения препарата?",
        options: ["В актуальной инструкции", "По памяти", "В рекламе"],
        correctIndex: 0
      },
      {
        prompt: "Что делать с вопросом вне компетенции?",
        options: ["Предположить ответ", "Передать профильному специалисту", "Сослаться на слухи"],
        correctIndex: 1
      },
      {
        prompt: "Что важнее в продуктовой коммуникации?",
        options: ["Точность", "Скорость любой ценой", "Яркий слоган"],
        correctIndex: 0
      }
    ]
  },
  "61000000-0000-4000-8000-000000000004": {
    longDescription: "Курс для наставников и руководителей о постановке задач и поддержке новичка.",
    modules: [
      {
        title: "Контракт на адаптацию",
        content: "Согласуйте цели, ритм встреч и каналы для вопросов."
      },
      {
        title: "Понятные задачи",
        content: "Формулируйте результат, срок, критерии качества и доступные ресурсы."
      },
      {
        title: "Обратная связь",
        content: "Обсуждайте наблюдаемое поведение, последствия и следующий шаг."
      }
    ],
    questions: [
      {
        prompt: "Что должно быть в задаче?",
        options: ["Только срок", "Результат, срок, критерии и ресурсы", "Общее пожелание"],
        correctIndex: 1
      },
      {
        prompt: "На чём строится развивающая обратная связь?",
        options: ["На ярлыках", "На наблюдаемом поведении и следующем шаге", "На сравнении"],
        correctIndex: 1
      },
      {
        prompt: "Что согласовать с новичком в начале?",
        options: ["Цели, ритм встреч и каналы вопросов", "Только дату финала", "Ничего"],
        correctIndex: 0
      }
    ]
  }
};

export function getDemoLearningClass(classId: string): LearningClassDetail {
  const summary = demoLearningCatalog.find((item) => item.id === classId);

  if (!summary) {
    throw new Error(`Класс ${classId} не найден.`);
  }

  const content = learningContent[classId];

  if (!content) {
    throw new Error(`Материалы класса ${classId} не найдены.`);
  }

  return {
    ...summary,
    longDescription: content.longDescription,
    bestScore: summary.status === "passed" ? 100 : null,
    modules: content.modules.map((module, index) => ({
      id: `${classId}-module-${index + 1}`,
      title: module.title,
      sortOrder: index + 1,
      durationMinutes: Math.max(8, Math.round(summary.durationMinutes / content.modules.length)),
      content: module.content,
      completed: index < Math.round((summary.modulesCount * summary.progressPercent) / 100)
    })),
    questions: content.questions.map((question, questionIndex) => ({
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

export const demoLearningDetail = getDemoLearningClass;

export function demoCorrectAnswers(classId: string): Record<string, string> {
  const content = learningContent[classId];

  if (!content) return {};

  return Object.fromEntries(
    content.questions.map((question, questionIndex) => [
      `${classId}-question-${questionIndex + 1}`,
      `${classId}-question-${questionIndex + 1}-option-${question.correctIndex + 1}`
    ])
  );
}

export function submitDemoLearningAttempt(
  classId: string,
  answers: Record<string, string>
): LearningAttemptResult {
  const course = demoLearningCatalog.find((item) => item.id === classId);
  const correctAnswers = demoCorrectAnswers(classId);
  const questionIds = Object.keys(correctAnswers);

  if (!course || questionIds.length === 0) {
    throw new Error("Класс не найден.");
  }

  if (questionIds.some((questionId) => !answers[questionId])) {
    throw new Error("Ответьте на все вопросы.");
  }

  const correctCount = questionIds.reduce(
    (total, questionId) => total + (answers[questionId] === correctAnswers[questionId] ? 1 : 0),
    0
  );
  const score = Math.round((correctCount / questionIds.length) * 100);
  const passed = score >= course.passThreshold;
  const attemptsUsed = Math.min(course.attemptsUsed + 1, course.maxAttempts);

  return {
    attemptId: `demo-${classId}-${Date.now()}`,
    score,
    passed,
    attemptsUsed,
    attemptsLeft: Math.max(course.maxAttempts - attemptsUsed, 0),
    rewardGranted: passed ? course.reward : 0
  };
}

export type DemoBionicTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

export const demoTransactions: DemoBionicTransaction[] = [
  {
    id: "tx-2026-07-20-welcome",
    date: "2026-07-20T09:30:00Z",
    description: "Welcome-тренинг: задание выполнено",
    amount: 50
  },
  {
    id: "tx-2026-07-18-support",
    date: "2026-07-18T13:00:00Z",
    description: "Помощь новому сотруднику",
    amount: 100
  },
  {
    id: "tx-2026-07-16-stickers",
    date: "2026-07-16T11:20:00Z",
    description: "Покупка: Стикеры «Силуэты»",
    amount: -80
  },
  {
    id: "tx-2026-07-12-birthday",
    date: "2026-07-12T09:00:00Z",
    description: "Бейдж «Именинник»",
    amount: 150
  },
  {
    id: "tx-2026-07-10-gmp",
    date: "2026-07-10T15:40:00Z",
    description: "Класс Б: GMP — тест пройден",
    amount: 150
  },
  {
    id: "tx-2026-07-05-mug",
    date: "2026-07-05T12:10:00Z",
    description: "Покупка: Термокружка",
    amount: -300
  },
  {
    id: "tx-2026-07-01-sport",
    date: "2026-07-01T10:00:00Z",
    description: "Бейдж «Спортсмен»",
    amount: 150
  },
  {
    id: "tx-2026-06-18-first-step",
    date: "2026-06-18T10:00:00Z",
    description: "Бейдж «Первые шаги»",
    amount: 100
  }
];

/**
 * Загрузчик production-режима по-прежнему ожидает AchievementStory[].
 * Дополнительные поля date и amount сохраняются в runtime и используются
 * обновлённым AchievementsView для отображения истории Биоников.
 */
export const demoAchievements: Array<
  AchievementStory & { date: string; amount: number }
> = demoTransactions.map((transaction) => ({
  id: transaction.id,
  year: Number(transaction.date.slice(0, 4)),
  title: transaction.description,
  description: transaction.date,
  accent: transaction.amount >= 0 ? "red" : "dark",
  metric: `${transaction.amount > 0 ? "+" : ""}${transaction.amount} Биоников`,
  date: transaction.date,
  amount: transaction.amount
}));

export function getDemoOnboarding(): OnboardingData {
  return {
    assignmentId: "sales-onboarding-assignment-demo",
    title: "Менеджер по продажам: индивидуальный план",
    mentorName: "Валерий Распопов",
    mentorPosition: "Руководитель направления продаж",
    startDate: "2026-07-20",
    dueDate: "2026-11-14",
    progressPercent: 30,
    stages: [
      {
        id: "52000000-0000-4000-8000-000000000101",
        title: "Welcome-тренинг",
        description: "7 дней: компания, правила работы, поддержка, доступы и первые договорённости.",
        sortOrder: 1,
        status: "in_progress",
        tasks: [
          {
            id: "sales-task-welcome-1",
            title: "Пройти Welcome-тренинг",
            description: "Познакомиться с историей Бионит, продуктами, клиентами и ценностями компании.",
            points: 50,
            dueDate: "2026-07-20",
            status: "completed",
            required: true,
            completedAt: "2026-07-20T09:00:00Z"
          },
          {
            id: "sales-task-welcome-2",
            title: "Представить Бионит за 30 секунд",
            description: "Подготовить краткое представление компании для первого контакта с клиентом.",
            points: 30,
            dueDate: "2026-07-21",
            status: "completed",
            required: true,
            completedAt: "2026-07-20T12:30:00Z"
          },
          {
            id: "sales-task-welcome-3",
            title: "Сверить карту поддержки",
            description: "Проверить контакты руководителя, бухгалтерии, логиста, складов и специалиста 1С.",
            points: 30,
            dueDate: "2026-07-21",
            status: "completed",
            required: true,
            completedAt: "2026-07-20T14:00:00Z"
          },
          {
            id: "sales-task-welcome-4",
            title: "Проверить рабочие доступы",
            description: "Убедиться, что доступны корпоративная почта, 1С ERP, Битрикс24 и CRM.",
            points: 40,
            dueDate: "2026-07-22",
            status: "in_progress",
            required: true,
            completedAt: null
          },
          {
            id: "sales-task-welcome-5",
            title: "Разобрать правила работы",
            description: "Зафиксировать результат, срок, критерий качества, риск и следующий шаг.",
            points: 40,
            dueDate: "2026-07-24",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "sales-task-welcome-6",
            title: "Согласовать план первых 14 дней",
            description: "Определить контрольные точки на День 1, День 3, День 7 и День 14.",
            points: 60,
            dueDate: "2026-07-26",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000102",
        title: "Продуктовая база",
        description: "14 дней: ассортимент, инструкции, преимущества и ограничения продуктов.",
        sortOrder: 2,
        status: "not_started",
        tasks: [
          {
            id: "sales-task-product-1",
            title: "Сдать продуктовый минимум",
            description: "Подготовить презентацию Миомага, Азитромицина Бионит и вакцин для птицы.",
            points: 120,
            dueDate: "2026-08-09",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000103",
        title: "Работа с клиентами",
        description: "30 дней: поиск информации, контакт, СПИН, презентация и возражения.",
        sortOrder: 3,
        status: "not_started",
        tasks: [
          {
            id: "sales-task-clients-1",
            title: "Провести первые клиентские контакты",
            description: "Зафиксировать в CRM информацию о клиенте, потребность и следующий шаг.",
            points: 150,
            dueDate: "2026-09-08",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000104",
        title: "План адаптации",
        description: "60 дней: территория, воронка, KPI, прогнозирование и ритм взаимодействия.",
        sortOrder: 4,
        status: "not_started",
        tasks: [
          {
            id: "sales-task-plan-1",
            title: "Защитить план продаж и развития",
            description: "Согласовать целевые клиенты, активности, сроки и критерии результата.",
            points: 200,
            dueDate: "2026-11-07",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000105",
        title: "Финиш",
        description: "7 дней: итоговая встреча, обратная связь и план дальнейшего развития.",
        sortOrder: 5,
        status: "not_started",
        tasks: [
          {
            id: "sales-task-finish-1",
            title: "Подвести итоги онбординга",
            description: "Обсудить результаты, зоны развития и получить финальную обратную связь.",
            points: 250,
            dueDate: "2026-11-14",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      }
    ],
    knowledge: [
      {
        id: "54000000-0000-4000-8000-000000000101",
        title: "Бионит: компания, продукт и клиенты",
        summary: "История ГК «Бионит», производство, ассортимент и факты для переговоров.",
        category: "Продажи · Компания",
        readMinutes: 9,
        body: `1. О Группе компаний «Бионит»

ИСТОРИЯ КОМПАНИИ

Группа компаний «Бионит» основана в 1991 году владимирскими учёными-биологами и фармацевтами. За 35 лет предприятие прошло путь от небольшой лаборатории до современного завода — производителя лекарственных средств и вакцин для животных и птиц.

Сегодня в компании работает более 130 человек. Производственные площади выросли с 750 до 3 000 м². Продукция производится по стандартам GMP, с соблюдением международных норм и строгой системой контроля качества.

КЛЮЧЕВЫЕ ФАКТЫ

• Год основания — 1991.
• Более 35 лет на рынке.
• Более 130 сотрудников.
• 3 000 м² производственных площадей.
• Поставки в 85 регионов России и зарубежные страны.
• Собственные склады, лабораторный комплекс и производственные линии.
• Система менеджмента качества ГОСТ Р ИСО 9001-2015 и GMP.

АССОРТИМЕНТ

• ветеринарные лекарственные препараты;
• иммунобиологические препараты — вакцины;
• санитарно-гигиенические средства и дезинфекция;
• общеукрепляющие и тонизирующие препараты;
• гинекологические, противомаститные и гормональные препараты;
• противопаразитарные и антибактериальные препараты;
• мази и другие формы ветеринарной продукции.

ПРОИЗВОДСТВО

| Направление | Годовой объём производства |
| --- | --- |
| Инфузионные растворы | Более 2 400 000 литров |
| Растворы антибиотиков | Свыше 24 000 литров |
| Вакцины | Более 360 000 000 доз |

СОЦИАЛЬНАЯ ОТВЕТСТВЕННОСТЬ

• помощь приютам для животных лекарствами, кормами и расходными материалами;
• образовательные программы для учащихся Владимирского аграрного колледжа;
• бесплатные курсы для российских фермеров;
• поддержка командных спортивных инициатив.

ВАЖНО ДЛЯ ПРОДАЖ

Используйте факты не как перечень цифр, а как доказательства надёжности: стабильное производство, контроль качества, широкая география поставок, собственная экспертиза и поддержка партнёров.`
      },
      {
        id: "54000000-0000-4000-8000-000000000102",
        title: "Правила игры: задачи, сроки и риски",
        summary: "Сбор информации, первый контакт, СПИН-презентация и ответы на возражения.",
        category: "Продажи · Переговоры",
        readMinutes: 12,
        body: `6. Этапы продажи

6.1. СБОР ИНФОРМАЦИИ — 90% УСПЕХА

До контакта с клиентом узнайте:

• период существования и направления бизнеса;
• выручку и прибыль за три года, если сведения доступны;
• численность животных, породу и продуктивность;
• кто является ЛПР: главный ветеринарный врач, зоотехник или руководитель;
• с какими поставщиками и препаратами работает клиент;
• как проходит закупка: тендер, прямой договор или дистрибьютор.

Источники: сайт клиента, открытые реестры, социальные сети, отзывы, отраслевые базы и вопросы самому клиенту.

6.2. УСТАНОВЛЕНИЕ КОНТАКТА

Цель первого контакта — договориться о встрече или полноценных переговорах. Не пытайтесь сразу рассказать обо всём ассортименте. Используйте один факт, связанный с задачей клиента, и предложите конкретный следующий шаг.

6.3. ПРЕЗЕНТАЦИЯ И ВЫЯВЛЕНИЕ ПОТРЕБНОСТЕЙ

Используйте технику СПИН:

• ситуационные вопросы — понять исходные условия;
• проблемные — выявить трудность;
• извлекающие — показать последствия и цену бездействия;
• направляющие — помочь увидеть ценность решения.

Структура презентации:

• покажите расчёт потерь клиента;
• приведите исследования и практические кейсы;
• сравните решение с альтернативами;
• завершите следующим шагом: расчётом, пробой, тестовой партией или встречей со специалистом.

6.4. РАБОТА С ВОЗРАЖЕНИЯМИ

| Возражение | Рекомендуемый ответ |
| --- | --- |
| «Дорого» | «Давайте посчитаем потери. Курс Миомага стоит 63 рубля на корову, а возможные потери превышают 500 тыс. рублей.» |
| «Работаем с другим поставщиком» | «Прекрасно, значит, есть с чем сравнить. Предлагаю пробу на 10 головах и оценку результата через месяц.» |
| «Нет денег» | «Обсудим отсрочку платежа или тестовую партию, чтобы снизить риск решения.» |
| «Окситоцин привычнее и дешевле» | «В пересчёте на курс Миомаг экономичнее и действует напрямую на гладкую мускулатуру даже в условиях стресса.» |
| «У азитромицина долгий срок ожидания» | «Это требует планирования, но обеспечивает контролируемое выведение остатков и безопасность продукции.» |

ВАЖНО

• Не спорьте с клиентом и не обесценивайте его опыт.
• Не обещайте результат без понимания ситуации хозяйства.
• После разговора зафиксируйте: кто, что и к какому сроку делает.`
      },
      {
        id: "54000000-0000-4000-8000-000000000103",
        title: "Карта поддержки и рабочие системы",
        summary: "Корпоративные каналы, операции в 1С, контакты и правила эскалации.",
        category: "Продажи · Процессы",
        readMinutes: 11,
        body: `7. Процесс продаж: системы и карта поддержки

ОСНОВНЫЕ СИСТЕМЫ

• Корпоративная почта — заказы, подтверждения, документы и внешняя переписка. Заказы принимаются на sale@bionit.ru.
• 1С ERP — заказы, условия продаж, готовность, реализация, дебиторская задолженность и оригиналы документов.
• Битрикс24 — задачи, внутренние материалы и согласования.
• CRM — клиенты, сделки, история контактов и следующие шаги.
• ЭДО — обмен юридически значимыми документами.

КЛЮЧЕВЫЕ ОПЕРАЦИИ В 1С ERP

| Задача | Путь или действие в системе |
| --- | --- |
| Создать заказ клиента | «Продажи» → «Заказы клиентов» → «Создать» |
| Проверить условия оплаты | Карточка клиента → «Соглашения с клиентом» → «Условия продаж» |
| Проверить оплату | «Продажи» → «Расчёты с клиентами» → «Оплата клиентов» |
| Проверить готовность заказа | «Продажи» → «Дополнительные обработки» → «Приоритеты отгрузок» |
| Оформить реализацию | «Продажи» → «Накладные к оформлению» → «Оформить по заказам» |
| Контролировать задолженность | «Продажи» → «Отчёты по продажам» → «Дебиторская задолженность» |
| Проверить оригиналы | «Главное» → «Отчёты» → «Отчёт по документам без оригинала» |

КОНТАКТЫ

| Роль или ресурс | Контакт |
| --- | --- |
| Телефон офиса | +7 (4922) 34-16-21 |
| Почта для заказов и вопросов | sale@bionit.ru |
| Оперативная проверка оплаты | Елена Хуртова, +7 960 719-70-70 |
| Главный бухгалтер | Екатерина Алехина, +7 915 772-78-00 |
| Логист | Татьяна Кравчук, +7 903 833-58-33 |
| Склад Лакина | Екатерина Капранова, +7 904 596-32-56 |
| Склад Мостостроевская | Иван Бирюков, +7 900 474-67-78 |
| Программист 1С | Владимир Катков, +7 903 647-01-95 |
| Руководитель | Валерий Распопов, +7 (926) 215-08-83 |

ПРАВИЛА ЭСКАЛАЦИИ

Передавайте не сообщение «не работает», а контекст: клиент, номер заказа, ожидаемый и фактический результат, скриншот, срочность и влияние на отгрузку или оплату.`
      },
      {
        id: "54000000-0000-4000-8000-000000000104",
        title: "Первые 14 дней: контрольные точки",
        summary: "Маршрут по воронке продаж: заказ, оплата, готовность, логистика и документы.",
        category: "Продажи · Воронка",
        readMinutes: 15,
        body: `7.1. Основная воронка продаж

ДЕНЬ 1 — ПРИНЯТЬ И ВВЕСТИ ЗАКАЗ

• получить заказ на sale@bionit.ru;
• создать заказ: «Продажи» → «Заказы клиентов» → «Создать»;
• проверить клиента, позиции, количество, цену, оплату и доставку;
• оставить статус «На согласовании» до подтверждения.

Контрольная точка Дня 1:

• письмо сохранено;
• заказ создан;
• позиции, объёмы и цены проверены;
• понятен следующий шаг.

ДЕНЬ 3 — СОГЛАСОВАТЬ ЦЕНУ И ОПЛАТУ

• снижать цену поэтапно, сохраняя маржинальность;
• для постоплаты получить письменное подтверждение;
• для предоплаты дождаться полной суммы;
• перевести заказ в статус «К выполнению».

Контрольная точка Дня 3:

• цена и объём согласованы;
• подтверждение или предоплата получены;
• заказ доступен производству.

ДЕНЬ 7 — ПРОВЕРИТЬ ГОТОВНОСТЬ И ЛОГИСТИКУ

• проверить «Приоритеты отгрузок»;
• передать клиенту прогноз готовности;
• согласовать полную или частичную отгрузку;
• проверить остаточный срок годности и терморежим.

| Способ поставки | Минимальная сумма заказа без НДС |
| --- | --- |
| Доставка за счёт компании | От 150 000 руб. |
| Самовывоз | От 100 000 руб. |
| Вакцины — исключение | От одного блистера для клиентов с покупками от 100 000 руб. с начала года |

Контрольная точка Дня 7:

• прогноз передан клиенту;
• способ доставки согласован;
• заказ виден логисту;
• ОСГ и температурный режим проверены.

ДЕНЬ 14 — ОФОРМИТЬ ОТГРУЗКУ И ЗАКРЫТЬ ПОСТАВКУ

• оформить реализацию и счёт-фактуру;
• через 1–2 дня после доставки подтвердить получение;
• проверить отсутствие боя и расхождений;
• контролировать оплату и возврат оригиналов.

Контрольная точка Дня 14:

• реализация оформлена;
• клиент подтвердил получение;
• срок оплаты контролируется;
• возврат оригиналов поставлен на контроль.`
      }
    ],
    questions: [
      {
        id: "sales-question-demo-1",
        question: "Где смотреть задачи и историю по клиенту?",
        answer:
          "В CRM фиксируются клиент, история взаимодействий и следующий шаг; в Битрикс24 — внутренние задачи и согласования.",
        status: "answered",
        createdAt: "2026-07-20T15:00:00Z",
        answeredAt: "2026-07-20T16:00:00Z"
      }
    ]
  };
}

export const demoOnboarding = getDemoOnboarding;

export const demoEmployees: EmployeeLeaderboardRow[] = [
  {
    rank: 1,
    profileId: "10000000-0000-4000-8000-000000000004",
    fullName: "Ирина Белова",
    position: "Ведущий технолог",
    departmentName: "Производство",
    score: 4860,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 2,
    profileId: DEMO_PROFILE_IDS.admin,
    fullName: "Елена Соколова",
    position: "HR-директор",
    departmentName: "HR и развитие",
    score: 4120,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 3,
    profileId: "10000000-0000-4000-8000-000000000005",
    fullName: "Сергей Волков",
    position: "Инженер по качеству",
    departmentName: "Контроль качества",
    score: 3890,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 4,
    profileId: DEMO_PROFILE_IDS.manager,
    fullName: "Михаил Орлов",
    position: "Начальник отдела контроля качества",
    departmentName: "Контроль качества",
    score: 3280,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 5,
    profileId: "10000000-0000-4000-8000-000000000006",
    fullName: "Ольга Миронова",
    position: "Микробиолог",
    departmentName: "Лаборатория",
    score: 2470,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 6,
    profileId: DEMO_PROFILE_IDS.employee,
    fullName: "Анна Крылова",
    position: "Менеджер по продажам",
    departmentName: "Продажи и маркетинг",
    score: 1840,
    avatarUrl: null,
    isCurrentUser: true
  },
  {
    rank: 7,
    profileId: "10000000-0000-4000-8000-000000000007",
    fullName: "Дмитрий Фомин",
    position: "Оператор линии",
    departmentName: "Производство",
    score: 1710,
    avatarUrl: null,
    isCurrentUser: false
  },
  {
    rank: 8,
    profileId: "10000000-0000-4000-8000-000000000008",
    fullName: "Наталья Лебедева",
    position: "Специалист по логистике",
    departmentName: "Логистика и склад",
    score: 1530,
    avatarUrl: null,
    isCurrentUser: false
  }
];

export const demoDepartments: DepartmentLeaderboardRow[] = [
  {
    rank: 1,
    departmentId: "30000000-0000-4000-8000-000000000001",
    departmentName: "Производство",
    score: 18_620,
    membersCount: 46
  },
  {
    rank: 2,
    departmentId: "30000000-0000-4000-8000-000000000002",
    departmentName: "Контроль качества",
    score: 15_470,
    membersCount: 18
  },
  {
    rank: 3,
    departmentId: "30000000-0000-4000-8000-000000000003",
    departmentName: "Продажи и маркетинг",
    score: 12_940,
    membersCount: 16
  },
  {
    rank: 4,
    departmentId: "30000000-0000-4000-8000-000000000004",
    departmentName: "Лаборатория",
    score: 10_720,
    membersCount: 14
  },
  {
    rank: 5,
    departmentId: "30000000-0000-4000-8000-000000000005",
    departmentName: "Логистика и склад",
    score: 8_430,
    membersCount: 12
  }
];

export function getDemoLeaderboards(profileId: string): LeaderboardsData {
  return {
    employees: demoEmployees.map((employee) => ({
      ...employee,
      isCurrentUser: employee.profileId === profileId
    })),
    departments: demoDepartments,
    periodLabel: "Июль 2026"
  };
}

export const demoLeaderboards = getDemoLeaderboards;

export const demoProducts: ShopProduct[] = [
  {
    id: "71000000-0000-4000-8000-000000000101",
    title: "Футболка «Бионит»",
    description: "Фирменная футболка из плотного хлопка с логотипом компании.",
    price: 500,
    stock: 42,
    kind: "polo",
    variants: [
      { id: "71100000-0000-4000-8000-000000000101", title: "S", stock: 8 },
      { id: "71100000-0000-4000-8000-000000000102", title: "M", stock: 12 },
      { id: "71100000-0000-4000-8000-000000000103", title: "L", stock: 12 },
      { id: "71100000-0000-4000-8000-000000000104", title: "XL", stock: 10 }
    ],
    featured: true
  },
  {
    id: "71000000-0000-4000-8000-000000000102",
    title: "Толстовка",
    description: "Тёплая фирменная толстовка для команды и корпоративных мероприятий.",
    price: 1000,
    stock: 24,
    kind: "sweatshirt",
    variants: [
      { id: "71100000-0000-4000-8000-000000000105", title: "S", stock: 4 },
      { id: "71100000-0000-4000-8000-000000000106", title: "M", stock: 7 },
      { id: "71100000-0000-4000-8000-000000000107", title: "L", stock: 8 },
      { id: "71100000-0000-4000-8000-000000000108", title: "XL", stock: 5 }
    ],
    featured: true
  },
  {
    id: "71000000-0000-4000-8000-000000000103",
    title: "Шоппер",
    description: "Хлопковая сумка с фирменным паттерном и прочными ручками.",
    price: 350,
    stock: 58,
    kind: "tote",
    variants: [
      { id: "71100000-0000-4000-8000-000000000109", title: "Белый", stock: 30 },
      { id: "71100000-0000-4000-8000-000000000110", title: "Красный", stock: 28 }
    ],
    featured: false
  },
  {
    id: "71000000-0000-4000-8000-000000000104",
    title: "Термокружка",
    description: "Металлическая термокружка с крышкой и фирменным знаком.",
    price: 300,
    stock: 36,
    kind: "thermos",
    variants: [
      { id: "71100000-0000-4000-8000-000000000111", title: "Красная", stock: 18 },
      { id: "71100000-0000-4000-8000-000000000112", title: "Чёрная", stock: 18 }
    ],
    featured: true
  },
  {
    id: "71000000-0000-4000-8000-000000000105",
    title: "Рюкзак",
    description: "Вместительный городской рюкзак для ноутбука и рабочих вещей.",
    price: 1500,
    stock: 15,
    kind: "tote",
    variants: [
      { id: "71100000-0000-4000-8000-000000000113", title: "Чёрный", stock: 9 },
      { id: "71100000-0000-4000-8000-000000000114", title: "Красный", stock: 6 }
    ],
    featured: true
  },
  {
    id: "71000000-0000-4000-8000-000000000106",
    title: "Power Bank",
    description: "Компактный внешний аккумулятор для телефона и рабочих поездок.",
    price: 700,
    stock: 28,
    kind: "notebook",
    variants: [
      { id: "71100000-0000-4000-8000-000000000115", title: "10 000 мА·ч", stock: 28 }
    ],
    featured: false
  },
  {
    id: "71000000-0000-4000-8000-000000000107",
    title: "Стикеры «Силуэты»",
    description: "Набор фирменных стикеров с силуэтами животных из айдентики Бионит.",
    price: 80,
    stock: 120,
    kind: "pins",
    variants: [
      { id: "71100000-0000-4000-8000-000000000116", title: "Набор, 12 шт.", stock: 120 }
    ],
    featured: false
  },
  {
    id: "71000000-0000-4000-8000-000000000108",
    title: "Блокнот с ручкой",
    description: "Фирменный блокнот на пружине и ручка для рабочих заметок.",
    price: 200,
    stock: 64,
    kind: "notebook",
    variants: [
      { id: "71100000-0000-4000-8000-000000000117", title: "Красный", stock: 32 },
      { id: "71100000-0000-4000-8000-000000000118", title: "Белый", stock: 32 }
    ],
    featured: false
  }
];

const demoRecentOrders: ShopOrder[] = [
  {
    id: "72000000-0000-4000-8000-000000000101",
    number: "BN-2026-0716",
    productTitle: "Стикеры «Силуэты»",
    variantTitle: "Набор, 12 шт.",
    quantity: 1,
    total: 80,
    status: "issued",
    createdAt: "2026-07-16T11:20:00Z"
  },
  {
    id: "72000000-0000-4000-8000-000000000102",
    number: "BN-2026-0705",
    productTitle: "Термокружка",
    variantTitle: "Красная",
    quantity: 1,
    total: 300,
    status: "ready",
    createdAt: "2026-07-05T12:10:00Z"
  }
];

export function getDemoShop(profileId: string): ShopData {
  return {
    balance: getDemoProfile(profileId).balance,
    products: demoProducts,
    recentOrders: demoRecentOrders
  };
}

export const demoShop = getDemoShop;

export function getDemoDashboard(profileId: string): DashboardData {
  const profile = getDemoProfile(profileId);
  const earnedBadges = demoBadges.filter((badge) => !badge.locked);

  return {
    profile,
    stats: {
      onboardingPercent: 30,
      learningPercent: 33,
      companyRank:
        demoEmployees.find((employee) => employee.profileId === profile.id)?.rank ?? 6,
      badgeCount: earnedBadges.length
    },
    activeOnboarding: {
      assignmentId: "sales-onboarding-assignment-demo",
      title: "Менеджер по продажам: индивидуальный план",
      currentStage: "Welcome-тренинг",
      completedTasks: 3,
      totalTasks: 10,
      dueDate: "2026-11-14"
    },
    recommendedClass: demoLearningCatalog[0] ?? null,
    latestBadge:
      earnedBadges
        .slice()
        .sort((left, right) =>
          (right.earnedAt ?? "").localeCompare(left.earnedAt ?? "")
        )[0] ?? null,
    weeklyEarned: 300
  };
}

export const demoDashboard = getDemoDashboard;

const demoAdminOrders: ShopOrder[] = [
  {
    id: "72000000-0000-4000-8000-000000000201",
    number: "BN-2026-0720",
    productTitle: "Футболка «Бионит»",
    variantTitle: "M",
    quantity: 1,
    total: 500,
    status: "new",
    createdAt: "2026-07-20T10:10:00Z",
    employeeName: "Анна Крылова"
  },
  {
    id: "72000000-0000-4000-8000-000000000202",
    number: "BN-2026-0719",
    productTitle: "Блокнот с ручкой",
    variantTitle: "Красный",
    quantity: 2,
    total: 400,
    status: "approved",
    createdAt: "2026-07-19T14:40:00Z",
    employeeName: "Дмитрий Фомин"
  },
  {
    id: "72000000-0000-4000-8000-000000000203",
    number: "BN-2026-0718",
    productTitle: "Толстовка",
    variantTitle: "L",
    quantity: 1,
    total: 1000,
    status: "assembling",
    createdAt: "2026-07-18T09:15:00Z",
    employeeName: "Ольга Миронова"
  }
];

export function getDemoAdminDashboard(): AdminDashboardData {
  return {
    metrics: {
      newOrders: 1,
      activeEmployees: 130,
      onboardingInProgress: 8,
      learningPassRate: 87
    },
    orders: demoAdminOrders,
    employees: [
      {
        id: DEMO_PROFILE_IDS.employee,
        employeeNumber: "1001",
        fullName: "Анна Крылова",
        departmentName: "Продажи и маркетинг",
        position: "Менеджер по продажам",
        role: "employee",
        status: "active",
        authLinked: true
      },
      {
        id: DEMO_PROFILE_IDS.manager,
        employeeNumber: "1002",
        fullName: "Михаил Орлов",
        departmentName: "Контроль качества",
        position: "Начальник отдела контроля качества",
        role: "manager",
        status: "active",
        authLinked: true
      },
      {
        id: DEMO_PROFILE_IDS.admin,
        employeeNumber: "1003",
        fullName: "Елена Соколова",
        departmentName: "HR и развитие",
        position: "HR-директор",
        role: "admin",
        status: "active",
        authLinked: true
      }
    ],
    departments: [
      { id: "30000000-0000-4000-8000-000000000001", name: "Производство" },
      { id: "30000000-0000-4000-8000-000000000002", name: "Контроль качества" },
      { id: "30000000-0000-4000-8000-000000000003", name: "Продажи и маркетинг" },
      { id: "30000000-0000-4000-8000-000000000004", name: "Лаборатория" },
      { id: "30000000-0000-4000-8000-000000000005", name: "Логистика и склад" }
    ]
  };
}

export const demoAdminDashboard = getDemoAdminDashboard;

export function isDemoAdminRole(role: UserRole): boolean {
  return role === "hr" || role === "admin";
}

export function demoExportTables(): Record<string, Array<Record<string, unknown>>> {
  const admin = getDemoAdminDashboard();

  return {
    profiles: Object.values(profiles).map((profile) => ({ ...profile })),
    badges: demoBadges.map((badge) => ({ ...badge })),
    bionic_transactions: demoTransactions.map((transaction) => ({
      ...transaction
    })),
    learning_classes: demoLearningCatalog.map((course) => ({ ...course })),
    onboarding_stages: getDemoOnboarding().stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      description: stage.description,
      sortOrder: stage.sortOrder,
      status: stage.status
    })),
    onboarding_tasks: getDemoOnboarding().stages.flatMap((stage) =>
      stage.tasks.map((task) => ({ stageId: stage.id, ...task }))
    ),
    knowledge_articles: getDemoOnboarding().knowledge.map((article) => ({
      ...article
    })),
    shop_products: demoProducts.map((product) => ({
      ...product,
      variants: JSON.stringify(product.variants)
    })),
    shop_orders: admin.orders.map((order) => ({ ...order })),
    employees: admin.employees.map((employee) => ({ ...employee }))
  };
}
