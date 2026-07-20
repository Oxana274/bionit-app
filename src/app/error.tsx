"use client";
import { Button } from "antd";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="state-page"><h1>Что-то пошло не так</h1><p>Повторите действие. Если ошибка сохраняется, сообщите администратору.</p><Button type="primary" onClick={reset}>Повторить</Button></main>;
}
