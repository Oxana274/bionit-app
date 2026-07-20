# Архитектура «Бионит В Деле»

## Поток авторизации

```text
LoginForm
  │
  ├─ табельный № → 1001@staff.bionit.ru
  ├─ телефон → +79001234567
  │
  ▼
Supabase Auth REST
POST /auth/v1/token?grant_type=password
  │
  ├─ access_token  ─┐
  ├─ refresh_token  ├─ localStorage
  └─ expires_at     ┘
  │
  ▼
POST /api/auth/session
  │ проверка через /auth/v1/user
  ▼
HTTP-only cookie bionit_access_token
  │
  ▼
Server Components / Route Handlers
next/headers → JWT → PostgREST/RPC → RLS
```

Авторизация не зависит от Next.js middleware. `middleware.ts` оставлен пустым и не сопоставляется с рабочими маршрутами.

## Данные

UI не читает таблицы с правильными ответами напрямую. Критичные операции выполняются через `security definer` RPC:

- `get_profile_summary`;
- `get_dashboard`;
- `get_onboarding`;
- `complete_onboarding_task`;
- `ask_onboarding_question`;
- `get_learning_catalog`;
- `get_learning_class`;
- `submit_learning_attempt`;
- `get_leaderboards`;
- `get_badges`;
- `get_shop`;
- `create_shop_order`;
- `get_admin_dashboard`;
- `admin_update_order`;
- `admin_set_user_role`.

RLS остаётся включённым. Сотрудник видит собственные данные и общие опубликованные материалы. HR/admin получают административные операции через функции, которые дополнительно проверяют роль.

## Начисления и списания

Все изменения баланса проходят через `change_bionic_balance` в одной транзакции PostgreSQL. Функция блокирует кошелёк, проверяет достаточность средств, обновляет баланс и создаёт запись в журнале.

Оформление заказа атомарно:

1. блокируется товар или вариант;
2. проверяется остаток;
3. уменьшается остаток;
4. списываются Бионики;
5. создаются заказ и позиция.

При отмене заказа администратором товар возвращается на склад, а Бионики — сотруднику.

## Демо-режим

Если Supabase не настроен или `NEXT_PUBLIC_DEMO_MODE=true`, серверные загрузчики используют `src/lib/data/demo.ts`. Экранные сценарии работают без внешней инфраструктуры. Демо-режим нужен для презентаций и UI-проверки, но не для production.

## Границы безопасности

- anon key допустим в браузере и защищается RLS;
- service role key используется только в `server-only` модуле `src/lib/supabase/admin.ts`;
- правильные ответы тестов не возвращаются клиенту в production;
- access token хранится в localStorage по требованию проекта, а серверная cookie создаётся только после проверки токена;
- административные API повторно проверяют роль на сервере;
- Vercel headers запрещают MIME sniffing, геолокацию, камеру и микрофон, а также индексацию внутреннего приложения.
