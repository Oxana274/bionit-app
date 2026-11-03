"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Button, DatePicker, Empty, Form, Input, Modal, Progress, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import { PageHeader } from "@/components/Brand";
import { Icon } from "@/components/Icon";

interface AcademyEmployee { id: string; employeeNumber: string; fullName: string; position: string; departmentId: string | null; }
interface AcademyCourse { id: string; title: string; category: string; durationMinutes: number; reward: number; }
interface AssignmentCourse { id: string; title: string; status: string; }
interface AcademyAssignment { id: string; employee: string; employeeNumber: string; dueDate: string | null; status: string; assignedAt: string; completedAt: string | null; cancelledAt: string | null; cancellationReason: string | null; courses: AssignmentCourse[]; }
interface AcademyReportRow {
  assignmentId: string; assignmentCourseId: string; employee: string;
  employeeNumber: string; department: string; course: string;
  dueDate: string | null; assignedAt: string; startedAt: string | null;
  completedAt: string | null; status: string; completedModules: number;
  totalModules: number; progressPercent: number; bestScore: number | null;
  attemptsUsed: number; attemptsLimit: number;
}
interface AcademyPayload { employees: AcademyEmployee[]; courses: AcademyCourse[]; assignments: AcademyAssignment[]; report: AcademyReportRow[]; }
interface DepartmentSummary {
  department: string;
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
  averageProgress: number;
}
interface PeriodSummary {
  period: string;
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
interface AssignmentFormValues { profileId: string; classIds: string[]; dueDate?: Dayjs | null; }

const STATUS_LABEL: Record<string, string> = { assigned: "Назначено", in_progress: "В процессе", completed: "Завершено", overdue: "Просрочено", cancelled: "Отменено", suspended: "Приостановлено" };
function reportDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("ru-RU");
}

function StatusTag({ status }: { status: string }) {
  const color = status === "completed" ? "success" : status === "cancelled" ? "default" : status === "overdue" ? "error" : status === "in_progress" ? "processing" : "blue";
  return <Tag color={color}>{STATUS_LABEL[status] ?? status}</Tag>;
}

