export function sanitizeString(str: unknown): string {
  return String(str ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function validateRole(role: unknown): string {
  const VALID_ROLES = [
    "active",
    "filler",
    "lubricant",
    "glidant",
    "dry-binder",
    "disintegrant",
    "coating",
    "sweetener",
    "anti-caking",
    "flavoring",
    "colorant"
  ];
  const roleStr = String(role).toLowerCase();
  if (!VALID_ROLES.includes(roleStr)) {
    throw new Error(`Недопустимая роль. Допустимые значения: ${VALID_ROLES.join(", ")}`);
  }
  return roleStr;
}

export function validateBitterness(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const num = parseFloat(String(value));
  if (isNaN(num) || num < 0 || num > 10) {
    throw new Error("Горечь должна быть числом от 0 до 10");
  }
  return num;
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

export function validateEffects(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : JSON.parse(String(value) || "[]");
  if (!Array.isArray(arr)) {
    throw new Error("Эффекты должны быть представлены массивом строк");
  }
  return arr.map(item => {
    const sanitized = sanitizeString(item);
    if (sanitized.length > 100) {
      throw new Error("Каждый эффект не должен превышать 100 символов");
    }
    return sanitized;
  }).filter(Boolean);
}

export function validateContraindications(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : JSON.parse(String(value) || "[]");
  if (!Array.isArray(arr)) {
    throw new Error("Противопоказания должны быть представлены массивом строк");
  }
  return arr.map(item => {
    const sanitized = sanitizeString(item);
    if (sanitized.length > 100) {
      throw new Error("Каждое противопоказание не должно превышать 100 символов");
    }
    return sanitized;
  }).filter(Boolean);
}

export function validateSideEffects(value: unknown): { name: string; frequency: string; severity: 'low' | 'medium' | 'high' }[] {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : JSON.parse(String(value) || "[]");
  if (!Array.isArray(arr)) {
    throw new Error("Побочные эффекты должны быть представлены массивом объектов");
  }
  return arr.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Побочный эффект должен быть объектом");
    }
    const record = item as Record<string, unknown>;
    const name = sanitizeString(record.name);
    const frequency = sanitizeString(record.frequency);
    const severity = sanitizeString(record.severity).toLowerCase();
    
    if (!name) {
      throw new Error("Название побочного эффекта обязательно");
    }
    if (!frequency) {
      throw new Error("Частота побочного эффекта обязательна");
    }
    if (severity !== "low" && severity !== "medium" && severity !== "high") {
      throw new Error("Степень тяжести побочного эффекта должна быть: low, medium или high");
    }
    
    return { name, frequency, severity: severity as 'low' | 'medium' | 'high' };
  });
}
