export type RangePreset = "7d" | "30d" | "90d" | "month" | "custom";

export function currentUtcYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function parseRangePreset(value: string | null | undefined): RangePreset {
  if (value === "7d" || value === "30d" || value === "90d" || value === "month" || value === "custom") {
    return value;
  }
  return "30d";
}