export function AcademyAdminView() {
  const { message } = App.useApp();
  const [data, setData] = useState<AcademyPayload>({ employees: [], courses: [], assignments: [], report: [] });
  const [reportEmployee, setReportEmployee] = useState("all");
  const [reportStatus, setReportStatus] = useState("all");
  const [reportDepartment, setReportDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AcademyAssignment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [form] = Form.useForm<AssignmentFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/academy", { cache: "no-store" });
      const body = await response.json() as AcademyPayload & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Не удалось загрузить Академию.");
      setData({ employees: body.employees ?? [], courses: body.courses ?? [], assignments: body.assignments ?? [], report: body.report ?? [] });
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка загрузки Академии.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => { void load(); }, [load]);

  const submitAssignment = async (values: AssignmentFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/academy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: values.profileId, classIds: values.classIds, dueDate: values.dueDate?.format("YYYY-MM-DD") ?? null })
      });
      const body = await response.json() as { data?: { coursesAssigned: number }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Не удалось назначить обучение.");
      void message.success(`Назначено курсов: ${body.data.coursesAssigned}.`);
      setModalOpen(false); form.resetFields(); await load();
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка назначения.");
    } finally { setSubmitting(false); }
  };

  const confirmCancel = async () => {
    if (!cancelTarget || cancelReason.trim().length < 3) return;
    setCancelling(true);
    try {
      const response = await fetch("/api/admin/academy", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: cancelTarget.id, reason: cancelReason.trim() })
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Не удалось отменить назначение.");
      void message.success("Назначение отменено. История завершённых курсов сохранена.");
      setCancelTarget(null); setCancelReason(""); await load();
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Ошибка отмены.");
    } finally { setCancelling(false); }
  };

  const columns: TableColumnsType<AcademyAssignment> = useMemo(() => [
    { title: "Сотрудник", key: "employee", width: 210, render: (_, item) => <div className="table-primary"><strong>{item.employee}</strong><span>Таб. № {item.employeeNumber}</span></div> },
    { title: "Курсы", key: "courses", render: (_, item) => <div className="table-primary">{item.courses.map((course) => <span key={course.id}>{course.title} · {STATUS_LABEL[course.status] ?? course.status}</span>)}</div> },
    { title: "Срок", dataIndex: "dueDate", key: "dueDate", width: 120, render: (value: string | null) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU") : "Не установлен" },
    { title: "Статус", dataIndex: "status", key: "status", width: 145, render: (value: string) => <StatusTag status={value}/> },
    { title: "Назначено", dataIndex: "assignedAt", key: "assignedAt", width: 145, render: (value: string) => new Date(value).toLocaleDateString("ru-RU") },
    { title: "Действие", key: "action", width: 130, fixed: "right", render: (_, item) => <Button danger size="small" disabled={item.status === "cancelled" || item.status === "completed"} onClick={() => { setCancelTarget(item); setCancelReason(""); }}>Отменить</Button> }
  ], []);

  const activeAssignments = data.assignments.filter((item) => !["cancelled", "completed"].includes(item.status)).length;
  const completedAssignments = data.assignments.filter((item) => item.status === "completed").length;
  const departments = Array.from(new Set(data.report.map((row) => row.department).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ru"));
  const reportRows = data.report.filter((row) =>
    (reportEmployee === "all" || row.employeeNumber === reportEmployee) &&
    (reportStatus === "all" || row.status === reportStatus) &&
    (reportDepartment === "all" || row.department === reportDepartment)
  );

  // Сводка считается по всем назначениям и не зависит от фильтров отчёта.
  const departmentSummary = useMemo<DepartmentSummary[]>(() => {
    const grouped = new Map<string, {
      total: number;
      inProgress: number;
      completed: number;
      overdue: number;
      progressTotal: number;
    }>();

    for (const row of data.report) {
      if (row.status === "cancelled") continue;

      const name = row.department || "Без подразделения";
      const current = grouped.get(name) ?? {
        total: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        progressTotal: 0
      };

      current.total += 1;
      current.progressTotal += row.progressPercent;
      if (row.status === "in_progress") current.inProgress += 1;
      if (row.status === "completed") current.completed += 1;
      if (row.status === "overdue") current.overdue += 1;
      grouped.set(name, current);
    }

    return Array.from(grouped.entries())
      .map(([department, value]) => ({
        department,
        total: value.total,
        inProgress: value.inProgress,
        completed: value.completed,
        overdue: value.overdue,
        averageProgress: value.total
          ? Math.round(value.progressTotal / value.total)
          : 0
      }))
      .sort((a, b) => a.department.localeCompare(b.department, "ru"));
  }, [data.report]);

  const overdueRows = useMemo(
    () => data.report
      .filter((row) => row.status === "overdue")
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    [data.report]
  );

  // Даты без UTC-сдвига: dueDate хранится в БД как DATE (YYYY-MM-DD).
  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayMs = 24 * 60 * 60 * 1000;
  const daysUntil = (value: string | null) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.round((parsed.getTime() - todayLocal.getTime()) / dayMs);
  };

  const activeReportRows = data.report.filter(
    (row) => row.status === "assigned" || row.status === "in_progress"
  );

  const dueSoonRows = useMemo(
    () => activeReportRows
      .filter((row) => {
        const days = daysUntil(row.dueDate);
        return days !== null && days >= 0 && days <= 30;
      })
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    [data.report]
  );

  const dueNext7 = dueSoonRows.filter((row) => {
    const days = daysUntil(row.dueDate);
    return days !== null && days <= 7;
  }).length;

  const currentMonthKey = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}`;
  const currentQuarter = Math.floor(todayLocal.getMonth() / 3);
  const currentQuarterStart = new Date(todayLocal.getFullYear(), currentQuarter * 3, 1);
  const currentQuarterEnd = new Date(todayLocal.getFullYear(), currentQuarter * 3 + 3, 0);

  const dueThisMonth = activeReportRows.filter(
    (row) => row.dueDate?.slice(0, 7) === currentMonthKey
  );

  const dueThisQuarter = activeReportRows.filter((row) => {
    const days = daysUntil(row.dueDate);
    return days !== null &&
      new Date(`${row.dueDate}T00:00:00`) >= currentQuarterStart &&
      new Date(`${row.dueDate}T00:00:00`) <= currentQuarterEnd;
  });

  const periodSummary = useMemo<PeriodSummary[]>(() => {
    const grouped = new Map<string, PeriodSummary>();
    for (const row of data.report) {
      if (!row.dueDate || row.status === "cancelled") continue;
      const key = row.dueDate.slice(0, 7);
      const current = grouped.get(key) ?? {
        period: key,
        total: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
      };
      current.total += 1;
      if (row.status === "in_progress") current.inProgress += 1;
      if (row.status === "completed") current.completed += 1;
      if (row.status === "overdue") current.overdue += 1;
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [data.report]);

  const exportReport = () => {
    const headers = ["Сотрудник", "Табельный номер", "Подразделение", "Курс", "Статус", "Прогресс, %", "Модули завершены", "Лучший результат теста, %", "Попыток использовано", "Лимит попыток", "Назначено", "Срок", "Начато", "Завершено"];
    const rows = reportRows.map((row) => [row.employee, row.employeeNumber, row.department, row.course, STATUS_LABEL[row.status] ?? row.status, row.progressPercent, `${row.completedModules} из ${row.totalModules}`, row.bestScore ?? "", row.attemptsUsed, row.attemptsLimit, reportDate(row.assignedAt), reportDate(row.dueDate), reportDate(row.startedAt), reportDate(row.completedAt)]);
    const csv = [headers, ...rows].map((line) => line.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `academy-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="admin-page">
    <div className="admin-header-row">
      <PageHeader eyebrow="Академия Бионит" title="Управление обучением" description="Назначайте сотрудникам реальные учебные курсы и контролируйте сроки прохождения." />
      <Button type="primary" size="large" icon={<Icon name="plus" size={18}/>} onClick={() => setModalOpen(true)} disabled={!data.employees.length || !data.courses.length}>Назначить обучение</Button>
    </div>

    <section className="admin-metrics">
      <article><span><Icon name="employee"/></span><div><strong>{data.employees.length}</strong><small>Активных сотрудников</small></div></article>
      <article><span><Icon name="learning"/></span><div><strong>{data.courses.length}</strong><small>Активных курсов</small></div></article>
      <article><span><Icon name="calendar"/></span><div><strong>{activeAssignments}</strong><small>Текущих назначений</small></div></article>
      <article><span><Icon name="success"/></span><div><strong>{completedAssignments}</strong><small>Завершённых назначений</small></div></article>
    </section>

    <section className="admin-workspace">
      <div className="section-title"><div><span className="eyebrow">Контроль обучения</span><h2>Назначения сотрудников</h2></div><Button icon={<Icon name="success" size={16}/>} onClick={() => void load()} loading={loading}>Обновить</Button></div>
      {data.assignments.length ? <Table<AcademyAssignment> rowKey="id" columns={columns} dataSource={data.assignments} loading={loading} pagination={{ pageSize: 10, hideOnSinglePage: true }} scroll={{ x: 950 }}/> : <div style={{ padding: 32 }}><Empty description={loading ? "Загрузка назначений…" : "Назначений пока нет"}/></div>}
    </section>

    <section className="admin-workspace" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div>
          <span className="eyebrow">Сводная аналитика</span>
          <h2>Обучение по подразделениям</h2>
        </div>
      </div>
      {departmentSummary.length ? (
        <Table<DepartmentSummary>
          rowKey="department"
          pagination={false}
          size="middle"
          dataSource={departmentSummary}
          columns={[
            { title: "Подразделение", dataIndex: "department", key: "department" },
            { title: "Назначено курсов", dataIndex: "total", key: "total", width: 135 },
            { title: "В процессе", dataIndex: "inProgress", key: "inProgress", width: 115 },
            { title: "Завершено", dataIndex: "completed", key: "completed", width: 115 },
            { title: "Просрочено", dataIndex: "overdue", key: "overdue", width: 115, render: (value: number) => value > 0 ? <Tag color="error">{value}</Tag> : value },
            { title: "Средний прогресс", dataIndex: "averageProgress", key: "averageProgress", width: 180, render: (value: number) => <Progress percent={value} size="small" /> }
          ]}
        />
      ) : (
        <Empty description="Пока нет назначенного обучения для сводки по подразделениям" />
      )}
    </section>

    <section className="admin-workspace" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div>
          <span className="eyebrow">Контроль сроков</span>
          <h2>Реестр просроченного обучения</h2>
        </div>
        <Tag color={overdueRows.length ? "error" : "success"}>
          Просрочено: {overdueRows.length}
        </Tag>
      </div>
      {overdueRows.length ? (
        <Table<AcademyReportRow>
          rowKey="assignmentCourseId"
          dataSource={overdueRows}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 950 }}
          columns={[
            { title: "Сотрудник", dataIndex: "employee", key: "employee", width: 190, render: (value: string, row) => <div className="table-primary"><strong>{value}</strong><span>Таб. № {row.employeeNumber}</span></div> },
            { title: "Подразделение", dataIndex: "department", key: "department", width: 170 },
            { title: "Курс", dataIndex: "course", key: "course", width: 240 },
            { title: "Срок прохождения", dataIndex: "dueDate", key: "dueDate", width: 150, render: (value: string | null) => reportDate(value) || "—" },
            { title: "Прогресс", dataIndex: "progressPercent", key: "progressPercent", width: 150, render: (value: number) => <Progress percent={value} size="small" /> },
            { title: "Статус", dataIndex: "status", key: "status", width: 130, render: (value: string) => <StatusTag status={value} /> }
          ]}
        />
      ) : (
        <Empty description="Просроченных назначений нет" />
      )}
    </section>

    <section className="admin-workspace" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div>
          <span className="eyebrow">Предупреждение о сроках</span>
          <h2>Обучение с приближающимся сроком</h2>
        </div>
        <Tag color={dueSoonRows.length ? "warning" : "success"}>
          В ближайшие 30 дней: {dueSoonRows.length}
        </Tag>
      </div>
      <div className="admin-metrics" style={{ marginBottom: 18 }}>
        <article><span><Icon name="calendar"/></span><div><strong>{dueNext7}</strong><small>Срок в ближайшие 7 дней</small></div></article>
        <article><span><Icon name="calendar"/></span><div><strong>{dueSoonRows.length}</strong><small>Срок в ближайшие 30 дней</small></div></article>
        <article><span><Icon name="calendar"/></span><div><strong>{dueThisMonth.length}</strong><small>Срок в текущем месяце</small></div></article>
        <article><span><Icon name="calendar"/></span><div><strong>{dueThisQuarter.length}</strong><small>Срок в текущем квартале</small></div></article>
      </div>
      {dueSoonRows.length ? (
        <Table<AcademyReportRow>
          rowKey="assignmentCourseId"
          dataSource={dueSoonRows}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 950 }}
          columns={[
            { title: "Сотрудник", dataIndex: "employee", key: "employee", width: 190, render: (value: string, row) => <div className="table-primary"><strong>{value}</strong><span>Таб. № {row.employeeNumber}</span></div> },
            { title: "Подразделение", dataIndex: "department", key: "department", width: 170 },
            { title: "Курс", dataIndex: "course", key: "course", width: 240 },
            { title: "Срок", dataIndex: "dueDate", key: "dueDate", width: 140, render: (value: string | null) => reportDate(value) || "—" },
            { title: "Осталось", key: "remaining", width: 120, render: (_, row) => { const days = daysUntil(row.dueDate); return days === 0 ? <Tag color="warning">Сегодня</Tag> : <Tag color={days !== null && days <= 7 ? "warning" : "blue"}>{days} дн.</Tag>; } },
            { title: "Прогресс", dataIndex: "progressPercent", key: "progressPercent", width: 145, render: (value: number) => <Progress percent={value} size="small" /> }
          ]}
        />
      ) : (
        <Empty description="Нет активных назначений со сроком в ближайшие 30 дней" />
      )}
    </section>

    <section className="admin-workspace" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div>
          <span className="eyebrow">Планирование</span>
          <h2>План обучения по срокам</h2>
        </div>
      </div>
      <p className="modal-description">
        План формируется по срокам уже созданных HR-назначений. Курсы без установленного срока и отменённые назначения в план не включаются.
      </p>
      {periodSummary.length ? (
        <Table<PeriodSummary>
          rowKey="period"
          dataSource={periodSummary}
          pagination={{ pageSize: 6, hideOnSinglePage: true }}
          columns={[
            { title: "Месяц завершения", dataIndex: "period", key: "period", render: (value: string) => { const [year, month] = value.split("-").map(Number); return new Date(year, month - 1, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }); } },
            { title: "Всего курсов", dataIndex: "total", key: "total" },
            { title: "В процессе", dataIndex: "inProgress", key: "inProgress" },
            { title: "Завершено", dataIndex: "completed", key: "completed" },
            { title: "Просрочено", dataIndex: "overdue", key: "overdue", render: (value: number) => value > 0 ? <Tag color="error">{value}</Tag> : value }
          ]}
        />
      ) : (
        <Empty description="План появится после назначения курсов со сроками прохождения" />
      )}
    </section>

    <section className="admin-workspace" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div><span className="eyebrow">Аналитика Академии</span><h2>Отчёт по обучению</h2></div>
        <Button onClick={exportReport} disabled={!reportRows.length}>Экспорт в Excel (CSV)</Button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <Select aria-label="Фильтр по сотруднику" value={reportEmployee} onChange={setReportEmployee} style={{ minWidth: 220 }} options={[{ value: "all", label: "Все сотрудники" }, ...Array.from(new Map(data.report.map((row) => [row.employeeNumber, { value: row.employeeNumber, label: `${row.employee} · №${row.employeeNumber}` }])).values())]} />
        <Select aria-label="Фильтр по подразделению" value={reportDepartment} onChange={setReportDepartment} style={{ minWidth: 200 }} options={[{ value: "all", label: "Все подразделения" }, ...departments.map((department) => ({ value: department, label: department }))]} />
        <Select aria-label="Фильтр по статусу" value={reportStatus} onChange={setReportStatus} style={{ minWidth: 190 }} options={[{ value: "all", label: "Все статусы" }, ...Object.entries(STATUS_LABEL).filter(([key]) => ["assigned", "in_progress", "completed", "overdue", "cancelled"].includes(key)).map(([value, label]) => ({ value, label }))]} />
      </div>
      {reportRows.length ? <Table<AcademyReportRow>
        rowKey="assignmentCourseId" dataSource={reportRows}
        pagination={{ pageSize: 10, hideOnSinglePage: true }} scroll={{ x: 1450 }}
        columns={[
          { title: "Сотрудник", dataIndex: "employee", key: "employee", fixed: "left", width: 190, render: (value: string, row) => <div className="table-primary"><strong>{value}</strong><span>Таб. № {row.employeeNumber}</span></div> },
          { title: "Подразделение", dataIndex: "department", key: "department", width: 160, render: (value: string) => value || "Без подразделения" },
          { title: "Курс", dataIndex: "course", key: "course", width: 220 },
          { title: "Статус", dataIndex: "status", key: "status", width: 130, render: (value: string) => <StatusTag status={value}/> },
          { title: "Прогресс", key: "progress", width: 180, render: (_, row) => <div style={{ minWidth: 130 }}><Progress percent={row.progressPercent} size="small"/><small>{row.completedModules} из {row.totalModules} модулей</small></div> },
          { title: "Тест", key: "test", width: 120, render: (_, row) => row.bestScore === null ? "Не проходил" : `${row.bestScore}%` },
          { title: "Попытки", key: "attempts", width: 100, render: (_, row) => `${row.attemptsUsed} из ${row.attemptsLimit}` },
          { title: "Срок", dataIndex: "dueDate", key: "dueDate", width: 115, render: (value: string | null) => reportDate(value) || "—" },
          { title: "Завершено", dataIndex: "completedAt", key: "completedAt", width: 115, render: (value: string | null) => reportDate(value) || "—" }
        ]}
      /> : <Empty description="По выбранным фильтрам назначений нет" />}
    </section>

    <Modal title="Назначить обучение сотруднику" open={modalOpen} onCancel={() => !submitting && setModalOpen(false)} footer={null} destroyOnClose width={620}>
      <p className="modal-description">Выберите сотрудника, один или несколько активных курсов и при необходимости срок завершения.</p>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={(values) => void submitAssignment(values)}>
        <Form.Item name="profileId" label="Сотрудник" rules={[{ required: true, message: "Выберите сотрудника." }]}>
          <Select showSearch optionFilterProp="label" placeholder="Начните вводить фамилию или табельный номер" options={data.employees.map((employee) => ({ value: employee.id, label: `${employee.fullName} · таб. № ${employee.employeeNumber} · ${employee.position}` }))}/>
        </Form.Item>
        <Form.Item name="classIds" label="Курсы обучения" rules={[{ required: true, message: "Выберите хотя бы один курс." }]}>
          <Select mode="multiple" showSearch optionFilterProp="label" placeholder="Выберите курсы" options={data.courses.map((course) => ({ value: course.id, label: `${course.title} · ${course.category}` }))}/>
        </Form.Item>
        <Form.Item name="dueDate" label="Срок прохождения (необязательно)">
          <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" placeholder="Выберите дату" disabledDate={(date) => date.isBefore(new Date().setHours(0, 0, 0, 0), "day")}/>
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>Отмена</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>Назначить</Button>
        </div>
      </Form>
    </Modal>

    <Modal title="Отмена назначения" open={Boolean(cancelTarget)} onCancel={() => !cancelling && setCancelTarget(null)} onOk={() => void confirmCancel()} okText="Подтвердить отмену" cancelText="Назад" okButtonProps={{ danger: true, disabled: cancelReason.trim().length < 3 }} confirmLoading={cancelling}>
      <p>Назначение сотруднику <strong>{cancelTarget?.employee}</strong> будет отменено. История завершённых курсов не удаляется.</p>
      <Input.TextArea rows={3} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Укажите причину отмены" maxLength={500}/>
    </Modal>
  </div>;
}
