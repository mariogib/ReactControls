type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

type CommonFieldProps = {
  name?: string;
  value?: string | number | readonly string[] | undefined;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
  onChange?: unknown;
};

type InputFieldProps = CommonFieldProps & {
  type?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  readOnly?: boolean;
};

type SelectElementProps = CommonFieldProps & {
  multiple?: boolean;
  children?: ReactNodeLike;
};

type TextAreaElementProps = CommonFieldProps & {
  rows?: number;
  readOnly?: boolean;
};

export type FieldVariant = "field" | "form-group";

type BaseFieldProps = {
  label: ReactNodeLike;
  htmlFor: string;
  variant?: FieldVariant;
  className?: string;
  inputClassName?: string;
};

export type TextFieldProps = BaseFieldProps & InputFieldProps;
export type SelectFieldProps = BaseFieldProps & SelectElementProps & { children: ReactNodeLike };
export type TextAreaFieldProps = BaseFieldProps & TextAreaElementProps;
export type NumberFieldProps = BaseFieldProps & Omit<InputFieldProps, "type">;
export type DateFieldProps = BaseFieldProps & Omit<InputFieldProps, "type">;
export type TimeFieldProps = BaseFieldProps & Omit<InputFieldProps, "type">;
export type DateTimeFieldProps = BaseFieldProps & Omit<InputFieldProps, "type">;

/** Modes for the unified date/time control. */
export type DateTimeControlMode = "date" | "datetime" | "datetime-seconds";

export type DateTimeControlProps = BaseFieldProps &
  Omit<InputFieldProps, "type" | "step"> & {
    /**
     * - `date`: calendar date only
     * - `datetime`: date + time without seconds (`HH:mm`)
     * - `datetime-seconds`: date + time with seconds (`HH:mm:ss`)
     */
    mode?: DateTimeControlMode;
    /** Override the step derived from `mode` when needed. */
    step?: string | number;
  };

export type CurrencyFieldProps = NumberFieldProps & {
  prefix?: ReactNodeLike;
};
export type CheckboxFieldProps = {
  checked: boolean;
  label: ReactNodeLike;
  name?: string;
  onChange: unknown;
  disabled?: boolean;
};

export function resolveDateTimeControlInputProps(
  mode: DateTimeControlMode = "date",
  step?: string | number,
): Pick<InputFieldProps, "type" | "step"> {
  if (mode === "date") {
    return { type: "date", ...(step !== undefined ? { step } : {}) };
  }

  if (mode === "datetime-seconds") {
    return { type: "datetime-local", step: step ?? 1 };
  }

  return { type: "datetime-local", step: step ?? 60 };
}

function renderLabel(label: ReactNodeLike, variant: FieldVariant) {
  return variant === "field" ? label : label;
}

