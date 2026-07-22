type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactUserHookApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

export interface AdminUserIdentity {
  name?: string | null;
  email?: string | null;
}

interface UseAdminUserOptions {
  fallbackName?: string;
  fallbackEmail?: string;
}

export function createUseAdminUser(react: ReactUserHookApi) {
  return function useAdminUser(
    loadUserIdentity: () => Promise<AdminUserIdentity | null>,
    options: UseAdminUserOptions = {}
  ) {
    const { fallbackName = "lunarq", fallbackEmail = "admin@lunarq.com" } = options;
    const [userName, setUserName] = react.useState(fallbackName);
    const [userEmail, setUserEmail] = react.useState(fallbackEmail);

    react.useEffect(() => {
      let cancelled = false;

      void (async () => {
        try {
          const identity = await loadUserIdentity();
          if (!cancelled && identity) {
            setUserName(identity.name || fallbackName);
            setUserEmail(identity.email || fallbackEmail);
          }
        } catch {
          // Keep fallback display values when the user identity cannot be loaded.
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [fallbackEmail, fallbackName, loadUserIdentity]);

    return {
      userName,
      userEmail,
    };
  };
}