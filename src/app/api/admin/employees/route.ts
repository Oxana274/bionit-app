import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode, publicEnv } from "@/lib/env";
import { adminRest, createAuthUser } from "@/lib/supabase/admin";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import { employeeNumberToEmail, normalizeEmployeeNumber, normalizePhone } from "@/lib/utils/identity";
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

interface CompanyRow { company_id: string }
interface DepartmentRow { id: string; name: string; company_id: string }
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

const roles: UserRole[] = ["employee", "mentor", "manager", "hr", "admin"];

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as CreateEmployeeBody | null;

  try {
    const admin = await assertAdmin(accessToken);
    const employeeNumber = normalizeEmployeeNumber(body?.employeeNumber ?? "");
    const firstName = body?.firstName?.trim() ?? "";
    const lastName = body?.lastName?.trim() ?? "";
    const position = body?.position?.trim() ?? "";
    const departmentId = body?.departmentId?.trim() ?? "";
    const role = body?.role ?? "employee";
    const hiredAt = body?.hiredAt?.trim() ?? "";
    const password = body?.password ?? "";
    const phone = body?.phone?.trim() ? normalizePhone(body.phone) : undefined;

    if (!firstName || !lastName || !position || !departmentId || !/^\d{4}-\d{2}-\d{2}$/.test(hiredAt)) {
      return NextResponse.json({ error: "Заполните обязательные поля сотрудника." }, { status: 400 });
    }
    if (!roles.includes(role)) return NextResponse.json({ error: "Некорректная роль." }, { status: 400 });
    if (password.length < 10 || !/(?=.*[A-ZА-Я])(?=.*[a-zа-я])(?=.*\d)/.test(password)) {
      return NextResponse.json({ error: "Пароль должен содержать минимум 10 символов, буквы разного регистра и цифру." }, { status: 400 });
    }

    if (isDemoMode) {
      const employee: AdminEmployeeRow = {
        id: crypto.randomUUID(),
        employeeNumber,
        fullName: `${firstName} ${lastName}`,
        departmentName: "Новое подразделение",
        position,
        role,
        status: "active",
        authLinked: true
      };
      return NextResponse.json({ employee }, { status: 201 });
    }

    const companies = await adminRest<CompanyRow[]>(`profiles?id=eq.${admin.id}&select=company_id&limit=1`, {
      method: "GET"
    });
    const companyId = companies[0]?.company_id;
    if (!companyId) throw new Error("Компания администратора не найдена.");

    const departments = await adminRest<DepartmentRow[]>(
      `departments?id=eq.${encodeURIComponent(departmentId)}&company_id=eq.${encodeURIComponent(companyId)}&status=eq.active&select=id,name,company_id&limit=1`,
      { method: "GET" }
    );
    const department = departments[0];
    if (!department) throw new Error("Подразделение не найдено.");

    const profileId = crypto.randomUUID();
    const email = employeeNumberToEmail(employeeNumber, publicEnv.employeeEmailDomain);
    await createAuthUser({
      email,
      phone,
      password,
      userMetadata: {
        profile_id: profileId,
        company_id: companyId,
        department_id: department.id,
        employee_number: employeeNumber,
        first_name: firstName,
        last_name: lastName,
        position,
        role,
        hired_at: hiredAt
      }
    });

    const rows = await adminRest<ProfileRow[]>(
      `profiles?id=eq.${profileId}&select=id,employee_number,first_name,last_name,position,role,status,auth_user_id,departments(name)&limit=1`,
      { method: "GET" }
    );
    const profile = rows[0];
    if (!profile) throw new Error("Учётная запись создана, но профиль не найден. Проверьте триггер handle_new_auth_user.");

    const employee: AdminEmployeeRow = {
      id: profile.id,
      employeeNumber: profile.employee_number,
      fullName: `${profile.first_name} ${profile.last_name}`,
      departmentName: profile.departments?.name ?? department.name,
      position: profile.position,
      role: profile.role,
      status: profile.status,
      authLinked: Boolean(profile.auth_user_id)
    };
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать сотрудника.";
    return NextResponse.json({ error: message }, { status: message.includes("прав") ? 403 : 400 });
  }
}
