const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function parseDateValue(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = parseDateValue(value);
  return date?.toLocaleDateString("en-ZA", { timeZone: LOCAL_TIME_ZONE }) ?? "";
}

export function formatDateExtended(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = parseDateValue(value);
  return date?.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: LOCAL_TIME_ZONE,
  }) ?? "";
}

export function formatDateTime(value: string | Date | null | undefined, fallback = ""): string {
  if (!value) {
    return fallback;
  }

  const date = parseDateValue(value);
  return date?.toLocaleString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: LOCAL_TIME_ZONE,
  }) ?? fallback;
}

export function formatDateTimeShort(value: string | Date | null | undefined, fallback = "-"): string {
  if (!value) {
    return fallback;
  }

  const date = parseDateValue(value);
  return date?.toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: LOCAL_TIME_ZONE,
  }) ?? fallback;
}

export function formatDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
