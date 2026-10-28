
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

function getErrorStatus(message: string): number {
  if (/уже существует|duplicate key|23505/i.test(message)) {
    return 409;
  }

  if (/прав|авторизац|недостаточно доступа/i.test(message)) {
    return 403;
  }

  if (/не найден|неактивно|не относится/i.test(message)) {
    return 400;
  }

  return 500;
}

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();

  if (!accessToken) {
    return errorResponse("Требуется авторизация.", 401);
  }

  let createdAuthUserId: string | null = null;
  let createdProfileId: string | null = null;

  try {
    // 1. Проверяем административные права на сервере.
    const admin = await assertAdmin(accessToken);

    if (isDemoMode) {
      return errorResponse(
        "Создание сотрудников недоступно в демо-режиме.",
        409
      );
    }

    // 2. Читаем и проверяем входные данные.
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

    // 3. Определяем компанию администратора.
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

    // 4. Проверяем активное подразделение этой компании.
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

    // 5. Проверяем отсутствие дубликата табельного номера.
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

    // 6. Создаём Auth-пользователя.
    // Роль в user_metadata намеренно не передаём.
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

    // 7. Проверяем профиль, созданный триггером.
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

    createdProfileId = profile.id;

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
        "Созданный профиль не соответствует данным сотрудника."
      );
    }

    // 8. Назначаем выбранную роль серверным административным запросом.
    const updatedProfiles = await adminRest.dbRequest<ProfileRow[]>(
      "profiles" +
        `?id=eq.${encodeURIComponent(profile.id)}` +
        `&auth_user_id=eq.${encodeURIComponent(authUser.id)}` +
        `&company_id=eq.${encodeURIComponent(companyId)}` +
        `&select=${PROFILE_SELECT}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          role,
        }),
      }
    );

    const updatedProfile = updatedProfiles[0];

    if (
      !updatedProfile ||
      updatedProfile.auth_user_id !== authUser.id ||
      updatedProfile.company_id !== companyId ||
      updatedProfile.role !== role ||
      updatedProfile.status !== "active"
    ) {
      throw new Error(
        "Не удалось подтвердить назначение роли сотруднику."
      );
    }

    // 9. Формируем результат для интерфейса.
    const employee: AdminEmployeeRow = {
      id: updatedProfile.id,
      employeeNumber: updatedProfile.employee_number,
      fullName:
        `${updatedProfile.first_name} ${updatedProfile.last_name}`,
      departmentName:
        updatedProfile.departments?.name ?? department.name,
      position: updatedProfile.position,
      role: updatedProfile.role,
      status: updatedProfile.status,
      authLinked: Boolean(updatedProfile.auth_user_id),
    };

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать сотрудника.";

    console.error("POST /api/admin/employees:", error);

    // 10. Откат: удаляем профиль, затем Auth-пользователя.
    // Если откат не удался, записываем ошибку в серверный лог.
    if (createdProfileId) {
      try {
        await adminRest.dbRequest(
          "profiles" +
            `?id=eq.${encodeURIComponent(createdProfileId)}` +
            `&auth_user_id=eq.${encodeURIComponent(createdAuthUserId ?? "")}`,
          { method: "DELETE" }
        );
      } catch (rollbackError) {
        console.error(
          "Не удалось удалить профиль после ошибки:",
          rollbackError
        );
      }
    }

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

    return errorResponse(message, getErrorStatus(message));
  }
}
