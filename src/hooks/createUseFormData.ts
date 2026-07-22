import { createUseFormChange } from "./useFormChange.js";

type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactFormHookApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useCallback<T extends (...args: any[]) => any>(callback: T, dependencies: readonly unknown[]): T;
}

export function createUseFormData(react: ReactFormHookApi) {
  const useFormChange = createUseFormChange(react);

  return function useFormData<T extends Record<string, any>>(initialData: T) {
    const [formData, setFormData] = react.useState<T>(initialData);
    const [errors, setErrors] = react.useState<Partial<Record<keyof T, string>>>({});

    const handleChange = useFormChange<T>(setFormData, {
      coerceNumberInputs: true,
      onFieldChange: (fieldName: Extract<keyof T, string>) => {
        setErrors((current) => {
          if (!current[fieldName]) {
            return current;
          }

          return {
            ...current,
            [fieldName]: undefined,
          };
        });
      },
    });

    const setFieldError = react.useCallback((field: keyof T, message: string) => {
      setErrors((current) => ({
        ...current,
        [field]: message,
      }));
    }, []);

    const clearErrors = react.useCallback(() => {
      setErrors({});
    }, []);

    const reset = react.useCallback(() => {
      setFormData(initialData);
      setErrors({});
    }, [initialData]);

    return {
      formData,
      setFormData,
      handleChange,
      errors,
      setFieldError,
      clearErrors,
      reset,
    };
  };
}