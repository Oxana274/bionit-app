# Раздел «Опросы» для проекта «Бионит В Деле»

Патч добавляет опрос вовлечённости сотрудников без изменения существующей архитектуры Next.js/Supabase. Все пути в архиве совпадают с путями репозитория.

## Установка

1. Сделайте резервную копию или отдельную Git-ветку.
2. Распакуйте архив в корень проекта с заменой файлов.
3. В Supabase SQL Editor выполните:

```sql
supabase/migrations/0004_surveys.sql
```

Миграция рассчитана на запуск после `0001_schema.sql`. Её можно запускать повторно: таблицы, функции, вопросы и демонстрационные ответы обновляются безопасно, а статус уже созданного опроса не сбрасывается.

4. Проверьте проект:

```bash
npm run typecheck
npm run build
```

5. Зафиксируйте изменения:

```bash
git add src supabase/migrations/0004_surveys.sql README-SURVEYS.md
git commit -m "Add employee engagement surveys"
git push origin main
```

## Новые маршруты

- `/surveys` — список опросов;
- `/surveys/[id]` — прохождение опроса;
- `/surveys/[id]/results` — агрегированная аналитика, только роль `admin`;
- `POST /api/surveys/[surveyId]/responses` — отправка ответов;
- `GET/PATCH /api/admin/surveys/current` — получение статуса и открытие/закрытие опроса.

## Данные опроса

Добавлен опрос **«Вовлечённость Q3 2026»**:

- 13 подразделений;
- 5 демографических полей, включая подразделение;
- возраст вводится в текстовом поле с проверкой диапазона 16–100;
- 24 пронумерованных вопроса;
- 3 оценки по шкале 1–5;
- 17 вопросов «Да / Нет»;
- 4 открытых вопроса;
- 30 демонстрационных ответов;
- общее количество сотрудников для расчёта участия — 134.

## Аналитика

RPC `get_survey_results` возвращает:

- средний балл eNPS по формуле из ТЗ;
- долю положительных ответов Q20 в диапазоне 0–1 и её процентное представление;
- количество опрошенных и долю участия;
- показатели по каждому подразделению;
- процент ответов «Да» по Q4–Q20;
- фильтры по подразделению, категории сотрудника и стажу.

Результаты защищены дважды:

- серверные загрузчики допускают только профиль с ролью `admin`;
- RPC-функции Supabase используют `assert_admin()` и RLS.

## Демо-режим

При `NEXT_PUBLIC_DEMO_MODE=true` опрос, 30 ответов и аналитика загружаются из `src/lib/data/demo.ts`. Кнопка управления опросом находится в админ-панели. Состояние демо-переключателя хранится в памяти процесса; постоянное хранение статуса обеспечивает Supabase в production-режиме.

## Состав патча

```text
src/app/(workspace)/surveys/page.tsx
src/app/(workspace)/surveys/[id]/page.tsx
src/app/(workspace)/surveys/[id]/results/page.tsx
src/app/api/surveys/[surveyId]/responses/route.ts
src/app/api/admin/surveys/current/route.ts
src/components/SurveyCard.tsx
src/components/SurveyForm.tsx
src/components/SurveyResults.tsx
src/components/surveys.module.css
src/components/AdminView.tsx
src/components/MoreView.tsx
src/components/WorkspaceShell.tsx
src/lib/data/demo.ts
src/lib/data/loaders.ts
src/types/domain.ts
supabase/migrations/0004_surveys.sql
```

## Примечание к нумерации ТЗ

Во вводной строке ТЗ указано 17 вопросов, но далее перечислены вопросы Q1–Q24, включая 17 вопросов «Да / Нет» Q4–Q20. Реализованы все явно перечисленные вопросы Q1–Q24 и все демографические поля.
