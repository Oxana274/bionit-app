
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
  company_id: string;
  department_id: string | null;
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

const PROFILE_SELECT =
  "id,company_id,department_id,employee_number," +
  "first_name,last_name,position,role,status," +
  "auth_user_id,departments(name)";

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();

  if (!accessToken) {
    return errorResponse("Требуется авторизация.", 401);
  }

  let createdAuthUserId: string | null = null;

  try {
    /*
     * 1. Проверяем права до обработки операции создания.
     * Функция должна проверять роль на сервере.
     */
    const admin = await assertAdmin(accessToken);

    if (isDemoMode) {
      return errorResponse(
        "Создание сотрудников недоступно в демо-режиме.",
        409
      );
    }

    /*
     * 2. Проверяем тело запроса.
     */
    let body: CreateEmployeeBody;

    try {
      body = (await request.json()) as CreateEmployeeBody;
    } catch {
      return errorResponse("Некорректное тело запроса.", 400);
    }

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
      try {
        phone = normalizePhone(body.phone);
      } catch {
        return errorResponse(
          "Укажите корректный номер телефона.",
          400
        );
      }
    }

    if (!/^\d+$/.test(employeeNumber)) {
      return errorResponse(
        "Табельный номер должен содержать только цифры.",
        400
      );
    }

    if (
      !firstName ||
      !lastName ||
      !position ||
      !departmentId ||
      !isValidDate(hiredAt)
    ) {
      return errorResponse(
        "Заполните ФИО, должность, подразделение и корректную дату приёма.",
        400
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return errorResponse("Некорректная роль.", 400);
    }

    if (
      password.length < 10 ||
      !/(?=.*[A-ZА-ЯЁ])(?=.*[a-zа-яё])(?=.*\d)/.test(password)
    ) {
      return errorResponse(
        "Пароль должен содержать минимум 10 символов, " +
          "буквы разного регистра и цифру.",
        400
      );
    }

    /*
     * 3. Определяем компанию администратора.
     */
    const companies = await adminRest.dbRequest<CompanyRow[]>(
      `profiles?id=eq.${encodeURIComponent(admin.id)}` +
        "&select=company_id&limit=1",
      { method: "GET" }
    );

    const companyId = companies[0]?.company_id;

    if (!companyId) {
      throw new Error(
        "Не удалось определить компанию администратора."
      );
    }

    /*
     * 4. Проверяем подразделение.
     * Оно должно принадлежать компании и быть активным.
     */
    const departments = await adminRest.dbRequest<DepartmentRow[]>(
      "departments" +
        `?id=eq.${encodeURIComponent(departmentId)}` +
        `&company_id=eq.${encodeURIComponent(companyId)}` +
        "&status=eq.active&select=id,name,company_id&limit=1",
      { method: "GET" }
    );

    const department = departments[0];

    if (!department) {
      return errorResponse(
        "Подразделение не найдено, неактивно или не относится к вашей компании.",
        400
      );
    }

    /*
     * 5. Проверяем табельный номер.
     * Проверка не заменяет ограничения уникальности в БД,
     * поэтому окончательно отсутствие дубликата должен
     * гарантировать сам механизм хранения данных.
     */
    const existingProfiles = await adminRest.dbRequest<
      Array<{ id: string }>
    >(
      "profiles" +
        `?employee_number=eq.${encodeURIComponent(employeeNumber)}` +
        "&select=id&limit=1",
      { method: "GET" }
    );

    if (existingProfiles.length > 0) {
      return errorResponse(
        `Сотрудник с табельным номером ${employeeNumber} уже существует.`,
        409
      );
    }

    /*
     * 6. Создаём Auth-пользователя.
     *
     * В metadata намеренно НЕ передаём role.
     * Триггер handle_new_auth_user создаёт профиль
     * с безопасной ролью employee.
     */
    const email = employeeNumberToEmail(
      employeeNumber,
      publicEnv.employeeEmailDomain
    );

    const requestedProfileId = crypto.randomUUID();

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
        profile_id: requestedProfileId,
        company_id: companyId,
        department_id: department.id,
        employee_number: employeeNumber,
        first_name: firstName,
        last_name: lastName,
        position,
        hired_at: hiredAt,
      },
    })) as CreatedAuthUser;

    createdAuthUserId = authUser.id;

    /*
     * 7. Проверяем профиль, созданный триггером.
     */
    const profiles = await adminRest.dbRequest<ProfileRow[]>(
      "profiles" +
        `?auth_user_id=eq.${encodeURIComponent(authUser.id)}` +
        `&id=eq.${encodeURIComponent(requestedProfileId)}` +
        `&select=${PROFILE_SELECT}&limit=1`,
      { method: "GET" }
    );

    const profile = profiles[0];

    if (!profile) {
      throw new Error(
        "Auth-пользователь создан, но профиль не найден. " +
          "Проверьте триггер handle_new_auth_user."
      );
    }

    /*
     * 8. Проверяем, что профиль заполнен ожидаемыми данными.
     * Не допускаем выдачу успешного результата при несовпадениях.
     */
    const profileMatches =
      profile.auth_user_id === authUser.id &&
      profile.company_id === companyId &&
      profile.department_id === department.id &&
      profile.employee_number === employeeNumber &&
      profile.first_name === firstName &&
      profile.last_name === lastName &&
      profile.position === position &&
      profile.role === "employee" &&
      profile.status === "active";

    if (!profileMatches) {
      throw new Error(
        "Созданный профиль не соответствует данным сотрудника. " +
          "Операция будет отменена."
      );
    }

    /*
     * 9. Назначаем выбранную роль через серверный Admin API.
     * Клиент не может выполнить этот шаг напрямую.
     */
    const updatedProfiles = await adminRest.dbRequest<ProfileRow[]>(
      "profiles" +
        `?id=eq.${encodeURIComponent(profile.id)}` +
        `&auth_user_id=eq.${encodeURIComponent(authUser.id)}` +
        `&company_id=eq.${encodeURIComponent(companyId)}` +
        `&select=${PROFILE_SELECT}`,
      {
        method: "PATCH",
        headers
