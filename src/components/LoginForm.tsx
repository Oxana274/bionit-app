"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, App, Button, Form, Input } from "antd";
import { Icon } from "@/components/Icon";
import { isDemoMode } from "@/lib/env";
import { signInWithEmployeeIdentifier } from "@/lib/supabase/auth-client";
import { useSession } from "@/providers/SessionProvider";

interface LoginValues {
  identifier: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { message } = App.useApp();
  const { setAuthenticatedSession } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: LoginValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const session = await signInWithEmployeeIdentifier(values.identifier, values.password);
      await setAuthenticatedSession(session);
      void message.success("Добро пожаловать в Бионит В Деле");
      router.replace("/home");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось войти.");
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    {params.get("expired") ? <Alert type="warning" showIcon={false} message="Сессия истекла. Войдите снова." className="login-alert"/> : null}
    {error ? <Alert type="error" showIcon={false} message={error} className="login-alert"/> : null}
    <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={submit} initialValues={{ identifier: isDemoMode ? "1001" : "", password: isDemoMode ? "Bionit!2026" : "" }}>
      <Form.Item name="identifier" label="Табельный номер или телефон" rules={[{ required: true, message: "Введите табельный номер или телефон." }]}>
        <Input size="large" autoComplete="username" prefix={<Icon name="employee" size={19}/>} placeholder="Например, 1001 или +7 900 123-45-67"/>
      </Form.Item>
      <Form.Item name="password" label="Пароль" rules={[{ required: true, message: "Введите пароль." }, { min: 8, message: "Не меньше 8 символов." }]}>
        <Input.Password size="large" autoComplete="current-password" prefix={<Icon name="lock" size={19}/>} placeholder="Введите пароль"/>
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large" loading={submitting} block>Войти</Button>
    </Form>
    <div className="login-help"><Icon name="help" size={19}/><span>Не получается войти? Проверьте данные из письма HR или обратитесь к администратору приложения.</span></div>
    {isDemoMode ? <div className="demo-box"><strong>Демо-доступ</strong><span>1001 / Bionit!2026</span><span>1002 / Bionit!2026</span><span>9001 / Admin!2026</span></div> : null}
  </>;
}
