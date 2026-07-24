type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactThemeApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
  useCallback<T extends (...args: any[]) => any>(callback: T, dependencies: readonly unknown[]): T;
  useRef<T>(initialValue: T): { current: T };
  useContext<T>(context: ThemeContextLike<T>): T;
  createContext<T>(value: T): ThemeContextLike<T>;
  createElement(type: any, props?: Record<string, unknown> | null, ...children: any[]): any;
}

type ThemeContextLike<T> = {
  Provider: any;
};

interface SessionUserLike {
  profile?: Record<string, unknown> | null;
}

interface UserManagerLike {
  getUser(): Promise<SessionUserLike | null>;
}

interface ThemeContextValue<TTheme> {
  theme: TTheme | null;
  loading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

interface ThemeContextOptions<TTheme> {
  loadThemeByUrl(appUrl: string): Promise<TTheme>;
  applyThemeVariables(theme: TTheme): void;
  updateFavicon(theme: TTheme): void;
  updateDocumentTitle(theme: TTheme, baseTitle?: string): void;
  getDefaultTheme(): TTheme;
  userManager?: UserManagerLike;
  baseTitle?: string;
  removeLoadingOverlay?: boolean;
  getErrorMessage?: (error: unknown, fallbackMessage: string) => string;
  hydrateThemeFromUser?: (theme: TTheme, user: SessionUserLike | null) => void;
}

function defaultGetErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

function hydrateThemeFromUserProfile<TTheme extends object>(theme: TTheme, user: SessionUserLike | null) {
  if (!user?.profile) {
    return;
  }

  const orgName = user.profile.org ?? user.profile.organization ?? user.profile.tenant_name;
  const companyName = user.profile.company_name ?? user.profile.company ?? orgName;

  const mutableTheme = theme as TTheme & { tenantName?: string; companyName?: string };

  if (!mutableTheme.tenantName && typeof orgName === "string") {
    mutableTheme.tenantName = orgName;
  }

  if (!mutableTheme.companyName && typeof companyName === "string") {
    mutableTheme.companyName = companyName;
  }
}

export function createThemeContext<TTheme extends object>(
  react: ReactThemeApi,
  {
    loadThemeByUrl,
    applyThemeVariables,
    updateFavicon,
    updateDocumentTitle,
    getDefaultTheme,
    userManager,
    baseTitle,
    removeLoadingOverlay = true,
    getErrorMessage = defaultGetErrorMessage,
    hydrateThemeFromUser,
  }: ThemeContextOptions<TTheme>)
{
  const ThemeContext = react.createContext<ThemeContextValue<TTheme>>({
    theme: null,
    loading: true,
    error: null,
    refreshTheme: async () => {},
  });

  function ThemeProvider({ children }: { children: any }) {
    const [theme, setTheme] = react.useState<TTheme | null>(null);
    const [loading, setLoading] = react.useState(true);
    const [error, setError] = react.useState<string | null>(null);
    const loadGenerationRef = react.useRef(0);
    const mountedRef = react.useRef(true);

    react.useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
        loadGenerationRef.current += 1;
      };
    }, []);

    const loadTheme = react.useCallback(async () => {
      const generation = ++loadGenerationRef.current;
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const themeData = await loadThemeByUrl(window.location.origin);

        if (userManager) {
          try {
            const user = await userManager.getUser();
            if (hydrateThemeFromUser) {
              hydrateThemeFromUser(themeData, user);
            } else {
              hydrateThemeFromUserProfile(themeData, user);
            }
          } catch {
            // Theme loading can proceed with server-provided values only.
          }
        }

        if (!mountedRef.current || generation !== loadGenerationRef.current) {
          return;
        }

        setTheme(themeData);
        applyThemeVariables(themeData);
        updateFavicon(themeData);
        updateDocumentTitle(themeData, baseTitle);
      } catch (nextError) {
        if (!mountedRef.current || generation !== loadGenerationRef.current) {
          return;
        }

        const errorMessage = getErrorMessage(nextError, "Failed to load theme");
        setError(errorMessage);

        const fallbackTheme = getDefaultTheme();
        setTheme(fallbackTheme);
        applyThemeVariables(fallbackTheme);
        updateFavicon(fallbackTheme);
        updateDocumentTitle(fallbackTheme, baseTitle);
      } finally {
        if (mountedRef.current && generation === loadGenerationRef.current) {
          setLoading(false);
        }
      }
    }, []);

    react.useEffect(() => {
      void loadTheme();
      return () => {
        loadGenerationRef.current += 1;
      };
    }, [loadTheme]);

    react.useEffect(() => {
      if (!removeLoadingOverlay || loading) {
        return;
      }

      const overlay = document.getElementById("theme-loading-overlay");
      if (!overlay) {
        return;
      }

      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s";
      const timer = setTimeout(() => overlay.remove(), 300);
      return () => clearTimeout(timer);
    }, [loading]);

    return react.createElement(
      ThemeContext.Provider,
      {
        value: {
          theme,
          loading,
          error,
          refreshTheme: loadTheme,
        },
      },
      children
    );
  }

  function useTheme() {
    return react.useContext(ThemeContext);
  }

  return {
    ThemeProvider,
    useTheme,
  };
}
