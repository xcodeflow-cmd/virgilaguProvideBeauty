export function asDate(value: Date | string | null | undefined) {
  if (value instanceof Date) {
    return value;
  }

  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function toIsoDateString(value: Date | string | null | undefined) {
  return asDate(value)?.toISOString() || "";
}
