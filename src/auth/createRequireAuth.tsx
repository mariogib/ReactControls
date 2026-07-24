type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactRequireAuthApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

interface SessionUserLike {
  expired?: boolean;
}

interface RequireAuthOptions {
  redirectingLabel?: string;
  renewSession?: () => Promise<SessionUserLike | null>;
}

export function createRequireAuth(
  react: ReactRequireAuthApi,
  getUser: () => Promise<SessionUserLike | null>,
  signIn: () => Promise<void>,
  { redirectingLabel = "Redirecting to sign in…", renewSession }: RequireAuthOptions = {})
{
  return function RequireAuth({ children }: { children: any }) {
    const [ready, setReady] = react.useState(false);

    react.useEffect(() => {
      let cancelled = false;

      void (async () => {
        const user = await getUser();
        if (cancelled) {
          return;
        }

        if (!user || user.expired) {
          if (renewSession) {
            try {
              const renewedUser = await renewSession();
              if (cancelled) {
                return;
              }
              if (renewedUser && !renewedUser.expired) {
                setReady(true);
                return;
              }
            } catch {
              // Fall back to interactive sign-in when silent renew fails.
            }
          }

          if (cancelled) {
            return;
          }
          await signIn();
          return;
        }

        setReady(true);
      })();

      return () => {
        cancelled = true;
      };
    }, []);

    if (!ready) {
      return <div className="auth-message">{redirectingLabel}</div>;
    }

    return <>{children}</>;
  };
}
