import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { supabaseRest, supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";

interface EmployeeRecord { id: string; employee_number: string; first_name: string; last_name: string; position: string; department_id: string | null; status: string; }
interface CourseRecord { id: string; title: string; category: string; duration_minutes: number; reward: number; status: string; }
interface AssignmentRecord { id: string; profile_id: string; assigned_by: string; due_date: string | null; status: string; assigned_at: string; completed_at: string | null; cancelled_at: string | null; cancellation_reason: string | null; }
interface AssignmentCourseRecord { id: string; assignment_id: string; class_id: string; enrollment_id: string | null; status: string; }
interface AcademyReportRecord {
  assignmentId: string; assignmentCourseId: string; employee: string;
  employeeNumber: string; department: string; course: string;
  dueDate: string | null; assignedAt: string; startedAt: string | null;
  completedAt: string | null; status: string; completedModules: number;
  totalModules: number; progressPercent: number; bestScore: number | null;
  attemptsUsed: number; attemptsLimit: number;
}

type AuthorizationResult =
  | { ok: true; token: string }
  | { ok: false; response: ReturnType<typeof NextResponse.json> };

async function authorize(): Promise<AuthorizationResult> {
  const token = getAccessTokenFromCookies();

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Требуется авторизация." },
        { status: 401 }
      )
    };
  }

  if (isDemoMode) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Управление Академией доступно только в рабочем режиме." },
        { status: 409 }
      )
    };
  }

  try {
    const allowed = await supabaseRpc<boolean>("is_academy_admin", token);

    if (!allowed) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Нет административных прав Академии." },
          { status: 403 }
        )
      };
    }

    return { ok: true, token };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: error instanceof Error
            ? error.message
            : "Не удалось проверить права."
        },
        { status: 403 }
      )
    };
  }
}

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  try {
    const [employees, courses, assignments, report] = await Promise.all([
      supabaseRest<EmployeeRecord[]>("profiles?select=id,employee_number,first_name,last_name,position,department_id,status&status=eq.active&order=last_name.asc,first_name.asc", auth.token),
      supabaseRest<CourseRecord[]>("learning_classes?select=id,title,category,duration_minutes,reward,status&status=eq.active&order=sort_order.asc,title.asc", auth.token),
      supabaseRest<AssignmentRecord[]>("learning_assignments?select=id,profile_id,assigned_by,due_date,status,assigned_at,completed_at,cancelled_at,cancellation_reason&order=assigned_at.desc&limit=100", auth.token),
      supabaseRpc<AcademyReportRecord[]>("get_academy_learning_report", auth.token)
    ]);
    const ids = assignments.map((item) => item.id);
    const assignmentCourses = ids.length
      ? await supabaseRest<AssignmentCourseRecord[]>(`learning_assignment_courses?select=id,assignment_id,class_id,enrollment_id,status&assignment_id=in.(${ids.join(",")})`, auth.token)
      : [];
    const employeeById = new Map(employees.map((item) => [item.id, item]));
    const courseById = new Map(courses.map((item) => [item.id, item]));
    return NextResponse.json({
      employees: employees.map((item) => ({ id: item.id, employeeNumber: item.employee_number, fullName: `${item.first_name} ${item.last_name}`, position: item.position, departmentId: item.department_id })),
      courses: courses.map((item) => ({ id: item.id, title: item.title, category: item.category, durationMinutes: item.duration_minutes, reward: item.reward })),
      assignments: assignments.map((item) => ({
        id: item.id,
        employee: employeeById.get(item.profile_id) ? `${employeeById.get(item.profile_id)!.first_name} ${employeeById.get(item.profile_id)!.last_name}` : "Сотрудник не найден",
        employeeNumber: employeeById.get(item.profile_id)?.employee_number ?? "—",
        dueDate: item.due_date, status: item.status, assignedAt: item.assigned_at,
        completedAt: item.completed_at, cancelledAt: item.cancelled_at, cancellationReason: item.cancellation_reason,
        courses: assignmentCourses.filter((course) => course.assignment_id === item.id).map((course) => ({ id: course.id, title: courseById.get(course.class_id)?.title ?? "Курс", status: course.status }))
      })),
      report: report ?? []
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось загрузить Академию." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null) as { profileId?: string; classIds?: string[]; dueDate?: string | null } | null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!body?.profileId || !uuid.test(body.profileId) || !Array.isArray(body.classIds) || !body.classIds.length || body.classIds.some((id) => typeof id !== "string" || !uuid.test(id)) || (body.dueDate != null && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate))) {
    return NextResponse.json({ error: "Проверьте сотрудника, курсы и срок назначения." }, { status: 400 });
  }
  try {
    const data = await supabaseRpc<{ assignmentId: string; coursesAssigned: number }>("academy_create_assignment", auth.token, { p_profile_id: body.profileId, p_class_ids: body.classIds, p_due_date: body.dueDate ?? null });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось назначить обучение." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null) as { assignmentId?: string; reason?: string } | null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!body?.assignmentId || !uuid.test(body.assignmentId) || !body.reason?.trim()) return NextResponse.json({ error: "Укажите назначение и причину отмены." }, { status: 400 });
  try {
    const data = await supabaseRpc<{ assignmentId: string; status: string }>("academy_cancel_assignment", auth.token, { p_assignment_id: body.assignmentId, p_reason: body.reason.trim() });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось отменить назначение." }, { status: 400 });
  }
}
