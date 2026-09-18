export function normalizeNigerianPhoneNumber(value) {
  if (!value) return "";

  const cleaned = value.replace(/[^\d+]/g, "").replace(/\s+/g, "");

  if (!cleaned) return "";

  const withoutPlus = cleaned.replace(/^\+/, "");

  if (withoutPlus.startsWith("234")) {
    return withoutPlus;
  }

  if (withoutPlus.startsWith("0")) {
    return `234${withoutPlus.slice(1)}`;
  }

  if (/^\d{10}$/.test(withoutPlus)) {
    return `234${withoutPlus}`;
  }

  return withoutPlus;
}

export function isValidNigerianPhoneNumber(value) {
  const normalized = normalizeNigerianPhoneNumber(value);

  return /^234[789]\d{9}$/.test(normalized);
}

export function formatWhatsAppNumber(value) {
  const normalized = normalizeNigerianPhoneNumber(value);

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("234")) {
    return `+${normalized}`;
  }

  return `+234${normalized.replace(/^0/, "")}`;
}
