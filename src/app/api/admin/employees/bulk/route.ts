import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode, publicEnv } from "@/lib/env";
import { adminRest } from "@/lib/supabase/admin";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import { employeeNumberToEmail, normalizeEmployeeNumber } from "@/lib/utils/identity";
import type { UserRole } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InputEmployee = {
  employeeNumber?: string; firstName?: string; lastName?: string;
  middleName?: string; position?: string; departmentName?: string;
  hiredAt?: string; role?: UserRole;
};
type Department = { id: string; name: string; company_id: string };
type Profile = { id: string; auth_user_id: string | null; employee_number: string; first_name: string; last_name: string; position: string; role: UserRole; status: string };
const allowedRoles: UserRole[] = ["employee", "mentor", "manager", "hr", "admin"];
const norm = (v: string) => v.toLocaleLowerCase("ru-RU").replace(/[«»"']/g, "").replace(/\s+/g, " ").trim();
function temporaryPassword() {
  // 16 символов, криптографически случайный источник; plaintext возвращается только в ответе импорта.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(20);
  let out = "";
  for (let i = 0; i < 16; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === value;
}
export async function POST(request: Request) {
  const token = getAccessTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  try {
    const admin = await assertAdmin(token);
    if (isDemoMode) return NextResponse.json({ error: "Импорт недоступен в демо-режиме." }, { status: 409 });
    const body = await request.json() as { employees?: InputEmployee[] };
    const rows = body.employees;
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 200) {
      return NextResponse.json({ error: "Передайте от 1 до 200 сотрудников." }, { status: 400 });
    }
    const companyRows = await adminRest.dbRequest<Array<{company_id:string}>>(
      `profiles?id=eq.${encodeURIComponent(admin.id)}&select=company_id&limit=1`, { method: "GET" });
    const companyId = companyRows[0]?.company_id;
    if (!companyId) throw new Error("Не удалось определить компанию администратора.");
    const departments = await adminRest.dbRequest<Department[]>(
      `departments?company_id=eq.${encodeURIComponent(companyId)}&status=eq.active&select=id,name,company_id`, { method: "GET" });
    const departmentMap = new Map(departments.map(d => [norm(d.name), d]));
    const seen = new Set<string>();
    const results: Array<{employeeNumber:string; status:"created"|"skipped"|"error"; reason?:string}> = [];
    const credentials: Array<{employeeNumber:string; fullName:string; email:string; temporaryPassword:string}> = [];

    for (const row of rows) {
      let authId: string | null = null;
      let profileId: string | null = null;
      let employeeNumber = "";
      try {
        employeeNumber = normalizeEmployeeNumber(row.employeeNumber ?? "");
        if (!/^\d+$/.test(employeeNumber)) throw new Error("Табельный номер должен содержать только цифры.");
        if (seen.has(employeeNumber)) { results.push({employeeNumber,status:"skipped",reason:"Повтор в загружаемом файле."}); continue; }
        seen.add(employeeNumber);
        const firstName = (row.firstName ?? "").trim();
        const lastName = (row.lastName ?? "").trim();
        const middleName = (row.middleName ?? "").trim();
        const position = (row.position ?? "").trim();
        const department = departmentMap.get(norm(row.departmentName ?? ""));
        // Массовая загрузка создаёт только обычные учётные записи.
        // Привилегированные роли выдаются отдельно через штатное управление доступом.
        const role: UserRole = "employee";
        if (!firstName || !lastName || !position) throw new Error("Не заполнены имя, фамилия или должность.");
        if (!department) throw new Error(`Не найдено активное подразделение: ${row.departmentName ?? "не указано"}.`);
        if (!allowedRoles.includes(role)) throw new Error("Недопустимая роль.");
        const existing = await adminRest.dbRequest<Array<{id:string}>>(
          `profiles?employee_number=eq.${encodeURIComponent(employeeNumber)}&company_id=eq.${encodeURIComponent(companyId)}&select=id&limit=1`, {method:"GET"});
        if (existing.length) { results.push({employeeNumber,status:"skipped",reason:"Профиль с таким табельным номером уже существует; данные не перезаписаны."}); continue; }
        const hiredAt = row.hiredAt && validDate(row.hiredAt) ? row.hiredAt : new Date().toISOString().slice(0,10);
        const email = employeeNumberToEmail(employeeNumber, publicEnv.employeeEmailDomain);
        const password = temporaryPassword();
        const requestedProfileId = crypto.randomUUID();
        const authUser = await adminRest.createUser({
          email, password, email_confirm: true,
          user_metadata: {
            profile_id: requestedProfileId, company_id: companyId,
            department_id: department.id, employee_number: employeeNumber,
            first_name: firstName, last_name: lastName, position, hired_at: hiredAt,
            middle_name: middleName, must_change_password: true
          }
        });
        authId = authUser.id;
        const profiles = await adminRest.dbRequest<Profile[]>(
          `profiles?auth_user_id=eq.${encodeURIComponent(authId)}&id=eq.${encodeURIComponent(requestedProfileId)}&select=id,auth_user_id,employee_number,first_name,last_name,position,role,status&limit=1`, {method:"GET"});
        const profile = profiles[0];
        if (!profile) throw new Error("Auth создан, но профиль не появился. Проверьте триггер создания профиля.");
        profileId = profile.id;
        const updated = await adminRest.dbRequest<Profile[]>(
          `profiles?id=eq.${encodeURIComponent(profile.id)}&auth_user_id=eq.${encodeURIComponent(authId)}&company_id=eq.${encodeURIComponent(companyId)}&select=id,auth_user_id,employee_number,first_name,last_name,position,role,status`,
          {method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({role})});
        if (!updated[0]) throw new Error("Не удалось подтвердить профиль после создания.");
        credentials.push({employeeNumber,fullName:[lastName,firstName,middleName].filter(Boolean).join(" "),email,temporaryPassword:password});
        results.push({employeeNumber,status:"created"});
      } catch (e) {
        const reason = e instanceof Error ? e.message : "Неизвестная ошибка.";
        if (profileId && authId) {
          try { await adminRest.dbRequest(`profiles?id=eq.${encodeURIComponent(profileId)}&auth_user_id=eq.${encodeURIComponent(authId)}`,{method:"DELETE"}); } catch {}
        }
        if (authId) { try { await adminRest.deleteUser(authId); } catch {} }
        results.push({employeeNumber: employeeNumber || String(row.employeeNumber ?? ""),status:"error",reason});
      }
    }
    return NextResponse.json({ summary:{total:rows.length,created:results.filter(x=>x.status==="created").length,skipped:results.filter(x=>x.status==="skipped").length,errors:results.filter(x=>x.status==="error").length}, results, credentials }, {status:200});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка массового импорта.";
    console.error("POST /api/admin/employees/bulk:", error);
    return NextResponse.json({error:message},{status:/прав|недостаточно/i.test(message)?403:500});
  }
}
