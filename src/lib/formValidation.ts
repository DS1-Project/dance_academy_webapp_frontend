export function required(value: string, label = "Este campo"): string | null {
  if (!value.trim()) return `${label} es obligatorio.`;
  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateEmail(email: string): string | null {
  const empty = required(email, "El correo");
  if (empty) return empty;
  if (!isValidEmail(email)) return "El correo no es válido.";
  return null;
}

export function validatePassword(password: string, min = 8): string | null {
  const empty = required(password, "La contraseña");
  if (empty) return empty;
  if (password.length < min) return `La contraseña debe tener al menos ${min} caracteres.`;
  return null;
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

export function validateMinVideos(count: number, min = 1): string | null {
  if (count < min) return `Debes agregar al menos ${min} video${min === 1 ? "" : "s"}.`;
  return null;
}

export function validatePositiveNumber(value: number, label = "El valor"): string | null {
  if (!Number.isFinite(value) || value <= 0) return `${label} debe ser mayor que 0.`;
  return null;
}

export function validateHttpUrl(url: string, label = "La URL"): string | null {
  const empty = required(url, label);
  if (empty) return empty;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return `${label} debe usar http o https.`;
    }
    return null;
  } catch {
    return `${label} no es válida.`;
  }
}

/** Keep only digit characters (for phone/card inputs). */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateDigitsOnly(
  value: string,
  label: string,
  minLength: number,
  maxLength: number
): string | null {
  const empty = required(value, label);
  if (empty) return empty;
  if (!/^\d+$/.test(value.trim())) {
    return `${label} solo puede contener números.`;
  }
  const digits = value.trim();
  if (digits.length < minLength || digits.length > maxLength) {
    return `${label} debe tener entre ${minLength} y ${maxLength} dígitos.`;
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  return validateDigitsOnly(phone, "El teléfono", 7, 15);
}

export function validateCardNumber(cardNumber: string): string | null {
  return validateDigitsOnly(cardNumber, "El número de tarjeta", 13, 19);
}

export function validateCvv(cvv: string): string | null {
  return validateDigitsOnly(cvv, "El CVV", 3, 4);
}

export function firstError(...errors: Array<string | null | undefined>): string | null {
  return errors.find((e): e is string => Boolean(e)) ?? null;
}
