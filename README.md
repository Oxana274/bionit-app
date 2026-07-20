# Бионит В Деле

Мобильное веб-приложение для мотивации, онбординга и обучения сотрудников производственной компании «Бионит».

## Что входит в проект

- авторизация по табельному номеру или телефону;
- прямой запрос к Supabase Auth REST API: `/auth/v1/token?grant_type=password`;
- хранение access/refresh-токенов в `localStorage`;
- проверяемая HTTP-only cookie-копия access token для серверных компонентов;
- главная страница с балансом Биоников, прогрессом и рекомендациями;
- онбординг с этапами, заданиями, базой знаний и вопросами наставнику;
- обучение с теорией, тестами, порогом 90% и максимум тремя попытками;
- история достижений компании;
- рейтинг сотрудников и подразделений;
- SVG-бейджи и SVG-иконки без эмодзи;
- магазин фирменного мерча за Бионики;
- админ-панель заказов, сотрудников и прав доступа;
- полная Supabase-схема с RLS, триггерами, RPC и демо-данными;
- адаптивная верстка для ширины от 360 до 1120+ пикселей;
- готовая конфигурация Vercel и PWA manifest.

## Стек

- Next.js 14.2, App Router;
- React 18;
- TypeScript strict;
- Ant Design 5;
- Supabase Auth + PostgreSQL + PostgREST;
- Vercel.

## Быстрый запуск в деморежиме

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

Демо-пользователи:

| Роль | Табельный номер | Пароль |
|---|---:|---|
| Сотрудник | `1001` | `Bionit!2026` |
| Руководитель | `1002` | `Bionit!2026` |
| HR-администратор | `9001` | `Admin!2026` |

В `.env.example` деморежим включён по умолчанию:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

## Подключение Supabase

### 1. Создайте проект Supabase

Сохраните:

- Project URL;
- anon/public key;
- service role key — только для серверной переменной окружения.

### 2. Примените SQL

В Supabase SQL Editor последовательно выполните:

```text
supabase/migrations/0001_schema.sql
supabase/seed.sql
```

Миграция создаёт таблицы, индексы, enum-типы, RLS-политики, триггеры, функции и RPC. Seed добавляет компанию, подразделения, три профиля, онбординг, учебные классы, тесты, бейджи, товары и демонстрационные операции.

### 3. Заполните `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_EMPLOYEE_EMAIL_DOMAIN=staff.bionit.ru
NEXT_PUBLIC_SITE_URL=https://YOUR-PROJECT.vercel.app
NEXT_PUBLIC_DEMO_MODE=false
```

`SUPABASE_SERVICE_ROLE_KEY` нельзя делать публичной переменной и нельзя передавать в браузер.

### 4. Создайте демонстрационные Auth-аккаунты

После применения migration и seed:

```bash
npm run seed:auth
```

Скрипт создаёт или обновляет три пользователя через Supabase Auth Admin API и передаёт `profile_id` в `user_metadata`. Триггер `handle_new_auth_user` связывает `auth.users` с уже созданными бизнес-профилями.

### 5. Настройте Auth URL Configuration

В Supabase откройте **Authentication → URL Configuration**.

`Site URL` должен **в точности совпадать** с production-доменом Vercel, например:

```text
https://bionit-v-dele.vercel.app
```

После подключения собственного домена обновите одновременно:

- Supabase Site URL;
- Vercel `NEXT_PUBLIC_SITE_URL`;
- при необходимости Redirect URLs.

## Архитектура авторизации

В проекте намеренно не используется `@supabase/ssr`.

1. Форма входа преобразует табельный номер в технический email вида `1001@staff.bionit.ru` или использует нормализованный телефон.
2. Браузер отправляет прямой `fetch` в:

```text
POST {SUPABASE_URL}/auth/v1/token?grant_type=password
```

3. Access token, refresh token и время истечения сохраняются в `localStorage`.
4. Браузер отправляет access token в `/api/auth/session`.
5. Route Handler проверяет токен через `/auth/v1/user` и создаёт HTTP-only cookie.
6. Серверные компоненты читают cookie через `next/headers` и вызывают PostgREST/RPC с JWT сотрудника.
7. `middleware.ts` не выполняет авторизационную логику и имеет отключённый matcher.
8. Перед истечением сессии клиент обновляет токены прямым вызовом `/auth/v1/token?grant_type=refresh_token`.

Подробная схема: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Деплой на Vercel

1. Загрузите проект в GitHub/GitLab/Bitbucket.
2. Импортируйте репозиторий в Vercel.
3. Framework Preset: **Next.js**.
4. Build Command: `npm run build`.
5. Добавьте production-переменные из `.env.local`.
6. Установите `NEXT_PUBLIC_DEMO_MODE=false`.
7. Выполните Deploy.
8. Скопируйте production-домен в Supabase Site URL.
9. Повторно задеплойте приложение, если менялся `NEXT_PUBLIC_SITE_URL`.

Подробный чек-лист: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Команды

```bash
npm run dev        # разработка
npm run typecheck  # TypeScript strict
npm run lint       # ESLint / Next.js
npm run build      # production build
npm run check      # typecheck + lint + build
npm run seed:auth  # создание/обновление Supabase Auth-пользователей
npm start          # запуск production build
```

## Основные директории

```text
src/app/                 App Router, страницы и API Route Handlers
src/components/          интерфейс и кастомная SVG-графика
src/lib/data/            серверные загрузчики и демо-данные
src/lib/supabase/        Auth REST, PostgREST, cookie bridge, Admin API
src/providers/           клиентское управление сессией
src/types/               строгие доменные типы
public/brand/             SVG-логотипы и фирменный паттерн
supabase/migrations/      SQL-схема, RLS, триггеры, RPC
supabase/seed.sql         демонстрационные данные
scripts/seed-auth-users.mjs
```

## Проверка готовности

Перед передачей архив прошёл:

```text
npm run typecheck  — успешно
npm run lint       — успешно, без предупреждений
npm run build      — успешно
```

Дополнительно выполнен smoke-test production-сервера: `/login`, создание cookie-сессии, `/home`, `/shop` и API обучения вернули HTTP 200.

## Важные замечания для production

- замените временные пароли после первого входа;
- ограничьте доступ к service role key только server-side средой Vercel;
- не отключайте RLS;
- назначьте хотя бы двух администраторов, чтобы не потерять доступ к управлению;
- настройте резервное копирование Supabase;
- используйте отдельные Supabase-проекты для staging и production;
- зафиксируйте процесс выдачи и отмены заказов: при отмене SQL-функция возвращает Бионики и остаток товара атомарно.

## Лицензирование

Проект подготовлен для внутреннего использования компанией «Бионит». См. [LICENSE.md](LICENSE.md).
