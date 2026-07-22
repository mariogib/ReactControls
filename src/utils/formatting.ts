export function formatCurrency(value: number): string {
  return `R ${value.toFixed(2)}`;
}

export function formatCurrencyWithSeparators(value: number): string {
  return `R ${value.toLocaleString()}`;
}

export function formatNumber(value: number | undefined): string {
  return new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 }).format(value ?? 0);
}

export function formatMoney(value: number | undefined): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function truncateText(text: string | null | undefined, maxLength = 50): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
