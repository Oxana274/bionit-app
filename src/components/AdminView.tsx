"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  type TableColumnsType
} from "antd";

import { BionicCoin, PageHeader, StatusPill } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDateTime } from "@/lib/utils/format";
import type {
  AdminDashboardData,
  AdminEmployeeRow,
  OrderStatus,
  ShopOrder,
  SurveyAdminControl,
  SurveyStatus,
  UserRole
} from "@/types/domain";

import surveyStyles from "./surveys.module.css";

const ORDER_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: "new", label: "Новый" },
  { value: "approved", label: "Подтверждён" },
  { value: "assembling", label: "Собирается" },
  { value: "ready", label: "Готов" },
  { value: "issued", label: "Выдан" },
  { value: "cancelled", label: "Отменён" }
];

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "employee", label: "Сотрудник" },
  { value: "mentor", label: "Наставник" },
  { value: "manager", label: "Руководитель" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Администратор" }
];

const SURVEY_STATUS_LABEL: Record<SurveyStatus, string> = {
  draft: "Черновик",
  active: "Открыт",
  closed: "Закрыт"
};

function isSurveyAdminControl(value: unknown): value is SurveyAdminControl {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<SurveyAdminControl>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    (candidate.status === "draft" ||
      candidate.status === "active" ||
      candidate.status === "closed") &&
    typeof candidate.responseCount === "number"
  );
}

interface NewEmployeeValues {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position: string;
  departmentId: string;
  role: UserRole;
  hiredAt: string;
  password: string;
}

