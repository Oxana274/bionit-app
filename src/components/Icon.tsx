import type { CSSProperties, SVGProps } from "react";

export type IconName =
  | "home" | "onboarding" | "learning" | "rating" | "more" | "achievements"
  | "badges" | "shop" | "admin" | "wallet" | "trend" | "check" | "lock"
  | "book" | "clock" | "arrow-right" | "arrow-left" | "user" | "logout"
  | "phone" | "coin" | "cart" | "department" | "calendar" | "plus"
  | "close" | "success" | "warning" | "help" | "chevron-right" | "gift"
  | "shield" | "factory" | "trophy" | "spark" | "play" | "document"
  | "message" | "team" | "orders" | "access" | "employee";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3.5 10.8 12 3.8l8.5 7v8.7A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-8.7Z"/><path d="M9 21v-6.5h6V21"/></>,
  onboarding: <><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h5M8 16h3m3.5.5 1.4 1.4 3-3"/></>,
  learning: <><path d="M3.5 5.5A3.5 3.5 0 0 1 7 2h5v17H7a3.5 3.5 0 0 0-3.5 3V5.5Z"/><path d="M20.5 5.5A3.5 3.5 0 0 0 17 2h-5v17h5a3.5 3.5 0 0 1 3.5 3V5.5Z"/></>,
  rating: <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M2.5 20.5h19"/></>,
  more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/></>,
  achievements: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1.5A4.5 4.5 0 0 0 8.5 12M16 6h4v1.5a4.5 4.5 0 0 1-4.5 4.5M12 12v5M8.5 21h7M9.5 17h5v4h-5z"/></>,
  badges: <><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1 7 4.5-2 4.5 2-1-7m-3.5-8.2 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z"/></>,
  shop: <><path d="M4 8h16l-1 12H5L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>,
  admin: <><circle cx="12" cy="12" r="3"/><path d="M19.5 13.5v-3l-2.2-.6a7 7 0 0 0-.8-1.8l1.2-2-2.1-2.1-2 1.2a7 7 0 0 0-1.8-.8L11.2 2h-3l-.6 2.2a7 7 0 0 0-1.8.8l-2-1.2-2.1 2.1 1.2 2a7 7 0 0 0-.8 1.8L0 10.3v3l2.2.6a7 7 0 0 0 .8 1.8l-1.2 2 2.1 2.1 2-1.2a7 7 0 0 0 1.8.8l.6 2.2h3l.6-2.2a7 7 0 0 0 1.8-.8l2 1.2 2.1-2.1-1.2-2a7 7 0 0 0 .8-1.8l2.1-.4Z" transform="translate(2.3 0) scale(.82)"/></>,
  wallet: <><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H19v16H5.5A2.5 2.5 0 0 1 3 17.5v-11Z"/><path d="M16 9h5v6h-5a3 3 0 1 1 0-6Z"/></>,
  trend: <><path d="m4 17 5-5 3.5 3.5L20 8"/><path d="M15 8h5v5"/></>,
  check: <path d="m5 12.5 4 4L19 7"/>,
  lock: <><rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H12v18H6.5A2.5 2.5 0 0 0 4 22V4.5Z"/><path d="M20 4.5A2.5 2.5 0 0 0 17.5 2H12v18h5.5A2.5 2.5 0 0 1 20 22V4.5Z"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  "arrow-right": <path d="M5 12h14m-5-5 5 5-5 5"/>,
  "arrow-left": <path d="M19 12H5m5-5-5 5 5 5"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4M18 12H8"/></>,
  phone: <path d="M7.5 3.5 10 7.8 8 10a15 15 0 0 0 6 6l2.2-2 4.3 2.5-.8 3a2 2 0 0 1-2.2 1.5C9.8 20 4 14.2 3 6.5A2 2 0 0 1 4.5 4.3l3-.8Z"/>,
  coin: <><circle cx="12" cy="12" r="9"/><path d="M9 8.5h4.2a2 2 0 0 1 0 4H9m0 0h4.8a2 2 0 0 1 0 4H9V7M11 5v2m0 10v2"/></>,
  cart: <><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.7L21 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></>,
  department: <><path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 21v-5h6v5M8 10h1m3 0h1m3 0h1M8 13h1m3 0h1m3 0h1"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m2 0h5m-10 3h5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  success: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></>,
  warning: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 3.4 2.6c-.8.3-.9 1-.9 1.9m0 3.2h.01"/></>,
  "chevron-right": <path d="m9 6 6 6-6 6"/>,
  gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.7 4 6.2 4 4.9 5 4 6.3 4 8.5 4 10.2 6.3 12 9m4.5 0C19 9 20 7.7 20 6.2 20 4.9 19 4 17.7 4 15.5 4 13.8 6.3 12 9"/></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  factory: <><path d="M3 21V9l6 3V8l6 4V5h4v16H3Z"/><path d="M7 16h2m3 0h2m3 0h2"/></>,
  trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1.5A4.5 4.5 0 0 0 8.5 12M16 6h4v1.5a4.5 4.5 0 0 1-4.5 4.5M12 12v5M8 21h8M9.5 17h5v4h-5"/></>,
  spark: <path d="M12 2.5 13.8 9 20 12l-6.2 3L12 21.5 10.2 15 4 12l6.2-3L12 2.5Z"/>,
  play: <path d="m9 7 8 5-8 5V7Z"/>,
  document: <><path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
  message: <><path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 9h8m-8 3h5"/></>,
  team: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 4.5"/></>,
  orders: <><path d="M5 3h14v18H5V3Z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  access: <><circle cx="8" cy="8" r="3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M17 8v8m-4-4h8"/></>,
  employee: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M18 4h3v3"/></>
};

export function Icon({ name, size = 24, strokeWidth = 1.8, style, ...props }: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">): React.ReactElement {
  const mergedStyle: CSSProperties = { flex: "0 0 auto", ...style };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={mergedStyle} {...props}>{paths[name]}</svg>;
}
