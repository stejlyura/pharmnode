export function sanitizeString(str: unknown): string {
  return String(str ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function validateRole(role: unknown): string {
  const VALID_ROLES = ["active", "filler", "lubricant", "glidant", "dry-binder"];
  const roleStr = String(role).toLowerCase();
  if (!VALID_ROLES.includes(roleStr)) {
    throw new Error(`Недопустимая роль. Допустимые значения: ${VALID_ROLES.join(", ")}`);
  }
  return roleStr;
}

export function validateDensity(value: unknown, fieldName = "Плотность"): number {
  const num = parseFloat(String(value));
  if (isNaN(num) || num <= 0) {
    throw new Error(`${fieldName} должна быть положительным числом`);
  }
  return num;
}

export function validatePercentage(value: unknown, fieldName = "Процент"): number {
  const num = parseFloat(String(value));
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error(`${fieldName} должен быть в диапазоне от 0 до 100`);
  }
  return num;
}

export function validateDilutionScale(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const sanitized = sanitizeString(value);
  if (!sanitized) return null;
  if (sanitized.length > 50) {
    throw new Error("Степень разведения не должна превышать 50 символов");
  }
  return sanitized;
}

export function validateOptionalString(value: unknown, maxLength = 255, fieldName = "Поле"): string | null {
  if (value === undefined || value === null) return null;
  const sanitized = sanitizeString(value);
  if (!sanitized) return null;
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} не должно превышать ${maxLength} символов`);
  }
  return sanitized;
}
