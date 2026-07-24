interface ReactAuthCallbackApi {
  useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

interface AuthCallbackOptions {
  appPath?: string;
  landingPath?: string;
  baseUrl?: string;
  inFlightGuard?: boolean;
  callbackMessage?: string;
  fallbackErrorMessage?: string;
  getErrorMessage?: (error: unknown, fallbackMessage: string) => string;
  handleAuthErrors?: boolean;
  cleanupUser?: () => Promise<void>;
  isRecoverableError?: (error: unknown) => boolean;
}

function defaultGetErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function createAuthCallback(
  react: ReactAuthCallbackApi,
  processSigninCallback: () => Promise<void>,
  processSignoutCallback: () => Promise<void>,
  {
    appPath = "/app",
    landingPath = "/",
    baseUrl = "/",
    inFlightGuard = false,
    callbackMessage = "Completing authentication…",
    fallbackErrorMessage = "Authentication callback failed.",
    getErrorMessage = defaultGetErrorMessage,
    handleAuthErrors = false,
    cleanupUser,
    isRecoverableError,
  }: AuthCallbackOptions = {})
{
  let activeCallbackUrl: string | null = null;

  return function AuthCallback() {
    const [error, setError] = react.useState<string | null>(null);

  react.useEffect(() => {
      let cancelled = false;

      void (async () => {
        const callbackUrl = window.location.href;
        if (inFlightGuard && activeCallbackUrl === callbackUrl) {
          return;
        }

        if (inFlightGuard) {
          activeCallbackUrl = callbackUrl;
        }

        try {
          const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
          const resolvedAppPath = `${baseUrl.replace(/\/$/, "")}${appPath}`;
          const params = new URLSearchParams(window.location.search);

          if (handleAuthErrors && cleanupUser) {
            const authError = params.get("error");
            if (authError) {
              await cleanupUser();
              if (cancelled) {
                return;
              }
              const authErrorDescription = params.get("error_description");
              const landingParams = new URLSearchParams();
              landingParams.set("authError", authError);
              if (authErrorDescription) {
                landingParams.set("authErrorDescription", authErrorDescription);
              }
              window.location.replace(`${normalizedBaseUrl}?${landingParams.toString()}`);
              return;
            }
          }

          if (params.has("code")) {
            await processSigninCallback();
            if (cancelled) {
              return;
            }
            window.location.replace(resolvedAppPath);
            return;
          }

          await processSignoutCallback();
          if (cancelled) {
            return;
          }
          window.location.replace(landingPath === "/" ? baseUrl : landingPath);
        } catch (nextError) {
          if (cancelled) {
            return;
          }
          if (isRecoverableError && cleanupUser && isRecoverableError(nextError)) {
            await cleanupUser();
            if (cancelled) {
              return;
            }
            window.location.replace(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
            return;
          }

          setError(getErrorMessage(nextError, fallbackErrorMessage));
        } finally {
          if (inFlightGuard) {
            activeCallbackUrl = null;
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []);

    if (error) {
      return <div className="auth-error">{error}</div>;
    }

    return <div className="auth-message">{callbackMessage}</div>;
  };
}