export function createFormFields(react: ReactElementApi) {
  function TextField({ label, htmlFor, variant = "form-group", className = "", inputClassName = "", ...inputProps }: TextFieldProps) {
    if (variant === "field") {
      return react.createElement(
        "label",
        { className: ["field", className].filter(Boolean).join(" "), htmlFor },
        react.createElement("span", null, renderLabel(label, variant)),
        react.createElement("input", { id: htmlFor, className: inputClassName, ...inputProps }),
      );
    }

    return react.createElement(
      "div",
      { className: ["form-group", className].filter(Boolean).join(" ") },
      react.createElement("label", { htmlFor }, renderLabel(label, variant)),
      react.createElement("input", { id: htmlFor, className: inputClassName, ...inputProps }),
    );
  }

  function SelectField({ label, htmlFor, variant = "form-group", className = "", inputClassName = "", children, ...selectProps }: SelectFieldProps) {
    const accessibleLabel = typeof label === "string" ? label : undefined;
    const resolvedSelectProps = {
      "aria-label": selectProps.title ?? accessibleLabel,
      title: selectProps.title ?? accessibleLabel,
      ...selectProps,
    };

    if (variant === "field") {
      return react.createElement(
        "label",
        { className: ["field", className].filter(Boolean).join(" "), htmlFor },
        react.createElement("span", null, renderLabel(label, variant)),
        react.createElement("select", { id: htmlFor, className: inputClassName, ...resolvedSelectProps }, children),
      );
    }

    return react.createElement(
      "div",
      { className: ["form-group", className].filter(Boolean).join(" ") },
      react.createElement("label", { htmlFor }, renderLabel(label, variant)),
      react.createElement("select", { id: htmlFor, className: inputClassName, ...resolvedSelectProps }, children),
    );
  }

  function TextAreaField({ label, htmlFor, variant = "form-group", className = "", inputClassName = "", ...textAreaProps }: TextAreaFieldProps) {
    if (variant === "field") {
      return react.createElement(
        "label",
        { className: ["field", className].filter(Boolean).join(" "), htmlFor },
        react.createElement("span", null, renderLabel(label, variant)),
        react.createElement("textarea", { id: htmlFor, className: inputClassName, ...textAreaProps }),
      );
    }

    return react.createElement(
      "div",
      { className: ["form-group", className].filter(Boolean).join(" ") },
      react.createElement("label", { htmlFor }, renderLabel(label, variant)),
      react.createElement("textarea", { id: htmlFor, className: inputClassName, ...textAreaProps }),
    );
  }

  function CheckboxField({ checked, label, name, onChange, disabled }: CheckboxFieldProps) {
    return react.createElement(
      "label",
      { className: "tenant-checkbox-row" },
      react.createElement("input", { checked, name, onChange, type: "checkbox", disabled }),
      react.createElement("span", null, label),
    );
  }

  function NumberField(props: NumberFieldProps) {
    return TextField({ ...props, type: "number" });
  }

  function DateField(props: DateFieldProps) {
    return DateTimeControl({ ...props, mode: "date" });
  }

  function TimeField(props: TimeFieldProps) {
    return TextField({ ...props, type: "time" });
  }

  function DateTimeField(props: DateTimeFieldProps) {
    return DateTimeControl({ ...props, mode: "datetime" });
  }

  function DateTimeControl({
    mode = "date",
    step,
    className = "",
    inputClassName = "",
    ...fieldProps
  }: DateTimeControlProps) {
    const inputProps = resolveDateTimeControlInputProps(mode, step);
    return TextField({
      ...fieldProps,
      ...inputProps,
      className: ["date-time-control", `date-time-control--${mode}`, className]
        .filter(Boolean)
        .join(" "),
      inputClassName: ["date-time-control-input", inputClassName].filter(Boolean).join(" "),
    });
  }

  function CurrencyField({ prefix = "R", label, htmlFor, variant = "form-group", className = "", inputClassName = "", ...inputProps }: CurrencyFieldProps) {
    if (variant === "field") {
      return react.createElement(
        "label",
        { className: ["field", className].filter(Boolean).join(" "), htmlFor },
        react.createElement("span", null, renderLabel(label, variant)),
        react.createElement(
          "span",
          { className: "input-with-prefix" },
          react.createElement("span", { className: "input-prefix", "aria-hidden": true }, prefix),
          react.createElement("input", { id: htmlFor, className: inputClassName, type: "number", ...inputProps }),
        ),
      );
    }

    return react.createElement(
      "div",
      { className: ["form-group", className].filter(Boolean).join(" ") },
      react.createElement("label", { htmlFor }, renderLabel(label, variant)),
      react.createElement(
        "span",
        { className: "input-with-prefix" },
        react.createElement("span", { className: "input-prefix", "aria-hidden": true }, prefix),
        react.createElement("input", { id: htmlFor, className: inputClassName, type: "number", ...inputProps }),
      ),
    );
  }

  return {
    TextField,
    SelectField,
    TextAreaField,
    NumberField,
    DateField,
    TimeField,
    DateTimeField,
    DateTimeControl,
    CurrencyField,
    CheckboxField,
  };
}
