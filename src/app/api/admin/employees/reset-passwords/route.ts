import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode, publicEnv } from "@/lib/env";
import { adminRest } from "@/lib/supabase/admin";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import { employeeNumberToEmail } from "@/lib/utils/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmployeeProfile = {
  id: string;
  auth_user_id: string | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string | null;
  status: string;
};

function createTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%_-";
  const bytes = randomBytes(24);
  let password = "";
  for (let i = 0; i < 20; i++) password += alphabet[bytes[i] % alphabet.length];
  return password;
}

export async function POST(request: Request) {
  const token = getAccessTokenFromCookies();
  if (!token) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  try {
    const admin = await assertAdmin(token);
    if (isDemoMode) {
      return NextResponse.json({ error: "Операция недоступна в демо-режиме." }, { status: 409 });
    }

    const body = await request.json() as { profileIds?: unknown };
    if (!Array.isArray(body.profileIds) || body.profileIds.length < 1 || body.profileIds.length > 150) {
      return NextResponse.json({ error: "Выберите от 1 до 150 сотрудников." }, { status: 400 });
    }

    const profileIds = [...new Set(body.profileIds.filter((id): id is string =>
      typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ))];

    if (profileIds.length !== body.profileIds.length) {
      return NextResponse.json({ error: "Список сотрудников содержит некорректные или повторяющиеся ID." }, { status: 400 });
    }

    const companyRows = await adminRest.dbRequest<Array<{ company_id: string }>>(
      `profiles?id=eq.${encodeURIComponent(admin.id)}&select=company_id&limit=1`,
      { method: "GET" }
    );
    const companyId = companyRows[0]?.company_id;
    if (!companyId) throw new Error("Не удалось определить компанию администратора.");

    const idFilter = `(${profileIds.join(",")})`;
    const profiles = await adminRest.dbRequest<EmployeeProfile[]>(
      `profiles?id=in.${encodeURIComponent(idFilter)}&company_id=eq.${encodeURIComponent(companyId)}&select=id,auth_user_id,employee_number,first_name,last_name,position,status`,
      { method: "GET" }
    );

    if (profiles.length !== profileIds.length) {
      return NextResponse.json({ error: "Некоторые выбранные профили не найдены в вашей компании. Ничего не изменено." }, { status: 404 });
    }

    const results: Array<{ employeeNumber: string; status: "reset" | "skipped" | "error"; reason?: string }> = [];
    const credentials: Array<{ employeeNumber: string; fullName: string; email: string; temporaryPassword: string }> = [];

    for (const profile of profiles) {
      if (!profile.auth_user_id) {
        results.push({ employeeNumber: profile.employee_number, status: "skipped", reason: "У профиля нет связанной учётной записи Supabase Auth." });
        continue;
      }

      const email = employeeNumberToEmail(profile.employee_number, publicEnv.employeeEmailDomain);
      const password = createTemporaryPassword();

      try {
        await adminRest.updateUser(profile.auth_user_id, { password });
        credentials.push({
          employeeNumber: profile.employee_number,
          fullName: [profile.last_name, profile.first_name].filter(Boolean).join(" "),
          email,
          temporaryPassword: password
        });
        results.push({ employeeNumber: profile.employee_number, status: "reset" });
      } catch (error) {
        results.push({
          employeeNumber: profile.employee_number,
          status: "error",
          reason: error instanceof Error ? error.message : "Не удалось обновить пароль."
        });
      }
    }

    return NextResponse.json({
      summary: {
        total: profiles.length,
        reset: results.filter((item) => item.status === "reset").length,
        skipped: results.filter((item) => item.status === "skipped").length,
        errors: results.filter((item) => item.status === "error").length
      },
      results,
      credentials
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка повторной генерации паролей.";
    console.error("POST /api/admin/employees/reset-passwords:", error);
    return NextResponse.json(
      { error: message },
      { status: /прав|недостаточно/i.test(message) ? 403 : 500 }
    );
  }
}
