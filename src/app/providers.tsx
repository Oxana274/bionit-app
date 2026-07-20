"use client";

import type { ReactNode } from "react";
import { App as AntApp, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { BRAND } from "@/lib/constants";
import { SessionProvider } from "@/providers/SessionProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <ConfigProvider locale={ruRU} theme={{
    token: {
      colorPrimary: BRAND.red,
      colorInfo: BRAND.red,
      colorText: BRAND.dark,
      colorTextSecondary: "#6F6F6B",
      colorBgLayout: "#F6F5F2",
      colorBgContainer: BRAND.white,
      colorBorder: "#E7E5E2",
      borderRadius: 16,
      borderRadiusLG: 22,
      borderRadiusSM: 10,
      controlHeight: 46,
      fontFamily: "Geologica, Arial, sans-serif",
      boxShadowSecondary: "0 18px 48px rgba(29,29,27,.10)"
    },
    components: {
      Button: { fontWeight: 700, primaryShadow: "none", borderRadius: 14 },
      Input: { activeShadow: "0 0 0 3px rgba(203,52,42,.12)", borderRadius: 14 },
      Card: { borderRadiusLG: 22 },
      Progress: { defaultColor: BRAND.red, remainingColor: "#EFEDEA" },
      Tabs: { inkBarColor: BRAND.red, itemActiveColor: BRAND.red, itemSelectedColor: BRAND.red },
      Table: { headerBg: "#F7F6F4", headerColor: BRAND.dark, borderColor: "#ECEAE7" }
    }
  }}><AntApp><SessionProvider>{children}</SessionProvider></AntApp></ConfigProvider>;
}
