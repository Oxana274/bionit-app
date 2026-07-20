import type {
  AchievementStory,
  AdminDashboardData,
  BadgeSummary,
  DashboardData,
  DepartmentRank,
  EmployeeRank,
  LeaderboardsData,
  LearningClassCard,
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

export const demoLearningCatalog: LearningClassCard[] = [
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
          {
            id: 'sales-task-progress-101',
            title: 'Пройти Welcome-тренинг',
            description: 'Узнать историю Бионит, миссию «От фермы до дома», продукт, клиентов и маршрут адаптации.',
            points: 50,
            dueDate: '2026-07-20',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T09:00:00Z'
          },
          {
            id: 'sales-task-progress-102',
            title: 'Представить Бионит за 30 секунд',
            description: 'Подготовить короткое объяснение: кто мы, что производим, кому помогаем и в чём ваша роль.',
            points: 30,
            dueDate: '2026-07-21',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T12:30:00Z'
          },
          {
            id: 'sales-task-progress-103',
            title: 'Сверить карту поддержки',
            description: 'Зафиксировать контакты руководителя, наставника, HR, IT и правило эскалации вопроса.',
            points: 30,
            dueDate: '2026-07-21',
            status: 'completed',
            required: true,
            completedAt: '2026-07-20T14:00:00Z'
          },
          {
            id: 'sales-task-progress-104',
            title: 'Проверить рабочие доступы',
            description: 'Проверить вход в Битрикс24, почту, CRM, 1С и папку с шаблонами; недостающие доступы передать наставнику и IT.',
            points: 40,
            dueDate: '2026-07-22',
            status: 'in_progress',
            required: true,
            completedAt: null
          },
          {
            id: 'sales-task-progress-105',
            title: 'Разобрать правила задач, сроков и рисков',
            description: 'На мини-кейсе зафиксировать результат, срок, критерий качества и заранее сообщить о риске, причине и нужной помощи.',
            points: 40,
            dueDate: '2026-07-24',
            status: 'not_started',
            required: true,
            completedAt: null
          },
          {
            id: 'sales-task-progress-106',
            title: 'Согласовать личный план первых 14 дней',
            description: 'Определить контрольные точки на дни 1, 3, 7 и 14, первые клиентские задачи и дату обратной связи с руководителем.',
            points: 60,
            dueDate: '2026-07-26',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: '52000000-0000-4000-8000-000000000102',
        title: 'Продуктовая база',
        description: '14 дней на освоение продуктовых направлений, клиентов, инструкций и правил корректной продуктовой коммуникации.',
        sortOrder: 2,
        status: 'not_started',
        tasks: [
          {
            id: 'sales-task-progress-107',
            title: 'Освоить продуктовый минимум менеджера',
            description: 'Изучить ключевые продуктовые группы, целевые виды животных, источники подтверждённой информации и порядок передачи медицинских вопросов эксперту.',
            points: 120,
            dueDate: '2026-08-09',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: '52000000-0000-4000-8000-000000000103',
        title: 'Работа с клиентами',
        description: '30 дней практики: CRM, клиентские контакты, коммерческие предложения, договорённости и контроль следующих шагов.',
        sortOrder: 3,
        status: 'not_started',
        tasks: [
          {
            id: 'sales-task-progress-108',
            title: 'Провести первые клиентские контакты и заполнить CRM',
            description: 'Под контролем наставника провести первые контакты, зафиксировать договорённости, следующий шаг, срок и историю взаимодействия в CRM.',
            points: 150,
            dueDate: '2026-09-08',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: '52000000-0000-4000-8000-000000000104',
        title: 'План адаптации',
        description: '60 дней самостоятельной работы по согласованным KPI, воронке, территории, марже и дебиторской задолженности.',
        sortOrder: 4,
        status: 'not_started',
        tasks: [
          {
            id: 'sales-task-progress-109',
            title: 'Защитить 60-дневный план продаж',
            description: 'Представить план по клиентской базе, территории, воронке, выручке, марже и дебиторской задолженности; согласовать контрольные точки.',
            points: 200,
            dueDate: '2026-11-07',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      },
      {
        id: '52000000-0000-4000-8000-000000000105',
        title: 'Финиш',
        description: '7 дней на подведение итогов, обратную связь, фиксацию результатов и плана дальнейшего развития.',
        sortOrder: 5,
        status: 'not_started',
        tasks: [
          {
            id: 'sales-task-progress-110',
            title: 'Подвести итоги адаптации',
            description: 'Обсудить результаты с руководителем и наставником, получить обратную связь и зафиксировать план развития после онбординга.',
            points: 250,
            dueDate: '2026-11-14',
            status: 'not_started',
            required: true,
            completedAt: null
          }
        ]
      }
    ],
    knowledge: [
      {
        id: '54000000-0000-4000-8000-000000000101',
        title: 'Бионит: компания, продукт и клиенты',
        summary: 'История компании, продуктовые направления и ценность для клиента.',
        category: 'Продажи · Компания',
        readMinutes: 7,
        body: `Бионит начал работу во Владимире в 1991 году и за 35 лет прошёл путь от небольшой лаборатории до современного производителя ветеринарных лекарств и вакцин.

Что производит компания
• более 30 наименований ветеринарных лекарственных средств;
• вакцины для птиц и кроликов;
• общеукрепляющие, гинекологические и противомаститные препараты;
• гормональные, противопаразитарные и антибактериальные средства;
• дезинфектанты и мази.

Кому помогает продукт
Крупному и мелкому рогатому скоту, свиньям, птице, кроликам и городским питомцам через партнёрский контур.

Роль менеджера по продажам
Помочь специалисту ветеринарии и владельцу хозяйства выбрать подтверждённое решение, обеспечить предсказуемую коммуникацию и довести договорённость до результата. Медицинские вопросы вне своей компетенции необходимо передавать продуктовому эксперту.`
      },
      {
        id: '54000000-0000-4000-8000-000000000102',
        title: 'Правила игры: задачи, сроки и риски',
        summary: 'Как работать прозрачно и не допускать скрытых проблем.',
        category: 'Продажи · Правила',
        readMinutes: 6,
        body: `В Бионит ценятся прозрачность, аккуратность и ответственность за результат. Любая рабочая задача должна быть понятна, зафиксирована, выполнена в срок и проверена по критерию качества.

До начала задачи уточните
1. Какой результат нужен?
2. К какому сроку?
3. По какому критерию результат будет принят?
4. Какие ресурсы, данные и согласования доступны?

Если срок или результат под угрозой
Предупредите заранее и назовите четыре вещи: риск, причину, нужную помощь и новый реалистичный срок. Не скрывайте риски, связанные с качеством, безопасностью, конфиденциальностью или обязательствами перед клиентом.

Для менеджера по продажам CRM является рабочей памятью: фиксируйте клиента, статус, договорённость, следующий шаг, ответственного и срок сразу после контакта.`
      },
      {
        id: '54000000-0000-4000-8000-000000000103',
        title: 'Карта поддержки и рабочие системы',
        summary: 'К кому обращаться и где находятся задачи, клиенты и документы.',
        category: 'Продажи · Поддержка',
        readMinutes: 6,
        body: `Карта поддержки
• руководитель — приоритеты, задачи и решения;
• наставник — первые действия и рабочие нюансы;
• HR — адаптация и вопросы по процессу;
• IT — техника, учётные записи и доступы;
• охрана / АХО — пропуск, вход и бытовые вопросы;
• продуктовый эксперт — вопросы по препаратам и подтверждённым данным.

Рабочие системы
• Битрикс24 — задачи, внутренняя коммуникация и согласования;
• почта — официальные письма и внешняя коммуникация;
• CRM — клиенты, статусы, история взаимодействий и следующие шаги;
• 1С — учётные и операционные процессы;
• корпоративная папка — коммерческие предложения, презентации и утверждённые шаблоны.

Если ответ блокирует работу и его нет в согласованный срок, используйте маршрут эскалации: повторите вопрос с контекстом и обратитесь к следующему ответственному. Вопрос без ответа — это риск, а не повод молчать.`
      },
      {
        id: '54000000-0000-4000-8000-000000000104',
        title: 'Первые 14 дней: контрольные точки',
        summary: 'План входа в роль без хаоса и первая обратная связь.',
        category: 'Продажи · План',
        readMinutes: 5,
        body: `День 1
Оформление, Welcome-тренинг, доступы, знакомство с руководителем и наставником.

День 3
Понятна роль менеджера, основные правила, клиентские процессы, точки контакта и первые задачи.

День 7
Выполнены первые рабочие действия, доступны CRM и шаблоны, сформулированы вопросы по продукту и клиентам.

День 14
Есть согласованный план на испытательный срок, первые зафиксированные результаты и обратная связь руководителя.

Личный чек-лист
• получены доступы и контакты поддержки;
• понятны основные продукты и типы клиентов;
• известно, где фиксируются задачи, сроки и клиентская история;
• заполнен план первых 14 дней;
• назначена встреча обратной связи.

В конце второй недели обсудите с руководителем, что уже получается, где остаются вопросы и какая поддержка нужна дальше.`
      }
    ],
    questions: [
      {
        id: 'sales-question-demo-1',
        question: 'Где смотреть задачи и историю по клиенту?',
        answer: 'Задачи и договорённости фиксируются в CRM и Битрикс24. Точный рабочий процесс и обязательные поля согласуйте с руководителем в первую неделю.',
        status: 'answered',
        createdAt: '2026-07-20T15:00:00Z',
        answeredAt: '2026-07-20T16:00:00Z'
      }
    ]
  };
}

// Совместимость с существующим загрузчиком loadOnboarding().
export const demoOnboarding = getDemoOnboarding;

export const demoEmployees: EmployeeRank[] = [
  { rank: 1, profileId: DEMO_PROFILE_IDS.admin, fullName: 'Елена Соколова', position: 'HR-директор', departmentName: 'HR и развитие', score: 920, avatarUrl: null, isCurrentUser: false },
  { rank: 2, profileId: DEMO_PROFILE_IDS.manager, fullName: 'Михаил Орлов', position: 'Начальник отдела контроля качества', departmentName: 'Контроль качества', score: 780, avatarUrl: null, isCurrentUser: false },
  { rank: 3, profileId: DEMO_PROFILE_IDS.employee, fullName: 'Анна Крылова', position: 'Менеджер по продажам', departmentName: 'Продажи и маркетинг', score: 690, avatarUrl: null, isCurrentUser: true },
  { rank: 4, profileId: '10000000-0000-4000-8000-000000000004', fullName: 'Олег Власов', position: 'Мастер смены', departmentName: 'Производство', score: 610, avatarUrl: null, isCurrentUser: false },
  { rank: 5, profileId: '10000000-0000-4000-8000-000000000005', fullName: 'Мария Лебедева', position: 'Специалист по продукту', departmentName: 'Продажи и маркетинг', score: 560, avatarUrl: null, isCurrentUser: false }
];

export const demoDepartments: DepartmentRank[] = [
  { rank: 1, departmentId: '21000000-0000-4000-8000-000000000002', departmentName: 'Контроль качества', score: 4280, membersCount: 18 },
  { rank: 2, departmentId: '21000000-0000-4000-8000-000000000001', departmentName: 'Производство', score: 3960, membersCount: 62 },
  { rank: 3, departmentId: '21000000-0000-4000-8000-000000000003', departmentName: 'HR и развитие', score: 2120, membersCount: 8 },
  { rank: 4, departmentId: '21000000-0000-4000-8000-000000000005', departmentName: 'Продажи и маркетинг', score: 1910, membersCount: 24 },
  { rank: 5, departmentId: '21000000-0000-4000-8000-000000000004', departmentName: 'Исследования и разработки', score: 1740, membersCount: 18 }
];

export function demoLeaderboards(profileId: string): LeaderboardsData {
  return {
    employees: demoEmployees.map((employee) => ({ ...employee, isCurrentUser: employee.profileId === profileId })),
    departments: demoDepartments,
    periodLabel: 'Июль 2026'
  };
}

export const demoProducts: ShopProduct[] = [
  { id: '91000000-0000-4000-8000-000000000001', title: 'Поло Бионит', description: 'Красное или белое поло с вышитым логотипом.', price: 900, stock: 26, kind: 'polo', featured: true, variants: [
    { id: 'variant-polo-s', title: 'Красное · S', stock: 6 },
    { id: 'variant-polo-m', title: 'Красное · M', stock: 8 },
    { id: 'variant-polo-l', title: 'Красное · L', stock: 7 },
    { id: 'variant-polo-white-m', title: 'Белое · M', stock: 5 }
  ] },
  { id: '91000000-0000-4000-8000-000000000002', title: 'Свитшот «В деле»', description: 'Тёплый фирменный свитшот для команды.', price: 1200, stock: 19, kind: 'sweatshirt', featured: true, variants: [
    { id: 'variant-sweat-m', title: 'Графит · M', stock: 5 },
    { id: 'variant-sweat-l', title: 'Графит · L', stock: 6 },
    { id: 'variant-sweat-red-m', title: 'Красный · M', stock: 4 },
    { id: 'variant-sweat-red-l', title: 'Красный · L', stock: 4 }
  ] },
  { id: '91000000-0000-4000-8000-000000000003', title: 'Термос', description: 'Стальной термос с монохромным логотипом.', price: 650, stock: 24, kind: 'thermos', featured: false, variants: [] },
  { id: '91000000-0000-4000-8000-000000000004', title: 'Сумка «Несём здоровье»', description: 'Хлопковая сумка с фирменным паттерном.', price: 420, stock: 32, kind: 'tote', featured: false, variants: [] },
  { id: '91000000-0000-4000-8000-000000000005', title: 'Блокнот', description: 'Красный блокнот с капсульным паттерном.', price: 280, stock: 40, kind: 'notebook', featured: false, variants: [] },
  { id: '91000000-0000-4000-8000-000000000006', title: 'Набор пинов', description: 'Три фирменных пина для бейджа или сумки.', price: 100, stock: 49, kind: 'pins', featured: false, variants: [] }
];

const demoOrder: ShopOrder = { id: '93000000-0000-4000-8000-000000000001', number: 'BD-2026-01001', productTitle: 'Набор пинов', variantTitle: null, quantity: 1, total: 100, status: 'approved', createdAt: '2026-07-19T10:00:00Z' };

export function demoShop(profileId: string): ShopData {
  return { balance: demoProfile(profileId).balance, products: demoProducts, recentOrders: [demoOrder] };
}

export function demoDashboard(profileId: string): DashboardData {
  const profile = demoProfile(profileId);
  return {
    profile,
    stats: { onboardingPercent: 30, learningPercent: 48, companyRank: profileId === DEMO_PROFILE_IDS.admin ? 1 : profileId === DEMO_PROFILE_IDS.manager ? 2 : 3, badgeCount: 4 },
    activeOnboarding: profileId === DEMO_PROFILE_IDS.employee ? { assignmentId: 'sales-onboarding-assignment-demo', title: 'Менеджер по продажам: индивидуальный план', currentStage: 'Welcome-тренинг', completedTasks: 3, totalTasks: 10, dueDate: '2026-11-14' } : null,
    recommendedClass: demoLearningCatalog[1] ?? null,
    latestBadge: demoBadges.find((badge) => !badge.locked) ?? null,
    weeklyEarned: 370
  };
}

export function demoAdminDashboard(): AdminDashboardData {
  return {
    metrics: { newOrders: 3, activeEmployees: 130, onboardingInProgress: 7, learningPassRate: 93 },
    orders: [
      { ...demoOrder, employeeName: 'Анна Крылова' },
      { id: 'order-2', number: 'BD-2026-01002', productTitle: 'Термос', variantTitle: null, quantity: 1, total: 650, status: 'new', createdAt: '2026-07-20T08:30:00Z', employeeName: 'Михаил Орлов' },
      { id: 'order-3', number: 'BD-2026-01003', productTitle: 'Поло Бионит', variantTitle: 'Красное · M', quantity: 1, total: 900, status: 'assembling', createdAt: '2026-07-19T14:10:00Z', employeeName: 'Мария Лебедева' }
    ],
    employees: Object.values(profiles).map((profile, index) => ({
      id: profile.id,
      employeeNumber: index === 0 ? '1001' : index === 1 ? '1002' : '9001',
      fullName: profile.fullName,
      departmentName: profile.departmentName,
      position: profile.position,
      role: profile.role,
      status: 'active',
      authLinked: true
    })),
    departments: [
      { id: '21000000-0000-4000-8000-000000000001', name: 'Производство' },
      { id: '21000000-0000-4000-8000-000000000002', name: 'Контроль качества' },
      { id: '21000000-0000-4000-8000-000000000003', name: 'HR и развитие' },
      { id: '21000000-0000-4000-8000-000000000004', name: 'Исследования и разработки' },
      { id: '21000000-0000-4000-8000-000000000005', name: 'Продажи и маркетинг' }
    ]
  };
}

export function isDemoAdminRole(role: UserRole): boolean {
  return role === 'hr' || role === 'admin';
}

export function demoExportTables(): Record<string, Array<Record<string, unknown>>> {
  const admin = demoAdminDashboard();
  const onboarding = demoOnboarding();
  const tables: Record<string, Array<Record<string, unknown>>> = {
    companies: [{ id: '20000000-0000-4000-8000-000000000001', name: 'Бионит', founded_year: 1991, employee_count_hint: 130, status: 'active' }],
    departments: admin.departments.map((row) => ({ ...row, company_id: '20000000-0000-4000-8000-000000000001', status: 'active' })),
    profiles: admin.employees.map((row) => ({ id: row.id, employee_number: row.employeeNumber, full_name: row.fullName, department_name: row.departmentName, position: row.position, role: row.role, status: row.status, auth_linked: row.authLinked })),
    wallets: Object.values(profiles).map((profile) => ({ profile_id: profile.id, balance: profile.balance })),
    bionic_transactions: [],
    onboarding_templates: [{ id: '51000000-0000-4000-8000-000000000101', title: onboarding.title, duration_days: 118, is_default: false }],
    onboarding_stages: onboarding.stages.map((stage) => ({ id: stage.id, title: stage.title, description: stage.description, sort_order: stage.sortOrder })),
    onboarding_tasks: onboarding.stages.flatMap((stage) => stage.tasks.map((task) => ({ id: task.id, stage_id: stage.id, title: task.title, description: task.description, points: task.points, required: task.required }))),
    onboarding_assignments: [{ id: onboarding.assignmentId, profile_id: DEMO_PROFILE_IDS.employee, template_id: '51000000-0000-4000-8000-000000000101', start_date: onboarding.startDate, due_date: onboarding.dueDate, status: 'in_progress' }],
    onboarding_task_progress: onboarding.stages.flatMap((stage) => stage.tasks.map((task) => ({ id: task.id, assignment_id: onboarding.assignmentId, status: task.status, due_date: task.dueDate, completed_at: task.completedAt }))),
    knowledge_articles: onboarding.knowledge.map((article) => ({ ...article })),
    onboarding_questions: onboarding.questions.map((question) => ({ ...question })),
    learning_classes: demoLearningCatalog.map((course) => ({ ...course })),
    learning_modules: demoLearningCatalog.flatMap((course) =>
      (demoLearningDetail(course.id)?.modules ?? []).map((module) => ({
        ...module,
        class_id: course.id
      }))
    ),
    learning_questions: demoLearningCatalog.flatMap((course) =>
      (demoLearningDetail(course.id)?.questions ?? []).map((question) => ({
        id: question.id,
        class_id: course.id,
        prompt: question.prompt,
        sort_order: question.sortOrder
      }))
    ),
    learning_options: demoLearningCatalog.flatMap((course) =>
      (demoLearningDetail(course.id)?.questions ?? []).flatMap((question) =>
        question.options.map((option) => ({ ...option, question_id: question.id }))
      )
    ),
    learning_enrollments: demoLearningCatalog.map((course) => ({ profile_id: DEMO_PROFILE_IDS.employee, class_id: course.id, status: course.status, progress_percent: course.progressPercent, attempts_used: course.attemptsUsed })),
    learning_module_progress: [],
    learning_attempts: [],
    learning_attempt_answers: [],
    badges: demoBadges.map((badge) => ({ ...badge })),
    profile_badges: demoBadges.filter((badge) => !badge.locked).map((badge) => ({ badge_id: badge.id, profile_id: DEMO_PROFILE_IDS.employee, earned_at: badge.earnedAt })),
    profile_badge_progress: demoBadges.map((badge) => ({ badge_id: badge.id, profile_id: DEMO_PROFILE_IDS.employee, progress_percent: badge.progressPercent })),
    achievement_stories: demoAchievementStories.map((story) => ({ ...story })),
    shop_products: demoProducts.map(({ id, title, description, price, stock, kind, featured }) => ({ id, title, description, price, stock, kind, featured })),
    shop_product_variants: demoProducts.flatMap((product) => product.variants.map((variant) => ({ ...variant, product_id: product.id }))),
    shop_orders: admin.orders.map((order) => ({ ...order })),
    shop_order_items: admin.orders.map((order) => ({ order_id: order.id, product_title: order.productTitle, variant_title: order.variantTitle, quantity: order.quantity, total: order.total }))
  };
  return tables;
}
// Алиасы для совместимости с loaders.ts и API-роутами
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
  
  if (questionIds.length === 0) {
    throw new Error('Класс не найден или не содержит вопросов.');
  }

  const answeredIds = Object.keys(answers);
  const missing = questionIds.filter((id) => !answeredIds.includes(id));
  if (missing.length > 0) {
    throw new Error('Ответьте на все вопросы теста.');
  }

  let correct = 0;
  for (const questionId of questionIds) {
    if (answers[questionId] === correctAnswers[questionId]) {
      correct++;
    }
  }

  const score = Math.round((correct / questionIds.length) * 100);
  const passed = score >= 90;

  return {
    attemptId: `demo-attempt-${Date.now()}`,
    score,
    passed,
    attemptsUsed: passed ? 1 : 2,
    attemptsLeft: passed ? 2 : 1,
    rewardGranted: passed ? 150 : 0
  };
}
