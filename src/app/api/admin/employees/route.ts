
import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode, publicEnv } from "@/lib/env";
import {
  adminRest,
  createAuthUser,
  deleteAuthUser,
} from "@/lib/supabase/admin";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import {
  employeeNumberToEmail,
  normalizeEmployeeNumber,
  normalizePhone,
} from "@/lib/utils/identity";
import type { AdminEmployeeRow, UserRole } from "@/types/domain";

interface CreateEmployeeBody {
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  departmentId?: string;
  role?: UserRole;
  hiredAt?: string;
  password?: string;
}

interface CompanyRow {
  company_id: string;
}

interface DepartmentRow {
  id: string;
  name: string;
  company_id: string;
}

interface ProfileRow {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
  role: UserRole;
  status: "active" | "inactive" | "archived";
  auth_user_id: string | null;
  departments: { name: string } | null;
}

interface CreatedAuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

const roles: UserRole[] = [
  "employee",
  "mentor",
  "manager",
  "hr",
  "admin",
];

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | CreateEmployeeBody
    | null;

  let createdAuthUserId: string | null = null;
  let createdProfileId: string | null = null;

  try {
    // Проверяем права по существующему профилю администратора.
    const admin = await assertAdmin(accessToken);

    const employeeNumber = normalizeEmployeeNumber(
      body?.employeeNumber ?? ""
    );
    const firstName = body?.firstName?.trim() ?? "";
    const lastName = body?.lastName?.trim() ?? "";
    const position = body?.position?.trim() ?? "";
    const departmentId = body?.departmentId?.trim() ?? "";
    const role = body?.role ?? "employee";
    const hiredAt = body?.hiredAt?.trim() ?? "";
    const password = body?.password ?? "";

    let phone: string | undefined;

    if (body?.phone?.trim()) {
      try {
        phone = normalizePhone(body.phone);
      } catch {
        return NextResponse.json(
          { error: "Проверьте формат номера телефона." },
          { status: 400 }
        );
      }
    }

    if (
      !firstName ||
      !lastName ||
      !position ||
      !departmentId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(hiredAt)
    ) {
      return NextResponse.json(
        { error: "Заполните обязательные поля сотрудника." },
        { status: 400 }
      );
    }

    // Проверяем, что дата существует, а не только соответствует шаблону.
    const parsedDate = new Date(`${hiredAt}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== hiredAt
    ) {
      return NextResponse.json(
        { error: "Укажите корректную дату приёма на работу." },
        { status: 400 }
      );
    }

    if (!roles.includes(role)) {
      return NextResponse.json(
        { error: "Некорректная роль." },
        { status: 400 }
      );
    }

    if (
      password.length < 10 ||
      !/(?=.*[A-ZА-Я])(?=.*[a-zа-я])(?=.*\d)/.test(password)
    ) {
      return NextResponse.json(
        {
          error:
            "Пароль должен содержать минимум 10 символов, " +
            "буквы разного регистра и цифру.",
        },
        { status: 400 }
      );
    }

    // Демо-режим не создаёт реального пользователя в Supabase.
    if (isDemoMode) {
      const employee: AdminEmployeeRow = {
        id: crypto.randomUUID(),
        employeeNumber,
        fullName: `${firstName} ${lastName}`,
        departmentName: "Новое подразделение",
        position,
        role,
        status: "active",
        authLinked: true,
      };

      return NextResponse.json({ employee }, { status: 201 });
    }

    // ВАЖНО: запросы к таблицам идут через dbRequest,
    // а не через Auth Admin API.
    const companies = await adminRest.dbRequest<CompanyRow[]>(
      `profiles?id=eq.${encodeURIComponent(admin.id)}` +
        "&select=company_id&limit=1",
      { method: "GET" }
    );

    const companyId = companies[0]?.company_id;

    if (!companyId) {
      throw new Error("Компания администратора не найдена.");
    }

    const departments = await adminRest.dbRequest<DepartmentRow[]>(
      "departments?" +
        `id=eq.${encodeURIComponent(departmentId)}` +
        `&company_id=eq.${encodeURIComponent(companyId)}` +
        "&status=eq.active&select=id,name,company_id&limit=1",
      { method: "GET" }
    );

    const department = departments[0];

    if (!department) {
      throw new Error("Подразделение не найдено или неактивно.");
    }

    // Триггер handle_new_auth_user использует этот ID профиля.
    const profileId = crypto.randomUUID();
    const email = employeeNumberToEmail(
      employeeNumber,
      publicEnv.employeeEmailDomain
    );

    const authUser = (await createAuthUser({
      email,
      password,
      email_confirm: true,
      ...(phone ? { phone } : {}),
      user_metadata: {
        profile_id: profileId,
        company_id: companyId,
        department_id: department.id,
        employee_number: employeeNumber,
        first_name: firstName,
        last_name: lastName,
        position,
        role,
        hired_at: hiredAt,
      },
    })) as CreatedAuthUser
