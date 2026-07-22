export type GetErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => string;
type DependencyList = readonly unknown[];
type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactHooksApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useRef<T>(initialValue: T): { current: T };
  useEffect(
    effect: () => void | (() => void),
    dependencies?: DependencyList,
  ): void;
  useCallback<T extends (...args: any[]) => any>(
    callback: T,
    dependencies: DependencyList,
  ): T;
}

export interface UseAsyncValueOptions<T> {
  initialData?: T | null;
  immediate?: boolean;
  errorMessage?: string;
}

export interface UseAsyncListOptions<TItem> {
  initialItems?: TItem[];
  immediate?: boolean;
  errorMessage?: string;
}

interface CreateAsyncHooksOptions {
  getErrorMessage: GetErrorMessage;
  defaultErrorMessage: string;
  logPrefix?: string;
  shouldLogError?: (error: unknown) => boolean;
}

export function createAsyncHooks({
  react,
  getErrorMessage,
  defaultErrorMessage,
  logPrefix = "Async operation failed",
  shouldLogError,
}: CreateAsyncHooksOptions & { react: ReactHooksApi }) {
  function useAsyncValue<T>(
    asyncFunction: () => Promise<T>,
    dependencies: DependencyList = [],
    options: UseAsyncValueOptions<T> = {},
  ) {
    const {
      initialData = null,
      immediate = true,
      errorMessage = defaultErrorMessage,
    } = options;
    const [data, setData] = react.useState<T | null>(initialData);
    const [loading, setLoading] = react.useState(immediate);
    const [error, setError] = react.useState<string | null>(null);
    const asyncFunctionRef = react.useRef(asyncFunction);

    react.useEffect(() => {
      asyncFunctionRef.current = asyncFunction;
    }, [asyncFunction]);

    const execute = react.useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunctionRef.current();
        setData(result);
        return result;
      } catch (nextError) {
        const nextErrorMessage = getErrorMessage(nextError, errorMessage);
        setError(nextErrorMessage);
        if (shouldLogError?.(nextError) ?? true) {
          console.error(logPrefix, nextError);
        }
        return null;
      } finally {
        setLoading(false);
      }
    }, [errorMessage, ...dependencies]);

    react.useEffect(() => {
      if (!immediate) {
        setLoading(false);
        return;
      }

      void execute();
    }, [execute, immediate]);

    const refresh = react.useCallback(() => execute(), [execute]);

    return {
      data,
      loading,
      error,
      refresh,
      retry: refresh,
      setData,
      setError,
    };
  }

  function useAsyncList<TItem>(
    loadItems: () => Promise<TItem[]>,
    dependencies: DependencyList = [],
    options: UseAsyncListOptions<TItem> = {},
  ) {
    const { initialItems = [], immediate = true, errorMessage } = options;
    const asyncState = useAsyncValue<TItem[]>(loadItems, dependencies, {
      initialData: initialItems,
      immediate,
      errorMessage,
    });

    return {
      ...asyncState,
      items: asyncState.data ?? initialItems,
      setItems: asyncState.setData,
    };
  }

  function useAsyncMutation(
    defaultMutationErrorMessage: string = defaultErrorMessage,
  ) {
    const [loading, setLoading] = react.useState(false);
    const [error, setError] = react.useState<string | null>(null);

    const run = react.useCallback(
      async <T>(
        asyncOperation: () => Promise<T>,
        errorMessage?: string,
      ): Promise<T> => {
        setLoading(true);
        setError(null);

        try {
          return await asyncOperation();
        } catch (nextError) {
          const nextErrorMessage = getErrorMessage(
            nextError,
            errorMessage ?? defaultMutationErrorMessage,
          );
          setError(nextErrorMessage);
          throw nextError;
        } finally {
          setLoading(false);
        }
      },
      [defaultMutationErrorMessage],
    );

    return {
      loading,
      error,
      setError,
      run,
    };
  }

  function useAsync<T>(
    asyncFunction: () => Promise<T>,
    dependencies: DependencyList = [],
    options: UseAsyncValueOptions<T> = {},
  ) {
    return useAsyncValue(asyncFunction, dependencies, options);
  }

  return {
    useAsync,
    useAsyncValue,
    useAsyncList,
    useAsyncMutation,
  };
}
