"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Button, DatePicker, Empty, Form, Input, Modal, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import { PageHeader } from "@/components/Brand";
import { Icon } from "@/components/Icon";

interface AcademyEmployee { id: string; employeeNumber: string; fullName: string; position: string; departmentId: string | null; }
interface AcademyCourse { id: string; title: string; category: string; durationMinutes: number; reward: number; }
interface AssignmentCourse { id: string; title: string; status: string; }
interface AcademyAssignment { id: string; employee: string; employeeNumber: string; dueDate: string | null; status: string; assignedAt: string; completedAt: string | null; cancelledAt: string | null; cancellationReason: string | null; courses: AssignmentCourse[]; }
interface AcademyPayload { employees: AcademyEmployee[]; courses: AcademyCourse[]; assignments: AcademyAssignment[]; }
interface AssignmentFormValues { profileId: string; classIds: string[]; dueDate?: Dayjs | null; }

const STATUS_LABEL: Record<string, string> = { assigned: "Назначено", in_progress: "В процессе", completed: "Завершено", overdue: "Просрочено", cancelled: "Отменено", suspended: "Приостановлено" };
function StatusTag({ status }: { status: string }) {
  const color = status === "completed" ? "success" : status === "cancelled" ? "default" : status === "overdue" ? "error" : status === "in_progress" ? "processing" : "blue";
  return <Tag color={color}>{STATUS_LABEL[status] ?? status}</Tag>;
}

export function AcademyAdminView() {
  const { message } = App.useApp();
  const [data, setData] = useState<AcademyPayload>({ employees: [], courses: [], assignments: [] });
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
      setData({ employees: body.employees ?? [], courses: body.courses ?? [], assignments: body.assignments ?? [] });
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
