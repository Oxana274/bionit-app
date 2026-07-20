# Отчёт о готовности сборки

Дата финальной проверки: 20 июля 2026 года.

## Проверено

- `npm run typecheck` — успешно, TypeScript strict без ошибок;
- `npm run lint` — успешно, без предупреждений и ошибок;
- `npm run build` — production-сборка Next.js 14 завершена успешно;
- production smoke-test основных пользовательских и административных маршрутов — успешно;
- прямой Auth REST flow, cookie bridge, демо-сценарии онбординга, обучения, магазина и админ-панели — успешно;
- SQL-миграция и seed включены в архив.

## Что намеренно не входит в архив

- `node_modules` — восстанавливается командой `npm ci`;
- `.next` — создаётся командой `npm run build`;
- `.env.local` и любые реальные ключи Supabase;
- локальные файлы Vercel и временные файлы TypeScript.

## Перед production-деплоем

1. Заполнить переменные окружения в Vercel.
2. Установить `NEXT_PUBLIC_DEMO_MODE=false`.
3. Применить `supabase/migrations/0001_schema.sql`, затем `supabase/seed.sql`.
4. Выполнить `npm run seed:auth` с server-only service role key.
5. Установить Supabase Site URL точно равным production-домену Vercel.
