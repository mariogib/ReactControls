interface ThemeShape {
  isDefault?: boolean;
  companyName?: string;
  tenantName?: string;
  primaryColor?: string;
}

interface ThemeState<TTheme extends ThemeShape> {
  theme: TTheme | null;
  loading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

interface ReactThemeIndicatorApi {
  useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
}

interface ThemeIndicatorOptions<TTheme extends ThemeShape> {
  loadingLabel?: string;
  errorLabel?: string;
  errorButtonClassName?: string;
  refreshButtonClassName?: string;
  refreshButtonTitle?: string;
  getContainerTitle?: (theme: TTheme) => string;
  showColorPreview?: boolean;
}

export function createThemeIndicator<TTheme extends ThemeShape>(
  react: ReactThemeIndicatorApi,
  useTheme: () => ThemeState<TTheme>,
  {
    loadingLabel = "Loading theme...",
    errorLabel = "Theme Error",
    errorButtonClassName = "config-btn",
    refreshButtonClassName = "config-btn",
    refreshButtonTitle = "Refresh theme",
    getContainerTitle,
    showColorPreview = true,
  }: ThemeIndicatorOptions<TTheme> = {})
{
  return function ThemeIndicator() {
    const { theme, loading, error, refreshTheme } = useTheme();
    const [isRefreshing, setIsRefreshing] = react.useState(false);

    async function handleRefresh() {
      setIsRefreshing(true);
      await refreshTheme();
      setIsRefreshing(false);
    }

    if (loading) {
      return (
        <div className="theme-indicator loading">
          <span className="indicator-icon">🎨</span>
          <span>{loadingLabel}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="theme-indicator error" title={error}>
          <span className="indicator-icon">⚠️</span>
          <span>{errorLabel}</span>
          <button onClick={refreshTheme} className={errorButtonClassName} type="button">
            Retry
          </button>
        </div>
      );
    }

    if (!theme) {
      return null;
    }

    const containerTitle = getContainerTitle
      ? getContainerTitle(theme)
      : theme.isDefault
        ? "System Default Theme"
        : `Tenant: ${theme.tenantName || theme.companyName}`;

    return (
      <div className={`theme-indicator ${theme.isDefault ? "default" : "custom"}`} title={containerTitle}>
        <span className="indicator-icon">🎨</span>
        <span className="tenant-info">
          {theme.isDefault ? "Default Theme" : theme.companyName || theme.tenantName || "Custom Theme"}
        </span>
        {!theme.isDefault && theme.primaryColor && showColorPreview ? (
          <div className="color-preview">
            <div className="color-dot"></div>
          </div>
        ) : null}
        <button
          onClick={handleRefresh}
          className={refreshButtonClassName}
          disabled={isRefreshing}
          type="button"
          title={refreshButtonTitle}
        >
          {isRefreshing ? "⏳" : "🔄"}
        </button>
      </div>
    );
  };
}
