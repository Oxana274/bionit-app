# Supabase: порядок подготовки

## Чистый проект

1. Откройте SQL Editor.
2. Запустите `supabase/migrations/0001_schema.sql` целиком.
3. Убедитесь, что транзакция завершилась без ошибок.
4. Запустите `supabase/seed.sql`.
5. Локально задайте service role key и выполните `npm run seed:auth`.

## Повторный запуск

Миграция рассчитана на чистую базу. Для локальной разработки рекомендуется Supabase CLI и `supabase db reset`. Не запускайте начальную миграцию повторно поверх production-базы.

Новые изменения схемы добавляйте отдельными нумерованными файлами:

```text
supabase/migrations/0002_feature_name.sql
supabase/migrations/0003_another_change.sql
```

## Технический email для табельного номера

Supabase password grant принимает email или phone. Для входа по табельному номеру приложение строит технический email:

```text
{employee_number}@{NEXT_PUBLIC_EMPLOYEE_EMAIL_DOMAIN}
```

Пример:

```text
1001@staff.bionit.ru
```

Пользователь не должен вводить этот email — преобразование выполняется в браузере.

## Добавление сотрудника через админ-панель

Route Handler:

1. проверяет JWT и роль HR/admin;
2. проверяет подразделение в компании администратора;
3. генерирует бизнес `profile_id`;
4. создаёт пользователя через Auth Admin API;
5. передаёт данные профиля в `user_metadata`;
6. триггер `handle_new_auth_user` создаёт и связывает профиль;
7. API возвращает безопасное представление сотрудника без пароля.
