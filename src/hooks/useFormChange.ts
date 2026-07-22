type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type FormFieldValue = string | number | boolean;
type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactCallbackApi {
  useCallback<T extends (...args: any[]) => any>(callback: T, dependencies: readonly unknown[]): T;
}

export type FormFieldParsers<TForm extends object> = Partial<
  Record<Extract<keyof TForm, string>, (value: FormFieldValue) => unknown>
>;

interface UseFormChangeOptions<TForm extends object> {
  fieldParsers?: FormFieldParsers<TForm>;
  coerceNumberInputs?: boolean;
  onFieldChange?: (fieldName: Extract<keyof TForm, string>) => void;
}

export interface FormChangeEvent {
  target: InputElement;
}

function isFormChangeOptions<TForm extends object>(
  value: FormFieldParsers<TForm> | UseFormChangeOptions<TForm>
): value is UseFormChangeOptions<TForm> {
  return "fieldParsers" in value || "coerceNumberInputs" in value || "onFieldChange" in value;
}

export function createUseFormChange(react: ReactCallbackApi) {
  return function useFormChange<TForm extends object>(
    setFormData: Dispatch<TForm>,
    optionsOrParsers: FormFieldParsers<TForm> | UseFormChangeOptions<TForm> = {}
  ) {
    const normalizedOptions = isFormChangeOptions(optionsOrParsers)
      ? optionsOrParsers
      : { fieldParsers: optionsOrParsers };
    const fieldParsers = (normalizedOptions.fieldParsers ?? {}) as FormFieldParsers<TForm>;
    const { coerceNumberInputs = false, onFieldChange } = normalizedOptions;

    return react.useCallback((event: FormChangeEvent) => {
      const { name } = event.target;
      const fieldName = name as Extract<keyof TForm, string>;
      const parser = fieldParsers[fieldName];

      let fieldValue: FormFieldValue;
      if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
        fieldValue = event.target.checked;
      } else if (coerceNumberInputs && event.target instanceof HTMLInputElement && event.target.type === "number") {
        fieldValue = parseInt(event.target.value, 10) || 0;
      } else {
        fieldValue = event.target.value;
      }

      setFormData((current: TForm) => ({
        ...current,
        [fieldName]: parser ? parser(fieldValue) : fieldValue,
      }));

      if (onFieldChange) {
        onFieldChange(fieldName);
      }
    }, [coerceNumberInputs, fieldParsers, onFieldChange, setFormData]);
  };
}
