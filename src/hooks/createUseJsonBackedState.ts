type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactJsonHookApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

export function createUseJsonBackedState(react: ReactJsonHookApi) {
  return function useJsonBackedState<T>(
    sourceJson: string | null | undefined,
    fallbackFactory: () => T
  ) {
    const [value, setValue] = react.useState<T>(() => {
      if (!sourceJson) {
        return fallbackFactory();
      }

      try {
        return JSON.parse(sourceJson) as T;
      } catch {
        return fallbackFactory();
      }
    });

    react.useEffect(() => {
      if (!sourceJson) {
        setValue(fallbackFactory());
        return;
      }

      try {
        setValue(JSON.parse(sourceJson) as T);
      } catch {
        setValue(fallbackFactory());
      }
    }, [fallbackFactory, sourceJson]);

    return [value, setValue] as const;
  };
}