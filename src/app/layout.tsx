/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Бионит В Деле", template: "%s — Бионит В Деле" },
  description: "Система мотивации, онбординга и обучения сотрудников Бионит.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  applicationName: "Бионит В Деле",
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#CB342A",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@300..900&display=swap" rel="stylesheet" />
  </head><body><AntdRegistry><Providers>{children}</Providers></AntdRegistry></body></html>;
}
