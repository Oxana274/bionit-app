
import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode, publicEnv } from "@/lib/env";
import { adminRest } from "@/lib/supabase/admin";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import {
  employeeNumberToEmail,
  normalizeEmployeeNumber,
  normalizePhone,
} from "@/lib/utils/identity";
import type { AdminEmployeeRow, UserRole } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const ALLOWED_ROLES: UserRole[] = [
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

  let createdAuthUserId: string | null = null;

  try {
    // Проверяем роль текущего пользователя.
    const admin = await assertAdmin(accessToken);

    const body = (await request.json()) as CreateEmployeeBody;

    const employeeNumber = normalizeEmployeeNumber(
      body.employeeNumber ?? ""
    );

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const position = body.position?.trim() ?? "";
    const departmentId = body.departmentId?.trim() ?? "";
    const hiredAt = body.hiredAt?.trim() ?? "";
    const password = body.password ?? "";
    const role = body.role ?? "employee";

    let phone: string | undefined;

    if (body.phone?.trim()) {
      phone = normalizePhone(body.phone);
    }

    // Проверяем обязательные поля.
    if (
      !firstName ||
      !lastName ||
      !position ||
      !departmentId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(hiredAt)
    ) {
      return NextResponse.json(
        {
          error:
            "Заполните ФИО, должность, подразделение и дату приёма.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
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

    // Демо-режим не создаёт настоящего пользователя в Supabase.
    if (isDemoMode) {
      const employee: AdminEmployeeRow = {
        id: crypto.randomUUID(),
        employeeNumber,
        fullName: `${firstName} ${lastName}`,
        departmentName: "Демо-подразделение",
        position,
        role,
        status: "active",
        authLinked: true,
      };

      return NextResponse.json({ employee }, { status: 201 });
    }

    // Получаем компанию, к которой относится администратор.
    const companies = await adminRest.dbRequest<CompanyRow[]>(
      `profiles?id=eq.${encodeURIComponent(admin.id)}` +
        "&select=company_id&limit=1",
      { method: "GET" }
    );

    const companyId = companies[0]?.company_id;

    if (!companyId) {
      throw new Error(
        "Компания администратора не найдена в профиле."
      );
    }

    // Проверяем, что подразделение существует и относится к компании.
    const departments = await adminRest.dbRequest<DepartmentRow[]>(
      "departments" +
        `?id=eq.${encodeURIComponent(departmentId)}` +
        `&company_id=eq.${encodeURIComponent(companyId)}` +
        "&status=eq.active&select=id,name,company_id&limit=1",
      { method: "GET" }
    );

    const department = departments[0];

    if (!department) {
      throw new Error(
        "Подразделение не найдено или неактивно."
      );
    }

    // Проверяем уникальность табельного номера.
    const existingProfiles = await adminRest.dbRequest<
      Array<{ id: string }>
    >(
      "profiles" +
        `?employee_number=eq.${encodeURIComponent(employeeNumber)}` +
        "&select=id&limit=1",
      { method: "GET" }
    );

    if (existingProfiles.length > 0) {
      return NextResponse.json(
        {
          error:
            `Сотрудник с табельным номером ${employeeNumber} уже существует.`,
        },
        { status: 409 }
      );
    }

    // Создаём Auth-пользователя.
    // Триггер handle_new_auth_user создаёт профиль автоматически.
    const email = employeeNumberToEmail(
      employeeNumber,
      publicEnv.employeeEmailDomain
    );

    const authUser = (await adminRest.createUser({
      email,
      password,
      email_confirm: true,
      ...(phone
        ? {
            phone,
            phone_confirm: true,
          }
        : {}),
      user_metadata: {
        profile_id: crypto.randomUUID(),
        company_id: companyId,
        department_id: department.id,
        employee_number: employeeNumber,
        first_name: firstName,
        last_name: lastName,
        position,
        role,
        hired_at: hiredAt,
      },
    })) as CreatedAuthUser;

    createdAuthUserId = authUser.id;

    // Проверяем результат работы триггера.
    const profiles = await adminRest.dbRequest<ProfileRow[]>(
      "profiles" +
        `?auth_user_id=eq.${encodeURIComponent(authUser.id)}` +
        "&select=id,employee_number,first_name,last_name," +
        "position,role,status,auth_user_id,departments(name)&limit=1",
      { method: "GET" }
    );

    const profile = profiles[0];

    if (!profile) {
      throw new Error(
        "Auth-пользователь создан, но профиль не найден. " +
          "Проверьте триггер handle_new_auth_user в Supabase."
      );
    }

    const employee: AdminEmployeeRow = {
      id: profile.id,
      employeeNumber: profile.employee_number,
      fullName: `${profile.first_name} ${profile.last_name}`,
      departmentName: profile.departments?.name ?? department.name,
      position: profile.position,
      role: profile.role,
      status: profile.status,
      authLinked: Boolean(profile.auth_user_id),
    };

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать сотрудника.";

    // Если Auth-пользователь уже создан, но дальнейшая операция
    // завершилась ошибкой, удаляем его для отката.
    if (createdAuthUserId) {
      try {
        await adminRest.deleteUser(createdAuthUserId);
      } catch (rollbackError) {
        console.error(
          "Не удалось удалить Auth-пользователя после ошибки:",
          rollbackError
        );
      }
    }

    console.error("POST /api/admin/employees:", error);

    const status = message.includes("прав")
      ? 403
      : message.includes("уже существует")
        ? 409
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
