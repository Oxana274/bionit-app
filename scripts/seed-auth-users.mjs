#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const employeeDomain = process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL_DOMAIN ?? "staff.bionit.ru";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Не заданы NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const companyId = "20000000-0000-4000-8000-000000000001";
const users = [
  {
    profileId: "10000000-0000-4000-8000-000000000001",
    employeeNumber: "1001",
    phone: "+79001234567",
    password: "Bionit!2026",
    firstName: "Анна",
    lastName: "Крылова",
    position: "Инженер-технолог",
    departmentId: "21000000-0000-4000-8000-000000000001",
    role: "employee",
    hiredAt: "2026-06-15"
  },
  {
    profileId: "10000000-0000-4000-8000-000000000002",
    employeeNumber: "1002",
    phone: "+79001234568",
    password: "Bionit!2026",
    firstName: "Михаил",
    lastName: "Орлов",
    position: "Начальник отдела контроля качества",
    departmentId: "21000000-0000-4000-8000-000000000002",
    role: "manager",
    hiredAt: "2019-03-11"
  },
  {
    profileId: "10000000-0000-4000-8000-000000000003",
    employeeNumber: "9001",
    phone: "+79001234569",
    password: "Admin!2026",
    firstName: "Елена",
    lastName: "Соколова",
    position: "HR-директор",
    departmentId: "21000000-0000-4000-8000-000000000003",
    role: "admin",
    hiredAt: "2016-09-01"
  }
];

const authHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json"
};

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...authHeaders, ...(options.headers ?? {}) } });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail = typeof body === "string" ? body : body?.message ?? body?.msg ?? JSON.stringify(body);
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }
  return body;
}

async function listAuthUsers() {
  const all = [];
  let page = 1;
  while (true) {
    const data = await request(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=1000`);
    const pageUsers = Array.isArray(data) ? data : data?.users ?? [];
    all.push(...pageUsers);
    if (pageUsers.length < 1000) break;
    page += 1;
  }
  return all;
}

function payloadFor(user) {
  return {
    email: `${user.employeeNumber}@${employeeDomain}`.toLowerCase(),
    phone: user.phone,
    password: user.password,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      profile_id: user.profileId,
      company_id: companyId,
      department_id: user.departmentId,
      employee_number: user.employeeNumber,
      first_name: user.firstName,
      last_name: user.lastName,
      position: user.position,
      role: user.role,
      hired_at: user.hiredAt
    }
  };
}

async function verifyProfile(user) {
  const rows = await request(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.profileId)}&select=id,auth_user_id,employee_number,role&limit=1`,
    { headers: { Accept: "application/json" } }
  );
  const profile = rows?.[0];
  if (!profile?.auth_user_id) {
    throw new Error(`Профиль ${user.employeeNumber} не связан с auth.users. Проверьте триггер handle_new_auth_user.`);
  }
  return profile;
}

console.log("Подготовка демонстрационных учётных записей Supabase Auth…");
const existingUsers = await listAuthUsers();

for (const user of users) {
  const payload = payloadFor(user);
  const existing = existingUsers.find(
    (item) => item.email?.toLowerCase() === payload.email || item.phone === user.phone
  );
  if (existing) {
    await request(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    console.log(`Обновлена учётная запись ${user.employeeNumber}.`);
  } else {
    await request(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    console.log(`Создана учётная запись ${user.employeeNumber}.`);
  }
  await verifyProfile(user);
}

console.log("Готово. Профили связаны с Supabase Auth.");
