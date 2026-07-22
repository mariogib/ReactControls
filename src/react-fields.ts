import React from "react";
import { createFormFields } from "./components/index.js";

export type {
  CheckboxFieldProps,
  CurrencyFieldProps,
  DateFieldProps,
  DateTimeControlMode,
  DateTimeControlProps,
  DateTimeFieldProps,
  FieldVariant,
  NumberFieldProps,
  SelectFieldProps,
  TextAreaFieldProps,
  TextFieldProps,
  TimeFieldProps,
} from "./components/index.js";

export { resolveDateTimeControlInputProps } from "./components/index.js";

export const {
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
} = createFormFields(React);
