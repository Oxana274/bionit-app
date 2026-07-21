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
    title: "Курс А: Охрана труда",
    description: "Обязательный вводный курс: риски, СИЗ и действия при происшествиях.",
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
    id: "61000000-0000-4000-8000-000000000201",
    title: "Welcome-тренинг: Блок 1",
    description:
      "Компания Бионит, миссия, ключевые факты, продуктовые направления и GMP.",
    category: "Онбординг",
    durationMinutes: 25,
    reward: 50,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 1,
    progressPercent: 100,
    status: "passed",
    modulesCount: 3,
    coverKind: "leadership"
  },
  {
    id: "61000000-0000-4000-8000-000000000202",
    title: "Welcome-тренинг: Блок 2",
    description:
      "Миомаг, Азитромицин Бионит и вакцины против Ньюкаслской болезни.",
    category: "Онбординг",
    durationMinutes: 45,
    reward: 100,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 60,
    status: "in_progress",
    modulesCount: 3,
    coverKind: "product"
  },
  {
    id: "61000000-0000-4000-8000-000000000206",
    title: "Welcome-тренинг: финальный тест",
    description:
      "Итоговая проверка знаний по компании, продуктам, продажам и правилам работы.",
    category: "Онбординг",
    durationMinutes: 60,
    reward: 300,
    passThreshold: 90,
    maxAttempts: 3,
    attemptsUsed: 0,
    progressPercent: 0,
    status: "not_started",
    modulesCount: 3,
    coverKind: "quality"
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
  options: string[];
  correctIndex: number;
};

type DemoLearningContent = {
  longDescription: string;
  modules: Array<{ title: string; content: string }>;
  questions: DemoLearningQuestion[];
};

