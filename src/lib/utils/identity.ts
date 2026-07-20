export type ParsedLogin = { kind: "phone" | "employee"; value: string };

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  throw new Error("Введите телефон в международном формате.");
}

export function normalizeEmployeeNumber(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!/^[a-zа-я0-9._-]{2,32}$/i.test(normalized)) {
    throw new Error("Проверьте табельный номер.");
  }
  return normalized;
}

export function parseLoginIdentifier(value: string): ParsedLogin {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  const looksLikePhone = trimmed.startsWith("+") || digits.length >= 10;
  return looksLikePhone
    ? { kind: "phone", value: normalizePhone(trimmed) }
    : { kind: "employee", value: normalizeEmployeeNumber(trimmed) };
}

export function employeeNumberToEmail(employeeNumber: string, domain: string): string {
  return `${normalizeEmployeeNumber(employeeNumber)}@${domain.trim().toLowerCase()}`;
}
