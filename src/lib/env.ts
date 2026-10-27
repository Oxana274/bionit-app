
import { DEFAULT_EMPLOYEE_EMAIL_DOMAIN } from "@/lib/constants";

/**
 * Убирает завершающие слеши из URL.
 */
function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Публичные настройки приложения.
 *
 * Эти значения доступны клиентскому коду.
 * Секретные ключи здесь хранить нельзя.
 */
export const publicEnv = {
  supabaseUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  ),

  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",

  employeeEmailDomain:
    process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL_DOMAIN ??
    DEFAULT_EMPLOYEE_EMAIL_DOMAIN,

  siteUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? ""
  ),

  demoMode:
    process.env.NEXT_PUBLIC_DEMO_MODE === "true",
} as const;

/**
 * Проверяет наличие публичных настроек Supabase.
 */
export const isSupabaseConfigured =
  publicEnv.supabaseUrl.length > 0 &&
  publicEnv.supabaseAnonKey.length > 0;

/**
 * Демо включается ТОЛЬКО явным флагом.
 *
 * true  — приложение использует демо-режим.
 * false — приложение работает через реальные API и Supabase.
 *
 * Отсутствие настроек Supabase больше не включает демо автоматически.
 */
export const isDemoMode = publicEnv.demoMode;

/**
 * Проверяет конфигурацию перед обращением к Supabase.
 *
 * Вызывайте эту функцию в серверном коде перед запросами,
 * если нужно явно сообщить об ошибке конфигурации.
 */
export function checkSupabaseConfig(): void {
  if (isDemoMode) {
    return;
  }

  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase не настроен. Проверьте переменные " +
        "NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
}

/**
 * Возвращает секретный service role key.
 *
 * Использовать только на сервере.
 * Не добавлять префикс NEXT_PUBLIC_.
 */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY не настроен."
    );
  }

  return key;
}