const learningContent: Record<string, DemoLearningContent> = {
  "61000000-0000-4000-8000-000000000101": {
    longDescription:
      "Вводный курс по охране труда для сотрудников производственной компании. Материал охватывает основные опасности, применение СИЗ и порядок действий при происшествиях.",
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
      "Курс знакомит с базовыми принципами GMP: личной гигиеной, предотвращением контаминации, документированием операций и реакцией на отклонения.",
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
      "Курс по электробезопасности объясняет правила допуска к электрооборудованию, безопасное отключение и действия при поражении электрическим током.",
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
  "61000000-0000-4000-8000-000000000201": {
    longDescription:
      "Тест по Блоку 1 проверяет знание истории Бионит, миссии «От фермы до дома», масштаба компании и стандарта производства.",
    modules: [
      {
        title: "История и масштаб Бионит",
        content:
          "ГК «Бионит» основана в 1991 году. За 35 лет компания выросла от лаборатории до современного GMP-завода площадью 3 000 м², где работает более 130 сотрудников."
      },
      {
        title: "Миссия «От фермы до дома»",
        content:
          "Миссия связывает здоровье животных, устойчивость хозяйств и качество жизни людей. Задача компании — создавать доступные и качественные ветеринарные препараты."
      },
      {
        title: "Продукты и география",
        content:
          "Бионит производит более 30 наименований ветеринарных препаратов и поставляет продукцию в 89 регионов России и 10 стран мира."
      }
    ],
    questions: [
      {
        prompt: "В каком году основана ГК «Бионит»?",
        options: ["1985", "1991", "2001", "2010"],
        correctIndex: 1
      },
      {
        prompt: "Сколько регионов России охватывают поставки Бионит?",
        options: ["50", "70", "89", "100"],
        correctIndex: 2
      },
      {
        prompt: "Как называется миссия компании?",
        options: [
          "От фермы до дома",
          "Здоровье животных — здоровье людей",
          "Качество превыше всего",
          "Лидерство в ветеринарии"
        ],
        correctIndex: 0
      },
      {
        prompt: "Сколько сотрудников работает в компании?",
        options: ["50", "80", "130+", "200+"],
        correctIndex: 2
      },
      {
        prompt: "По каким стандартам Бионит производит продукцию?",
        options: ["ISO 9001", "GMP", "HACCP", "ОСТ"],
        correctIndex: 1
      }
    ]
  },
  "61000000-0000-4000-8000-000000000202": {
    longDescription:
      "Тест по Блоку 2 проверяет знание механизма и экономики Миомага, свойств Азитромицина Бионит и преимуществ вакцин против Ньюкаслской болезни.",
    modules: [
      {
        title: "Миомаг",
        content:
          "Миомаг действует напрямую на гладкую мускулатуру, обеспечивает сокращения до 90 минут и стоит 63 рубля за профилактический курс на одну корову."
      },
      {
        title: "Азитромицин Бионит",
        content:
          "Азитромицин накапливается в очаге инфекции в концентрации до 6 раз выше, сохраняет постантибиотический эффект до 72 часов; срок ожидания по мясу — 40 суток."
      },
      {
        title: "Вакцины против Ньюкаслской болезни",
        content:
          "Бионит производит живые сухие вакцины «Владивак-Ла-Сота» и штамм «Н». Штамм «Н» формирует иммунитет до 12 месяцев."
      }
    ],
    questions: [
      {
        prompt: "Как Миомаг воздействует на гладкую мускулатуру?",
        options: [
          "Через рецепторы окситоцина",
          "Напрямую, минуя рецепторы, заблокированные стрессом",
          "Через эндогенный окситоцин",
          "Через пропранолол"
        ],
        correctIndex: 1
      },
      {
        prompt:
          "Сколько минут могут длиться сокращения матки после введения Миомага?",
        options: ["20 минут", "90 минут", "60 минут", "120 минут"],
        correctIndex: 1
      },
      {
        prompt:
          "Сколько процентов эндометритов было в группе Миомага в исследовании КФХ Сулейманова?",
        options: ["28%", "0%", "32%", "15%"],
        correctIndex: 1
      },
      {
        prompt: "Сколько стоит курс профилактики Миомагом на одну корову?",
        options: ["112,5 руб.", "109,8 руб.", "63 руб.", "200 руб."],
        correctIndex: 2
      },
      {
        prompt:
          "Во сколько раз концентрация азитромицина в очаге инфекции выше, чем в здоровых тканях?",
        options: ["В 2 раза", "В 3 раза", "В 6 раз", "В 10 раз"],
        correctIndex: 2
      },
      {
        prompt: "Какой срок ожидания по мясу для Азитромицина Бионит?",
        options: ["20 суток", "30 суток", "40 суток", "60 суток"],
        correctIndex: 2
      },
      {
        prompt:
          "Какая вакцина против Ньюкаслской болезни сохраняет иммунитет до 12 месяцев?",
        options: ["Штамм «Ла-Сота»", "Штамм «Н»", "Оба штамма", "Ни один"],
        correctIndex: 1
      }
    ]
  },
  "61000000-0000-4000-8000-000000000206": {
    longDescription:
      "Финальный тест состоит из 15 вопросов по компании, продуктам, стандартной воронке продаж и правилам работы.",
    modules: [
      {
        title: "Компания и продукты",
        content:
          "Повторите ключевые факты о Бионит, механизм действия, экономику и доказательную базу Миомага."
      },
      {
        title: "Азитромицин и вакцины",
        content:
          "Повторите свойства Азитромицина Бионит, сроки ожидания и особенности вакцин против Ньюкаслской болезни."
      },
      {
        title: "Продажи и правила работы",
        content:
          "Повторите семь этапов продажи, критерии SMART, правила постановки задач и безопасной работы."
      }
    ],
    questions: [
      {
        prompt: "Что такое Миомаг?",
        options: ["Антибиотик", "Утеротоник", "Вакцина", "Дезинфектант"],
        correctIndex: 1
      },
      {
        prompt: "Как Миомаг воздействует на мускулатуру?",
        options: [
          "Напрямую, минуя рецепторы",
          "Через окситоцин",
          "Через пропранолол",
          "Через простагландины"
        ],
        correctIndex: 0
      },
      {
        prompt: "Сколько минут длятся сокращения после применения Миомага?",
        options: ["20", "90", "60", "120"],
        correctIndex: 1
      },
      {
        prompt: "Сколько стоит курс Миомага?",
        options: ["112,5 руб.", "109,8 руб.", "63 руб.", "200 руб."],
        correctIndex: 2
      },
      {
        prompt:
          "Какая стельность после первого осеменения была в группе Миомага в исследовании?",
        options: ["56%", "36%", "48%", "70%"],
        correctIndex: 0
      },
      {
        prompt: "Сколько эндометритов было в группе Миомага?",
        options: ["0%", "28%", "32%", "15%"],
        correctIndex: 0
      },
      {
        prompt: "Какое действующее вещество в Азитромицине Бионит?",
        options: ["Эритромицин", "Азитромицин", "Тилозин", "Пенициллин"],
        correctIndex: 1
      },
      {
        prompt:
          "Во сколько раз концентрация азитромицина выше в очаге инфекции?",
        options: ["В 2 раза", "В 3 раза", "В 6 раз", "В 10 раз"],
        correctIndex: 2
      },
      {
        prompt: "Какой постантибиотический эффект у Азитромицина Бионит?",
        options: ["24 часа", "48 часов", "72 часа", "96 часов"],
        correctIndex: 2
      },
      {
        prompt: "Какой срок ожидания по мясу для Азитромицина Бионит?",
        options: ["20 суток", "30 суток", "40 суток", "60 суток"],
        correctIndex: 2
      },
      {
        prompt: "Какая вакцина даёт иммунитет до 12 месяцев?",
        options: ["«Ла-Сота»", "Штамм «Н»", "Обе", "Ни одна"],
        correctIndex: 1
      },
      {
        prompt: "Сколько регионов России охватывают поставки Бионит?",
        options: ["50", "70", "89", "100"],
        correctIndex: 2
      },
      {
        prompt:
          "Что из перечисленного является гигиеническим фактором по Герцбергу?",
        options: ["Признание", "Ответственность", "Условия труда", "Рост мастерства"],
        correctIndex: 2
      },
      {
        prompt: "Какой главный критерий SMART?",
        options: [
          "Сложность",
          "Конкретность, измеримость, достижимость, актуальность и ограниченность во времени",
          "Срочность",
          "Связь с GMP"
        ],
        correctIndex: 1
      },
      {
        prompt: "Сколько этапов продажи в стандартной воронке?",
        options: ["5", "7", "8", "10"],
        correctIndex: 1
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
    throw new Error(`Курс ${classId} не найден.`);
  }

  const content = learningContent[classId];

  if (!content) {
    throw new Error(`Материалы Курса ${classId} не найдены.`);
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
    throw new Error("Курс не найден.");
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
    title: "Welcome-тренинг менеджера по продажам",
    mentorName: "Валерий Распопов",
    mentorPosition: "Заместитель генерального директора по продажам",
    startDate: "2026-07-20",
    dueDate: "2026-11-21",
    progressPercent: 30,
    stages: [
      {
        id: "52000000-0000-4000-8000-000000000101",
        title: "Добро пожаловать в Бионит!",
        description:
          "Блок 1 · 7 дней: история компании, миссия, ключевые факты, продукты и первый тест.",
        sortOrder: 1,
        status: "completed",
        tasks: [
          {
            id: "welcome-b1-history",
            title: "Посмотреть приветствие и изучить историю Бионит",
            description:
              "Познакомиться с историей компании с 1991 года, масштабом производства и ролью менеджера по продажам.",
            points: 30,
            dueDate: "2026-07-20",
            status: "completed",
            required: true,
            completedAt: "2026-07-20T09:00:00Z"
          },
          {
            id: "welcome-b1-mission",
            title: "Сформулировать смысл миссии «От фермы до дома»",
            description:
              "Написать одним предложением, как здоровье животных связано с устойчивостью хозяйств и качеством жизни людей.",
            points: 30,
            dueDate: "2026-07-21",
            status: "completed",
            required: true,
            completedAt: "2026-07-20T12:00:00Z"
          },
          {
            id: "welcome-b1-facts",
            title: "Запомнить ключевые факты и производственные цифры",
            description:
              "Год основания, численность команды, площадь GMP-завода, география поставок и годовые объёмы производства.",
            points: 40,
            dueDate: "2026-07-22",
            status: "completed",
            required: true,
            completedAt: "2026-07-21T08:30:00Z"
          },
          {
            id: "welcome-b1-pitch",
            title: "Подготовить рассказ о Бионит за 30 секунд",
            description:
              "Коротко объяснить, кто мы, что производим, кому помогаем и почему клиент может нам доверять.",
            points: 50,
            dueDate: "2026-07-24",
            status: "completed",
            required: true,
            completedAt: "2026-07-21T11:00:00Z"
          },
          {
            id: "welcome-b1-test",
            title: "Пройти тест по Блоку 1",
            description:
              "Ответить на 5 вопросов о компании, миссии, географии, команде и стандарте GMP.",
            points: 50,
            dueDate: "2026-07-26",
            status: "completed",
            required: true,
            completedAt: "2026-07-21T13:30:00Z"
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000102",
        title: "Продукты для продаж",
        description:
          "Блок 2 · 14 дней: Миомаг, Азитромицин Бионит, вакцина против Ньюкаслской болезни и экономика для клиента.",
        sortOrder: 2,
        status: "in_progress",
        tasks: [
          {
            id: "welcome-b2-myomag-mechanism",
            title: "Изучить механизм действия и преимущества Миомага",
            description:
              "Понять проблему новотельного периода, действие карбахолина и отличие от окситоцина в условиях стресса.",
            points: 60,
            dueDate: "2026-07-29",
            status: "completed",
            required: true,
            completedAt: "2026-07-22T10:00:00Z"
          },
          {
            id: "welcome-b2-myomag-economics",
            title: "Рассчитать экономику Миомага",
            description:
              "Сопоставить возможные потери клиента с курсом профилактики стоимостью 63 рубля на корову.",
            points: 70,
            dueDate: "2026-08-01",
            status: "completed",
            required: true,
            completedAt: "2026-07-23T10:30:00Z"
          },
          {
            id: "welcome-b2-azithromycin",
            title: "Изучить Азитромицин Бионит",
            description:
              "Разобрать спектр действия, накопление в очаге инфекции, постантибиотический эффект и сроки ожидания.",
            points: 70,
            dueDate: "2026-08-03",
            status: "completed",
            required: true,
            completedAt: "2026-07-24T14:00:00Z"
          },
          {
            id: "welcome-b2-vaccine",
            title: "Изучить вакцины против Ньюкаслской болезни",
            description:
              "Сравнить штаммы «Владивак-Ла-Сота» и «Н», фасовки, преимущества и сроки формирования иммунитета.",
            points: 70,
            dueDate: "2026-08-06",
            status: "in_progress",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b2-test",
            title: "Пройти тест по Блоку 2",
            description:
              "Ответить на 7 вопросов по Миомагу, Азитромицину Бионит и вакцине.",
            points: 100,
            dueDate: "2026-08-09",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000103",
        title: "Инструменты и процессы продаж",
        description:
          "Блок 3 · 30 дней: семь этапов продажи, скрипты, возражения, CRM, Битрикс24 и 1С.",
        sortOrder: 3,
        status: "not_started",
        tasks: [
          {
            id: "welcome-b3-seven-steps",
            title: "Изучить семь этапов продажи",
            description:
              "Сбор информации, контакт, презентация, возражения, поставка, оплата и постпродажное сопровождение.",
            points: 50,
            dueDate: "2026-08-14",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b3-checklist",
            title: "Составить чек-лист по этапам продажи",
            description:
              "Для каждого этапа записать обязательные действия и отправить чек-лист наставнику.",
            points: 80,
            dueDate: "2026-08-18",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b3-script",
            title: "Отработать скрипт холодного звонка по Миомагу",
            description:
              "Разыграть разговор с наставником, записать аудио или видео и отправить на проверку.",
            points: 120,
            dueDate: "2026-08-23",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b3-objections",
            title: "Подготовить ответы на четыре ключевых возражения",
            description:
              "Отработать ответы «дорого», «работаем с другим», «нет денег» и «окситоцин привычнее».",
            points: 80,
            dueDate: "2026-08-28",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b3-systems",
            title: "Освоить рабочие системы",
            description:
              "Проверить работу корпоративной почты, Битрикс24, CRM и 1С и понять назначение каждой системы.",
            points: 60,
            dueDate: "2026-09-02",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b3-mini-test",
            title: "Пройти мини-тест по Блоку 3",
            description:
              "Проверить знание этапов продажи, роли сбора информации и назначения Битрикс24.",
            points: 70,
            dueDate: "2026-09-08",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000104",
        title: "Правила игры и поддержка",
        description:
          "Блок 4 · 60 дней: правила постановки задач, работа с рисками, карта поддержки и эскалация.",
        sortOrder: 4,
        status: "not_started",
        tasks: [
          {
            id: "welcome-b4-rules",
            title: "Зафиксировать четыре правила работы",
            description:
              "Письменная постановка задачи, раннее предупреждение, открытость о рисках и своевременные вопросы.",
            points: 50,
            dueDate: "2026-09-15",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b4-case",
            title: "Решить мини-кейс по неполной задаче",
            description:
              "Сформулировать три уточняющих вопроса о результате, сроке и критерии качества до начала работы.",
            points: 70,
            dueDate: "2026-09-22",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b4-support-map",
            title: "Сверить карту поддержки",
            description:
              "Понять, по каким вопросам обращаться к руководителю, наставнику, HR, IT и отделу кадров.",
            points: 60,
            dueDate: "2026-10-10",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b4-escalation",
            title: "Отработать правило эскалации",
            description:
              "Если ответа нет 2 часа, поднять вопрос на следующий уровень и передать контекст, риск и срочность.",
            points: 100,
            dueDate: "2026-11-07",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000105",
        title: "План первых 14 дней",
        description:
          "Блок 5 · 7 дней: контрольные точки Дня 1, 3, 7 и 14 и критерии успеха на испытательном сроке.",
        sortOrder: 5,
        status: "not_started",
        tasks: [
          {
            id: "welcome-b5-plan",
            title: "Заполнить шаблон «План 14 дней»",
            description:
              "Определить действия, ожидаемые результаты и вопросы на День 1, День 3, День 7 и День 14.",
            points: 100,
            dueDate: "2026-11-10",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b5-approve",
            title: "Согласовать план с руководителем",
            description:
              "Обсудить приоритеты, критерии результата, ресурсы и регулярность контрольных встреч.",
            points: 100,
            dueDate: "2026-11-12",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b5-success",
            title: "Провести самопроверку по критериям успеха",
            description:
              "Оценить активность, знание продукта, работу в CRM и качество коммуникации.",
            points: 80,
            dueDate: "2026-11-14",
            status: "not_started",
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: "52000000-0000-4000-8000-000000000106",
        title: "Закрытие и обратная связь",
        description:
          "Блок 6 · 7 дней: финальные действия, тест из 15 вопросов, обратная связь и встреча с наставником.",
        sortOrder: 6,
        status: "not_started",
        tasks: [
          {
            id: "welcome-b6-three-actions",
            title: "Выполнить три действия после тренинга",
            description:
              "Проверить план 14 дней и доступы, затем сформулировать рассказ о компании за 30 секунд.",
            points: 60,
            dueDate: "2026-11-16",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b6-final-test",
            title: "Пройти финальный тест",
            description:
              "Ответить на 15 вопросов по компании, продуктам, этапам продажи и правилам работы.",
            points: 200,
            dueDate: "2026-11-18",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b6-feedback",
            title: "Заполнить анкету обратной связи",
            description:
              "Оценить тренинг от 1 до 10, отметить самое полезное и предложить улучшения.",
            points: 50,
            dueDate: "2026-11-20",
            status: "not_started",
            required: true,
            completedAt: null
          },
          {
            id: "welcome-b6-mentor-meeting",
            title: "Провести закрывающую встречу с наставником",
            description:
              "Обсудить результаты, вопросы, первые рабочие шаги и зону дальнейшего развития.",
            points: 120,
            dueDate: "2026-11-21",
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
        title: "О компании Бионит",
        summary:
          "История компании, миссия «От фермы до дома», ключевые факты, продуктовые направления и масштабы производства.",
        category: "Welcome · Компания",
        readMinutes: 8,
        body: `БЛОК 1. ДОБРО ПОЖАЛОВАТЬ В БИОНИТ!

Здравствуй, коллега! Мы рады приветствовать тебя в команде «Бионит».

Ты — менеджер по продажам. От качества твоей работы зависит, как наши продукты помогут фермерам, ветеринарным специалистам и владельцам животных по всей стране.

КТО МЫ

ГК «Бионит» основана в 1991 году владимирскими учёными-биологами и фармацевтами. За 35 лет компания прошла путь от небольшой лаборатории до современного GMP-завода площадью 3 000 м².

Сегодня в компании работает более 130 человек. Мы производим ветеринарные препараты по международным стандартам GMP и используем строгую систему контроля качества. Продукцию Бионит знают в 89 регионах России и 10 странах мира.

| Ключевой факт | Значение |
| --- | --- |
| Год основания | 1991 |
| Опыт компании | 35 лет |
| Команда | Более 130 сотрудников |
| Площадь завода | 3 000 м² |
| География | 89 регионов России и 10 стран |
| Стандарт производства | GMP |

НАША МИССИЯ — «ОТ ФЕРМЫ ДО ДОМА»

Мы работаем там, где здоровье животных влияет на качество жизни людей, устойчивость хозяйств и доверие партнёров.

Наша миссия — создавать доступные и качественные ветеринарные препараты, чтобы жизнь людей и их питомцев была здоровой, а работа фермеров — устойчивой и прибыльной.

КАК ПОНИМАТЬ МИССИЮ

• здоровое животное даёт безопасную продукцию;
• эффективная профилактика снижает потери хозяйства;
• качественный препарат поддерживает работу ветеринарного специалиста;
• устойчивое хозяйство создаёт ценность для людей — от фермы до дома.

НАШИ ПРОДУКТЫ

Бионит производит более 30 наименований ветеринарных препаратов.

| Категория | Основные направления |
| --- | --- |
| Вакцины | Птицы и кролики |
| Антибактериальные препараты | КРС, МРС и свиньи |
| Противопаразитарные препараты | Профилактика и лечение инвазий |
| Гормональные препараты | Репродуктивные задачи |
| Противомаститные препараты | Здоровье молочного стада |
| Дезинфектанты и мази | Гигиена, уход и биобезопасность |
| Тонизирующие препараты | Поддержка общего состояния животных |

ПРОИЗВОДСТВО В ЦИФРАХ

| Направление | Годовой объём |
| --- | --- |
| Инфузионные растворы | Более 2,4 млн литров |
| Растворы антибиотиков | Более 24 тыс. литров |
| Вакцины | Более 360 млн доз |

ЧТО ВАЖНО ДЛЯ МЕНЕДЖЕРА ПО ПРОДАЖАМ

Не перечисляй цифры механически. Связывай каждый факт с выгодой клиента:

• 35 лет на рынке — опыт и устойчивость;
• GMP и контроль качества — предсказуемость продукта;
• широкая география — отработанная логистика;
• собственное производство — стабильность поставок;
• широкий ассортимент — возможность решать разные задачи хозяйства.

ВОПРОС ДЛЯ РАЗМЫШЛЕНИЯ

Почему миссия компании называется «От фермы до дома»? Сформулируй ответ одним предложением и обсуди его с наставником.`
      },
      {
        id: "54000000-0000-4000-8000-000000000102",
        title: "Продукты: Миомаг, Азитромицин, вакцина",
        summary:
          "Три ключевых продукта для продаж: механизм действия, схемы применения, доказательная база и экономика клиента.",
        category: "Welcome · Продукты",
        readMinutes: 18,
        body: `БЛОК 2. ПРОДУКТЫ ДЛЯ ПРОДАЖ

Цель блока — изучить Миомаг, Азитромицин Бионит и вакцины против Ньюкаслской болезни, понять их преимущества, схемы применения и аргументы для клиента.

1. МИОМАГ — РЕШЕНИЕ ДЛЯ НОВОТЕЛЬНОГО ПЕРИОДА КОРОВ

Проблема клиента

Отёл — сильный стресс для коровы. Гормоны стресса могут блокировать действие традиционных утеротоников, включая окситоцин. Последствиями становятся атония матки, эндометриты, смещение сычуга и потеря продуктивности.

Как работает Миомаг

• действующее вещество — карбахолин;
• препарат действует напрямую на гладкую мускулатуру, минуя рецепторы, заблокированные стрессом;
• сокращения могут длиться до 90 минут, тогда как действие окситоцина — около 20 минут;
• магний поддерживает усвоение кальция, иммунитет и нервно-мышечную функцию.

Результат для хозяйства

• быстрое восстановление матки;
• снижение риска эндометритов и метритов;
• сохранение молочной продуктивности;
• готовность к осеменению в оптимальные сроки;
• уменьшение потребности в антибиотиках.

ЭКОНОМИКА МИОМАГА

| Показатель | Значение на одну корову |
| --- | --- |
| Возможная потеря животного | 250–300 тыс. руб. |
| Потери при выбытии | Около 150 тыс. руб. |
| Упущенная прибыль по молоку за 3 лактации | 370 575 руб. |
| Минимальные совокупные потери | 520 575 руб. |
| Стоимость курса Миомага на 3 дня | 63 руб. |
| Стоимость курса окситоцина | 112,5 руб. |
| Стоимость курса Утеротона | 109,8 руб. |

Аргумент для продажи: профилактический курс стоимостью 63 рубля помогает снизить риск потерь, которые могут превышать 500 тыс. рублей на одну корову.

Для стада из 100 коров потенциальная защищаемая сумма составляет примерно:

100 × (520 575 − 63) ≈ 52 млн руб.

СХЕМЫ ПРИМЕНЕНИЯ МИОМАГА

| Цель | Доза | Кратность |
| --- | --- | --- |
| Профилактика всем новотельным | 3 мл/гол. | 1 раз в день, 3 дня подряд |
| Слабые схватки и потуги | 1 мл/гол. | Трёхкратно с интервалом 1–1,5 часа |
| Задержание последа | 1–3 мл/гол. | Через 6–8 часов после отёла, повтор через 48 часов при необходимости |
| Метриты и эндометриты | 1–3 мл/гол. | Трёхкратно с интервалом 48 часов |

ДОКАЗАТЕЛЬНАЯ БАЗА МИОМАГА

Исследование в КФХ А. И. Сулейманова:

• эндометриты — 0% в группе Миомага против 28% в группе Утеротона;
• стельность после первого осеменения — 56% в группе Миомага против 36% в группе Утеротона.

Кейс «Колхоз им. М. А. Гурьянова», 765 коров, 5 месяцев применения:

• 0 случаев смещения сычуга;
• снижение числа послеродовых осложнений;
• сокращение потребности в антибиотиках.

2. АЗИТРОМИЦИН БИОНИТ

Состав: 100 мг азитромицина в 1 мл, прокаина гидрохлорид и кислотный буфер.

Уникальные свойства

1. Накапливается в очаге инфекции: концентрация примерно в 6 раз выше, чем в здоровых тканях.
2. Сохраняет постантибиотический эффект до 72 часов.
3. Работает против грамположительных, грамотрицательных бактерий, микоплазм и хламидий.
4. Кислотный буфер улучшает растворимость и переносимость.
5. Прокаин уменьшает болезненность инъекции и стресс животного.

| Вид животных | Схема применения |
| --- | --- |
| КРС | 5–15 мг/кг, курс 3–5 дней |
| Свиньи | 1 мл на 20 кг массы тела, курс 2–3 дня |

Сроки ожидания

• убой на мясо — не ранее чем через 40 суток после последнего введения;
• молоко нельзя использовать в пищу людям в период лечения.

3. ВАКЦИНЫ ПРОТИВ НЬЮКАСЛСКОЙ БОЛЕЗНИ

Бионит производит две живые сухие вакцины:

| Параметр | «Владивак-Ла-Сота» | Штамм «Н» |
| --- | --- | --- |
| Фасовка | 100, 1 000 и 4 000 доз | 100 доз |
| Тип | Живая сухая вакцина | Живая сухая вакцина |
| Формирование защиты | Быстрый иммунный ответ | Первые линии защиты через 48 часов |
| Длительность иммунитета | До 3 месяцев | До 12 месяцев |
| Ограничения по мясу и яйцу | Нет | Нет |

Преимущества живых вакцин

• дешевле инактивированных — от 62,40 руб. за 1 000 доз без НДС;
• быстро формируют иммунный ответ;
• не создают ограничений по мясу и яйцу;
• допускают гибкие способы введения — через воду, интраназально или по инструкции для конкретного штамма.

КЛЮЧЕВАЯ ЛОГИКА ПРОДАЖИ

Сначала выясни проблему хозяйства, затем свяжи её с механизмом действия продукта, покажи доказательства и только после этого переходи к цене. Клиент покупает не флакон или дозу, а снижение риска, сохранение поголовья и экономический результат.`
      },
      {
        id: "54000000-0000-4000-8000-000000000103",
        title: "Этапы продажи и скрипты",
        summary:
          "Семь этапов стандартной воронки, холодный звонок по Миомагу, работа с возражениями и рабочие системы.",
        category: "Welcome · Продажи",
        readMinutes: 12,
        body: `БЛОК 3. ИНСТРУМЕНТЫ И ПРОЦЕССЫ ПРОДАЖ

СЕМЬ ЭТАПОВ ПРОДАЖИ

| Этап | Что должен сделать менеджер |
| --- | --- |
| 1. Сбор информации | Узнать данные о клиенте, животных, ЛПР, текущих поставщиках и потребностях |
| 2. Установление контакта | Договориться о встрече или содержательных переговорах |
| 3. Презентация | Показать выгоду, использовать кейсы, цифры и доказательства |
| 4. Работа с возражениями | Не спорить, а уточнять причину и переводить разговор в конструктив |
| 5. Поставка | Проконтролировать отгрузку, сроки и документы |
| 6. Оплата | Отследить поступление денег и предупредить просрочку |
| 7. Постпродажное сопровождение | Поддерживать отношения и собирать обратную связь |

ВАЖНО

Сбор информации даёт до 90% успеха. До разговора выясни:

• размер и профиль хозяйства;
• численность животных;
• кто принимает решение;
• какие препараты используются сейчас;
• в чём клиент видит главную проблему;
• как проходит закупка.

СКРИПТ ХОЛОДНОГО ЗВОНКА ПО МИОМАГУ

Приветствие

«Здравствуйте, меня зовут [Имя], я представляю компанию ТД «БиАгро», производителя ветеринарных препаратов. Уделите 2 минуты?»

Крючок

«Мы помогаем хозяйствам снижать потери после отёла. Знаете ли вы, что гормоны стресса блокируют действие окситоцина и до 30% коров могут иметь скрытые эндометриты?»

Диагностический вопрос

«Сколько коров в вашем стаде? Какая ситуация с послеродовыми осложнениями?»

Предложение

«У нас есть препарат Миомаг, который действует напрямую на мускулатуру, минуя стресс. В исследованиях он дал 0% эндометритов и 56% стельности после первого осеменения. Можем прислать расчёт экономии для вашего стада».

РАБОТА С ВОЗРАЖЕНИЯМИ

| Возражение | Ответ |
| --- | --- |
| «Дорого» | «Потери могут превышать 500 тыс. руб. на корову, а курс Миомага стоит 63 руб. Это страховка от значительных убытков» |
| «Работаем с другим поставщиком» | «Предлагаю провести пробу на 10 головах и сравнить результаты» |
| «Нет денег» | «Можем обсудить отсрочку или тестовую партию, чтобы снизить риск решения» |
| «Окситоцин привычнее» | «Окситоцин дешевле за флакон, но для эффекта требуется больший объём, и он не работает в условиях стресса» |

РАБОЧИЕ СИСТЕМЫ

| Система | Для чего используется |
| --- | --- |
| Корпоративная почта | Основная внешняя и внутренняя коммуникация с адреса @bionit.ru |
| Битрикс24 | Задачи, коммуникации, файлы и согласования |
| CRM | Клиенты, сделки, история контактов и следующий шаг |
| 1С | Заказы, отгрузки, оплата и документооборот |

ПРАКТИЧЕСКИЕ ЗАДАНИЯ

1. Составь чек-лист «Что сделать на каждом этапе продажи» и отправь наставнику.
2. Разыграй скрипт по Миомагу с наставником.
3. Запиши аудио или видео разговора и отправь на проверку.
4. Подготовь собственные ответы на ключевые возражения без спора и давления.`
      },
      {
        id: "54000000-0000-4000-8000-000000000104",
        title: "Инструменты и карта поддержки",
        summary:
          "Корпоративные правила, назначение рабочих систем, роли поддержки и правило эскалации через 2 часа.",
        category: "Welcome · Поддержка",
        readMinutes: 8,
        body: `БЛОК 4. ПРАВИЛА ИГРЫ И ПОДДЕРЖКА

КАК МЫ РАБОТАЕМ

1. Задачи фиксируем письменно: указываем срок, ожидаемый результат и критерий качества.
2. Предупреждаем заранее, если понимаем, что не успеваем.
3. Не молчим о рисках, связанных с охраной труда, GMP, NDA и качеством.
4. Задаём вопросы до начала работы: лучше уточнить сейчас, чем переделывать потом.

ЧТО УТОЧНИТЬ В НЕПОЛНОЙ ЗАДАЧЕ

• Какой конкретный результат должен быть получен?
• К какому сроку он нужен?
• По каким критериям будет понятно, что задача выполнена качественно?

РАБОЧИЕ ИНСТРУМЕНТЫ

| Инструмент | Основная задача |
| --- | --- |
| Почта | Переписка с клиентами, подтверждения и документы |
| Битрикс24 | Внутренние задачи, коммуникации и файлы |
| CRM | Клиенты, сделки, история и план следующего контакта |
| 1С | Заказы, отгрузки, оплата и документы |

КАРТА ПОДДЕРЖКИ

| Кто помогает | По каким вопросам обращаться |
| --- | --- |
| Руководитель | Приоритеты, постановка задач, сложные решения и коммерческие риски |
| Наставник | Первые действия, продуктовые вопросы и рабочие нюансы |
| HR | Адаптация, маршрут онбординга и вопросы по процессу |
| IT | Доступы, техника и работоспособность систем |
| Отдел кадров | Пропуск, вход, документы и бытовые организационные вопросы |

ПРАВИЛО ЭСКАЛАЦИИ

Если ответа нет 2 часа — подними вопрос на следующий уровень.

Хорошая эскалация содержит:

• краткое описание ситуации;
• что уже сделано;
• какой результат нужен;
• крайний срок;
• риск для клиента, сделки или процесса;
• скриншот или ссылку на задачу, если это помогает разобраться.

Неправильно: «У меня ничего не работает».

Правильно: «В CRM не открывается карточка клиента. Перезагрузила страницу и проверила сеть. До 15:00 нужно зафиксировать договорённость по заказу; иначе потеряем подтверждённый срок отгрузки. Скриншот приложен».

ГЛАВНЫЙ ПРИНЦИП

Просить помощь — нормально. Важно не скрывать проблему, не ждать до последней минуты и передавать коллегам достаточно контекста для быстрого решения.`
      },
      {
        id: "54000000-0000-4000-8000-000000000105",
        title: "План первых 14 дней",
        summary:
          "Контрольные точки Дня 1, 3, 7 и 14, практический шаблон и критерии успешного прохождения испытательного срока.",
        category: "Welcome · Адаптация",
        readMinutes: 7,
        body: `БЛОК 5. ПЛАН ПЕРВЫХ 14 ДНЕЙ

План помогает не просто «осмотреться», а договориться с руководителем о конкретных результатах первых двух недель.

| Контрольная точка | Ожидаемый результат |
| --- | --- |
| День 1 | Пройдена ориентация, получены доступы, состоялась встреча с наставником |
| День 3 | Понятна роль, базовые правила и ближайшие задачи |
| День 7 | Сотрудник работает в системах и знает основы ключевых продуктов |
| День 14 | Есть первые результаты и понятная зона дальнейшего развития |

ЧТО ВНЕСТИ В ПЛАН

• задача или ожидаемый результат;
• срок;
• критерий качества;
• кто помогает;
• необходимый доступ или ресурс;
• возможный риск;
• дата контрольной встречи.

КРИТЕРИИ УСПЕХА НА ИСПЫТАТЕЛЬНОМ СРОКЕ

1. Активность и вопросы — проявляешь инициативу и не замалчиваешь непонимание.
2. Знание продукта — сдан технический минимум по Миомагу, Азитромицину и вакцине.
3. Работа в CRM и системах — корректно ведёшь задачи, клиентов и договорённости.
4. Качество коммуникации — общаешься уважительно, конкретно и конструктивно.

ШАБЛОН ДЛЯ СОГЛАСОВАНИЯ

| День | Моя задача | Ожидаемый результат | Кто помогает | Статус |
| --- | --- | --- | --- | --- |
| 1 | Получить доступы и пройти ориентацию | Все системы открываются, маршрут понятен | Наставник, IT, HR | Не начато |
| 3 | Согласовать ближайшие задачи | Есть письменный список приоритетов | Руководитель | Не начато |
| 7 | Отработать продуктовый минимум | Могу уверенно представить три продукта | Наставник | Не начато |
| 14 | Показать первые результаты | Есть выполненные задачи и план развития | Руководитель | Не начато |

ЗАДАНИЕ

Скачай или скопируй шаблон, заполни его своими задачами и согласуй с руководителем. После встречи обнови сроки и критерии так, чтобы каждый результат можно было однозначно проверить.`
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
      learningPercent: 43,
      companyRank:
        demoEmployees.find((employee) => employee.profileId === profile.id)?.rank ?? 6,
      badgeCount: earnedBadges.length
    },
    activeOnboarding: {
      assignmentId: "sales-onboarding-assignment-demo",
      title: "Welcome-тренинг менеджера по продажам",
      currentStage: "Продукты для продаж",
      completedTasks: 8,
      totalTasks: 27,
      dueDate: "2026-11-21"
    },
    recommendedClass:
      demoLearningCatalog.find(
        (course) => course.id === "61000000-0000-4000-8000-000000000202"
      ) ?? null,
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