export function AdminView({ initial }: { initial: AdminDashboardData }) {
  const { message } = App.useApp();
  const [orders, setOrders] = useState(initial.orders);
  const [employees, setEmployees] = useState(initial.employees);
  const [orderUpdating, setOrderUpdating] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeSubmitting, setEmployeeSubmitting] = useState(false);
  const [survey, setSurvey] = useState<SurveyAdminControl | null>(null);
  const [surveyLoading, setSurveyLoading] = useState(true);
  const [surveyUpdating, setSurveyUpdating] = useState(false);
  const [surveyControlAvailable, setSurveyControlAvailable] = useState(true);
  const [form] = Form.useForm<NewEmployeeValues>();

  useEffect(() => {
    let cancelled = false;

    const loadSurveyControl = async () => {
      try {
        const response = await fetch("/api/admin/surveys/current", {
          cache: "no-store"
        });
        const body = (await response.json().catch(() => null)) as unknown;

        if (response.status === 403) {
          if (!cancelled) setSurveyControlAvailable(false);
          return;
        }
        if (!response.ok || !isSurveyAdminControl(body)) {
          const errorBody = body as { error?: string } | null;
          throw new Error(errorBody?.error ?? "Не удалось загрузить опрос.");
        }
        if (!cancelled) setSurvey(body);
      } catch (error) {
        if (!cancelled) {
          void message.error(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить управление опросом."
          );
        }
      } finally {
        if (!cancelled) setSurveyLoading(false);
      }
    };

    void loadSurveyControl();
    return () => {
      cancelled = true;
    };
  }, [message]);

  const metrics = useMemo(
    () => [
      {
        label: "Новых заказов",
        value: initial.metrics.newOrders,
        icon: "orders" as const
      },
      {
        label: "Активных сотрудников",
        value: initial.metrics.activeEmployees,
        icon: "employee" as const
      },
      {
        label: "На онбординге",
        value: initial.metrics.onboardingInProgress,
        icon: "onboarding" as const
      },
      {
        label: "Успешность обучения",
        value: `${initial.metrics.learningPassRate}%`,
        icon: "learning" as const
      }
    ],
    [initial.metrics]
  );

  const updateOrder = async (id: string, status: OrderStatus) => {
    setOrderUpdating(id);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const body = (await response.json()) as {
        error?: string;
        status?: OrderStatus;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "Не удалось обновить заказ.");
      }
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status } : order))
      );
      void message.success("Статус заказа обновлён");
    } catch (error) {
      void message.error(
        error instanceof Error ? error.message : "Ошибка обновления заказа"
      );
    } finally {
      setOrderUpdating(null);
    }
  };

  const updateRole = async (id: string, role: UserRole) => {
    setRoleUpdating(id);
    try {
      const response = await fetch(`/api/admin/employees/${id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const body = (await response.json()) as {
        error?: string;
        role?: UserRole;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "Не удалось изменить роль.");
      }
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === id ? { ...employee, role } : employee
        )
      );
      void message.success("Права доступа обновлены");
    } catch (error) {
      void message.error(
        error instanceof Error ? error.message : "Ошибка обновления доступа"
      );
    } finally {
      setRoleUpdating(null);
    }
  };

  const addEmployee = async (values: NewEmployeeValues) => {
    setEmployeeSubmitting(true);
    try {
      const response = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const body = (await response.json()) as {
        error?: string;
        employee?: AdminEmployeeRow;
      };
      if (!response.ok || !body.employee) {
        throw new Error(body.error ?? "Не удалось добавить сотрудника.");
      }
      setEmployees((current) => [body.employee!, ...current]);
      setEmployeeModalOpen(false);
      form.resetFields();
      void message.success("Сотрудник добавлен и получил учётную запись");
    } catch (error) {
      void message.error(
        error instanceof Error ? error.message : "Ошибка добавления сотрудника"
      );
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  const toggleSurvey = async () => {
    if (!survey) return;
    const nextStatus: SurveyStatus =
      survey.status === "active" ? "closed" : "active";

    setSurveyUpdating(true);
    try {
      const response = await fetch("/api/admin/surveys/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: survey.id, status: nextStatus })
      });
      const body = (await response.json().catch(() => null)) as unknown;
      if (!response.ok || !isSurveyAdminControl(body)) {
        const errorBody = body as { error?: string } | null;
        throw new Error(
          errorBody?.error ?? "Не удалось изменить статус опроса."
        );
      }
      setSurvey(body);
      void message.success(
        nextStatus === "active" ? "Опрос открыт" : "Опрос закрыт"
      );
    } catch (error) {
      void message.error(
        error instanceof Error ? error.message : "Ошибка управления опросом"
      );
    } finally {
      setSurveyUpdating(false);
    }
  };

  const orderColumns: TableColumnsType<ShopOrder> = [
    {
      title: "Заказ",
      key: "order",
      width: 180,
      render: (_, order) => (
        <div className="table-primary">
          <strong>{order.number}</strong>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
      )
    },
    {
      title: "Сотрудник",
      dataIndex: "employeeName",
      key: "employee",
      width: 180,
      render: (name: string | undefined) => name ?? "—"
    },
    {
      title: "Товар",
      key: "product",
      width: 220,
      render: (_, order) => (
        <div className="table-primary">
          <strong>{order.productTitle}</strong>
          <span>
            {order.variantTitle ?? "Без варианта"} · {order.quantity} шт.
          </span>
        </div>
      )
    },
    {
      title: "Стоимость",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (value: number) => <BionicCoin value={value} compact />
    },
    {
      title: "Статус",
      key: "status",
      width: 210,
      fixed: "right",
      render: (_, order) => (
        <Select<OrderStatus>
          value={order.status}
          options={ORDER_OPTIONS}
          loading={orderUpdating === order.id}
          disabled={orderUpdating !== null || order.status === "cancelled"}
          onChange={(status) => void updateOrder(order.id, status)}
          style={{ width: 180 }}
        />
      )
    }
  ];

  const employeeColumns: TableColumnsType<AdminEmployeeRow> = [
    {
      title: "Сотрудник",
      key: "employee",
      width: 240,
      render: (_, employee) => (
        <div className="table-person">
          <span className="mini-avatar">
            {employee.fullName
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div className="table-primary">
            <strong>{employee.fullName}</strong>
            <span>Таб. № {employee.employeeNumber}</span>
          </div>
        </div>
      )
    },
    {
      title: "Подразделение",
      key: "department",
      width: 230,
      render: (_, employee) => (
        <div className="table-primary">
          <strong>{employee.departmentName}</strong>
          <span>{employee.position}</span>
        </div>
      )
    },
    {
      title: "Учётная запись",
      key: "auth",
      width: 160,
      render: (_, employee) => (
        <span className={employee.authLinked ? "auth-state linked" : "auth-state"}>
          <Icon name={employee.authLinked ? "success" : "warning"} size={17} />
          {employee.authLinked ? "Подключена" : "Не создана"}
        </span>
      )
    },
    {
      title: "Состояние",
      key: "status",
      width: 130,
      render: (_, employee) => <StatusPill status={employee.status} />
    },
    {
      title: "Доступ",
      key: "role",
      width: 210,
      fixed: "right",
      render: (_, employee) => (
        <Select<UserRole>
          value={employee.role}
          options={ROLE_OPTIONS}
          loading={roleUpdating === employee.id}
          disabled={roleUpdating !== null}
          onChange={(role) => void updateRole(employee.id, role)}
          style={{ width: 180 }}
        />
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <PageHeader
          eyebrow="Управление"
          title="Админ-панель"
          description="Заказы, сотрудники, права доступа и опросы в одном рабочем пространстве."
        />
        <Button
          type="primary"
          size="large"
          icon={<Icon name="plus" size={19} />}
          onClick={() => setEmployeeModalOpen(true)}
        >
          Добавить сотрудника
        </Button>
      </div>

      {surveyControlAvailable ? (
        <section className={surveyStyles.adminSurveyCard}>
          <div className={surveyStyles.adminSurveyHeader}>
            <div className={surveyStyles.adminSurveyTitle}>
              <span>
                <Icon name="document" size={23} />
              </span>
              <div>
                <h3>{survey?.title ?? "Опрос вовлечённости"}</h3>
                <p>
                  {surveyLoading
                    ? "Загрузка статуса…"
                    : `${SURVEY_STATUS_LABEL[survey?.status ?? "draft"]} · ${survey?.responseCount ?? 0} ответов`}
                </p>
              </div>
            </div>
            {survey ? (
              <span
                className={`${surveyStyles.status} ${
                  survey.status === "active"
                    ? surveyStyles.statusActive
                    : survey.status === "closed"
                      ? surveyStyles.statusClosed
                      : surveyStyles.statusDraft
                }`}
              >
                {SURVEY_STATUS_LABEL[survey.status]}
              </span>
            ) : null}
          </div>

          <div className={surveyStyles.adminSurveyActions}>
            {survey ? (
              <Link href={`/surveys/${survey.id}/results`}>
                <Button icon={<Icon name="trend" size={17} />}>
                  Смотреть аналитику
                </Button>
              </Link>
            ) : null}
            <Button
              type={survey?.status === "active" ? "default" : "primary"}
              danger={survey?.status === "active"}
              loading={surveyLoading || surveyUpdating}
              disabled={!survey}
              icon={
                <Icon
                  name={survey?.status === "active" ? "lock" : "play"}
                  size={17}
                />
              }
              onClick={() => void toggleSurvey()}
            >
              {survey?.status === "active" ? "Закрыть опрос" : "Открыть опрос"}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="admin-metrics">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>
              <Icon name={metric.icon} />
            </span>
            <div>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-workspace">
        <Tabs
          defaultActiveKey="orders"
          items={[
            {
              key: "orders",
              label: (
                <span className="tab-label">
                  <Icon name="orders" size={19} />
                  Заказы <b>{orders.length}</b>
                </span>
              ),
              children: (
                <div className="admin-table-wrap">
                  <Table<ShopOrder>
                    rowKey="id"
                    columns={orderColumns}
                    dataSource={orders}
                    pagination={{ pageSize: 10, hideOnSinglePage: true }}
                    scroll={{ x: 1000 }}
                  />
                </div>
              )
            },
            {
              key: "employees",
              label: (
                <span className="tab-label">
                  <Icon name="access" size={19} />
                  Сотрудники и доступы <b>{employees.length}</b>
                </span>
              ),
              children: (
                <div className="admin-table-wrap">
                  <Table<AdminEmployeeRow>
                    rowKey="id"
                    columns={employeeColumns}
                    dataSource={employees}
                    pagination={{ pageSize: 10, hideOnSinglePage: true }}
                    scroll={{ x: 1050 }}
                  />
                </div>
              )
            }
          ]}
        />
      </section>

      <Modal
        open={employeeModalOpen}
        onCancel={() => !employeeSubmitting && setEmployeeModalOpen(false)}
        footer={null}
        centered
        width={650}
        title="Новый сотрудник"
        destroyOnClose
      >
        <p className="modal-description">
          Профиль и учётная запись Supabase Auth будут созданы одновременно.
          Передайте сотруднику временный пароль безопасным способом.
        </p>
        <Form<NewEmployeeValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => void addEmployee(values)}
          initialValues={{
            role: "employee",
            hiredAt: new Date().toISOString().slice(0, 10)
          }}
        >
          <div className="form-grid two">
            <Form.Item
              name="employeeNumber"
              label="Табельный номер"
              rules={[
                { required: true, message: "Введите табельный номер." },
                {
                  pattern: /^[A-Za-zА-Яа-я0-9._-]+$/,
                  message: "Только буквы, цифры, точка, дефис или подчёркивание."
                }
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item name="phone" label="Телефон">
              <Input placeholder="+7 900 000-00-00" autoComplete="tel" />
            </Form.Item>
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, message: "Введите имя." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, message: "Введите фамилию." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="position"
              label="Должность"
              rules={[{ required: true, message: "Введите должность." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="departmentId"
              label="Подразделение"
              rules={[{ required: true, message: "Выберите подразделение." }]}
            >
              <Select
                options={initial.departments.map((department) => ({
                  value: department.id,
                  label: department.name
                }))}
              />
            </Form.Item>
            <Form.Item
              name="role"
              label="Роль"
              rules={[{ required: true, message: "Выберите роль." }]}
            >
              <Select options={ROLE_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="hiredAt"
              label="Дата приёма"
              rules={[{ required: true, message: "Укажите дату приёма." }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item
            name="password"
            label="Временный пароль"
            rules={[
              { required: true, message: "Введите временный пароль." },
              { min: 8, message: "Не менее 8 символов." }
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <div className="modal-actions">
            <Button
              onClick={() => setEmployeeModalOpen(false)}
              disabled={employeeSubmitting}
            >
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={employeeSubmitting}>
              Создать сотрудника
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
