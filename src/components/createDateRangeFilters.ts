type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

import { currentUtcYearMonth, type RangePreset } from "../utils/dateRangePresets.js";

export type MonthWithData = {
  year: number;
  month: number;
  entryCount?: number;
};

export type DateRangeFiltersProps = {
  preset: RangePreset;
  fromDate: string;
  toDate: string;
  onPresetChange: (preset: RangePreset) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  year?: number;
  month?: number;
  onYearMonthChange?: (year: number, month: number) => void;
  monthsWithData?: MonthWithData[];
  onMonthSelect?: (year: number, month: number) => void;
  idPrefix?: string;
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  const label = new Intl.DateTimeFormat(undefined, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, index, 1)));
  return { value: month, label };
});

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMonthLabel(year: number, month: number, entryCount?: number): string {
  const label = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  if (entryCount == null) return label;
  return `${label} (${entryCount})`;
}

function selectedMonthKey(fromDate: string, toDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
    return "";
  }
  const [fy, fm, fd] = fromDate.split("-").map(Number);
  const [ty, tm, td] = toDate.split("-").map(Number);
  if (fd !== 1 || fy !== ty || fm !== tm) return "";
  const lastDay = new Date(Date.UTC(fy, fm, 0)).getUTCDate();
  if (td !== lastDay) return "";
  return monthKey(fy, fm);
}

function yearOptions(extraYears: number[] = []): number[] {
  const { year: current } = currentUtcYearMonth();
  const years = new Set<number>();
  for (let y = current - 5; y <= current + 1; y += 1) years.add(y);
  for (const y of extraYears) {
    if (y >= 2000 && y <= 2100) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

export function createDateRangeFilters(react: ReactElementApi) {
  return function DateRangeFilters({
    preset,
    fromDate,
    toDate,
    onPresetChange,
    onFromDateChange,
    onToDateChange,
    year,
    month,
    onYearMonthChange,
    monthsWithData,
    onMonthSelect,
    idPrefix = "date-range",
  }: DateRangeFiltersProps) {
    const showCustom = preset === "custom";
    const showChooseMonth = preset === "month" && Boolean(onYearMonthChange);
    const showMonthsWithData = showCustom && Boolean(monthsWithData && onMonthSelect);
    const monthValue = showMonthsWithData ? selectedMonthKey(fromDate, toDate) : "";
    const defaults = currentUtcYearMonth();
    const selectedYear = year ?? defaults.year;
    const selectedMonth = month ?? defaults.month;
    const years = yearOptions([
      selectedYear,
      ...(monthsWithData ?? []).map((row) => row.year),
    ]);

    const children: ReactNodeLike[] = [
      react.createElement(
        "div",
        { className: "field", key: "preset" },
        react.createElement("label", { htmlFor: `${idPrefix}-preset` }, "Date range"),
        react.createElement(
          "select",
          {
            id: `${idPrefix}-preset`,
            value: preset,
            onChange: (e: { target: { value: string } }) =>
              onPresetChange(e.target.value as RangePreset),
          },
          react.createElement("option", { value: "7d" }, "Last 7 days"),
          react.createElement("option", { value: "30d" }, "Last 30 days"),
          react.createElement("option", { value: "90d" }, "Last 90 days"),
          react.createElement("option", { value: "month" }, "Choose month"),
          react.createElement("option", { value: "custom" }, "Custom"),
        ),
      ),
    ];

    if (showChooseMonth) {
      children.push(
        react.createElement(
          "div",
          { className: "field", key: "year" },
          react.createElement("label", { htmlFor: `${idPrefix}-year` }, "Year"),
          react.createElement(
            "select",
            {
              id: `${idPrefix}-year`,
              value: selectedYear,
              onChange: (e: { target: { value: string } }) =>
                onYearMonthChange?.(Number(e.target.value), selectedMonth),
            },
            ...years.map((y) => react.createElement("option", { key: y, value: y }, String(y))),
          ),
        ),
        react.createElement(
          "div",
          { className: "field", key: "month-pick" },
          react.createElement("label", { htmlFor: `${idPrefix}-month-pick` }, "Month"),
          react.createElement(
            "select",
            {
              id: `${idPrefix}-month-pick`,
              value: selectedMonth,
              onChange: (e: { target: { value: string } }) =>
                onYearMonthChange?.(selectedYear, Number(e.target.value)),
            },
            ...MONTH_OPTIONS.map((option) =>
              react.createElement("option", { key: option.value, value: option.value }, option.label),
            ),
          ),
        ),
      );
    }

    if (showCustom) {
      children.push(
        react.createElement(
          "div",
          { className: "field", key: "from" },
          react.createElement("label", { htmlFor: `${idPrefix}-from` }, "From"),
          react.createElement("input", {
            id: `${idPrefix}-from`,
            type: "date",
            value: fromDate,
            onChange: (e: { target: { value: string } }) => onFromDateChange(e.target.value),
          }),
        ),
        react.createElement(
          "div",
          { className: "field", key: "to" },
          react.createElement("label", { htmlFor: `${idPrefix}-to` }, "To"),
          react.createElement("input", {
            id: `${idPrefix}-to`,
            type: "date",
            value: toDate,
            onChange: (e: { target: { value: string } }) => onToDateChange(e.target.value),
          }),
        ),
      );
    }

    if (showMonthsWithData) {
      children.push(
        react.createElement(
          "div",
          { className: "field", key: "months-with-data" },
          react.createElement("label", { htmlFor: `${idPrefix}-month` }, "Month with timesheets"),
          react.createElement(
            "select",
            {
              id: `${idPrefix}-month`,
              value: monthValue,
              onChange: (e: { target: { value: string } }) => {
                const value = e.target.value;
                if (!value || !onMonthSelect) return;
                const [y, m] = value.split("-").map(Number);
                if (!y || !m) return;
                onMonthSelect(y, m);
              },
            },
            react.createElement("option", { value: "" }, "Select month…"),
            ...(monthsWithData ?? []).map((row) => {
              const key = monthKey(row.year, row.month);
              return react.createElement(
                "option",
                { key, value: key },
                formatMonthLabel(row.year, row.month, row.entryCount),
              );
            }),
          ),
        ),
      );
    }

    return react.createElement("div", { className: "field-row chart-detail-filters" }, ...children);
  };
}
