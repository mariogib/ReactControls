export interface ThemeResponseBase {
  tenantId: string;
  tenantName: string;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  textMutedColor: string;
  borderColor: string;
  shadowColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  isDefault: boolean;
}

const NO_CACHE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const DEFAULT_THEME: ThemeResponseBase = {
  tenantId: "default",
  tenantName: "LunarQ",
  primaryColor: "#3b82f6",
  secondaryColor: "#2563eb",
  successColor: "#10b981",
  dangerColor: "#ef4444",
  warningColor: "#f59e0b",
  bgColor: "#0a0e1a",
  cardBgColor: "#1a1f2e",
  textColor: "#ffffff",
  textMutedColor: "#9ca3af",
  borderColor: "#374151",
  shadowColor: "rgba(0, 0, 0, 0.25)",
  companyName: "LunarQ",
  isDefault: true,
};

export interface ThemeApiOptions<T extends ThemeResponseBase> {
  authServerUrl: string;
  defaultThemeOverrides?: Partial<T>;
}

export function createThemeApi<T extends ThemeResponseBase>(options: ThemeApiOptions<T>) {
  const { authServerUrl } = options;

  async function loadThemeByUrl(appUrl: string): Promise<T> {
    try {
      const timestamp = Date.now();
      const response = await fetch(
        `${authServerUrl}/api/theme/by-url?url=${encodeURIComponent(appUrl)}&_t=${timestamp}`,
        { method: "GET", headers: NO_CACHE_HEADERS },
      );

      if (!response.ok) {
        throw new Error(`Failed to load theme: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch {
      return loadSystemTheme();
    }
  }

  async function loadSystemTheme(): Promise<T> {
    try {
      const timestamp = Date.now();
      const response = await fetch(
        `${authServerUrl}/api/theme/system?_t=${timestamp}`,
        { headers: NO_CACHE_HEADERS },
      );

      if (!response.ok) {
        throw new Error(`Failed to load system theme: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch {
      return getDefaultTheme();
    }
  }

  function getDefaultTheme(): T {
    return { ...DEFAULT_THEME, ...options.defaultThemeOverrides } as T;
  }

  return { loadThemeByUrl, loadSystemTheme, getDefaultTheme };
}

const THEME_VARIABLE_MAP: ReadonlyArray<[keyof ThemeResponseBase, string]> = [
  ["primaryColor", "--primary-color"],
  ["secondaryColor", "--secondary-color"],
  ["successColor", "--success-color"],
  ["dangerColor", "--danger-color"],
  ["warningColor", "--warning-color"],
  ["bgColor", "--bg-color"],
  ["cardBgColor", "--card-bg"],
  ["textColor", "--text-color"],
  ["textMutedColor", "--text-muted"],
  ["borderColor", "--border-color"],
  ["shadowColor", "--shadow"],
];

export function applyThemeVariables(theme: ThemeResponseBase): void {
  const root = document.documentElement;
  for (const [key, cssVar] of THEME_VARIABLE_MAP) {
    const value = theme[key];
    if (typeof value === "string") {
      root.style.setProperty(cssVar, value);
    }
  }
}

export function updateFavicon(theme: ThemeResponseBase): void {
  const faviconUrl = theme.faviconUrl ?? theme.logoUrl;
  if (!faviconUrl) {
    return;
  }

  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (favicon) {
    favicon.href = faviconUrl;
    return;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

export function updateDocumentTitle(theme: ThemeResponseBase, baseTitle: string): void {
  if (theme.companyName && !theme.isDefault) {
    document.title = `${theme.companyName} - ${baseTitle}`;
    return;
  }

  document.title = `LunarQ - ${baseTitle}`;
}
