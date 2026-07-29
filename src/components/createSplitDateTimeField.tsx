import { useId } from "react";

type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export type SplitDateTimeFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

function normalizeTime(timePart: string): string {
  if (!timePart) return "";
  const [hours = "00", minutes = "00", seconds = "00"] = timePart.split(":");
  const pad = (n: string) => n.padStart(2, "0").slice(0, 2);
  return `${pad(hours || "0")}:${pad(minutes || "0")}:${pad(seconds || "0")}`;
}

function splitLocalDateTime(value: string): { date: string; time: string } {
  if (!value) {
    return { date: "", time: "" };
  }
  const [date = "", timePart = ""] = value.split("T");
  return { date, time: normalizeTime(timePart) };
}

function joinLocalDateTime(date: string, time: string): string {
  if (!date) return "";
  const normalized = normalizeTime(time);
  return `${date}T${normalized || "00:00:00"}`;
}

/** True when value is a complete local `YYYY-MM-DDTHH:mm:ss` timestamp. */
export function isCompleteLocalDateTime(value: string): boolean {
  if (!value) return false;
  const { date, time } = splitLocalDateTime(value);
  return Boolean(date && time && !Number.isNaN(new Date(value).getTime()));
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker?.();
  } catch {
    // Some environments block showPicker outside a direct user gesture.
  }
}

/**
 * Native date + time pickers bound as a local `YYYY-MM-DDTHH:mm:ss` value.
 * Distinct from `createFormFields` DateTimeField (single datetime-local input).
 */
export function createSplitDateTimeField(react: ReactElementApi) {
  return function SplitDateTimeField({
    id,
    label,
    value,
    onChange,
    required = false,
    disabled = false,
  }: SplitDateTimeFieldProps) {
    const autoId = useId();
    const baseId = id ?? autoId;
    const dateId = `${baseId}-date`;
    const timeId = `${baseId}-time`;
    const { date, time } = splitLocalDateTime(value);

    return react.createElement(
      "div",
      { className: "field datetime-field" },
      react.createElement(
        "span",
        { className: "datetime-field-label", id: `${baseId}-label` },
        label,
        required ? " *" : "",
      ),
      react.createElement(
        "div",
        {
          className: "datetime-field-inputs",
          role: "group",
          "aria-labelledby": `${baseId}-label`,
        },
        react.createElement("input", {
          id: dateId,
          type: "date",
          className: "datetime-field-date",
          required: false,
          disabled,
          value: date,
          onChange: (e: { target: { value: string } }) => {
            const nextDate = e.target.value;
            if (!nextDate) {
              onChange("");
              return;
            }
            onChange(joinLocalDateTime(nextDate, time || "00:00:00"));
          },
          onClick: (e: { currentTarget: HTMLInputElement }) => openPicker(e.currentTarget),
          "aria-required": required,
        }),
        react.createElement("input", {
          id: timeId,
          type: "time",
          step: 1,
          className: "datetime-field-time",
          required: false,
          disabled,
          value: time,
          onChange: (e: { target: { value: string } }) => {
            if (!date) {
              onChange("");
              return;
            }
            onChange(joinLocalDateTime(date, e.target.value || "00:00:00"));
          },
          onClick: (e: { currentTarget: HTMLInputElement }) => openPicker(e.currentTarget),
          "aria-required": required,
        }),
      ),
    );
  };
}
