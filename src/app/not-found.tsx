import Link from "next/link";
import { Button } from "antd";
import { BrandLogo } from "@/components/Brand";
export default function NotFound() {
  return <main className="state-page"><BrandLogo/><h1>Страница не найдена</h1><p>Вернитесь в приложение и выберите нужный раздел.</p><Link href="/home"><Button type="primary">На главную</Button></Link></main>;
}
