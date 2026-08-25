const LOCAL_WEB_PORT = "5173";
const LOCAL_API_PORT = "5206";

export type AdminHostToApiHostMap = Readonly<Record<string, string>>;

export function normalizeAppBasePath(baseUrl: string): string {
  if (!baseUrl || baseUrl === "/") {
    return "/";
  }

  const withoutTrailingSlash = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
}

export function getApiPathFromAppBase(appBasePath: string): string {
  const normalized = normalizeAppBasePath(appBasePath);
  return normalized === "/" ? "/api" : `${normalized}-api`;
}

export function resolveApiOrigin(
  location: Pick<URL, "hostname" | "port" | "protocol">,
  adminHostToApiHost: AdminHostToApiHostMap = {},
): string {
  const { hostname, port, protocol } = location;

  if (port === LOCAL_WEB_PORT) {
    return `${protocol}//${hostname}:${LOCAL_API_PORT}`;
  }

  const apiHost = adminHostToApiHost[hostname];
  if (apiHost) {
    return `${protocol}//${apiHost}`;
  }

  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
}

export function resolveApiBaseUrl(
  location: Pick<URL, "hostname" | "port" | "protocol">,
  appBaseUrl: string,
  configuredApiBase?: string,
  adminHostToApiHost: AdminHostToApiHostMap = {},
): string {
  const configured = configuredApiBase?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const apiPath = getApiPathFromAppBase(appBaseUrl);
  const apiOrigin = resolveApiOrigin(location, adminHostToApiHost);
  return `${apiOrigin}${apiPath}`.replace(/\/$/, "");
}

export function resolveAuthCallbackUrl(
  location: Pick<URL, "hostname" | "port" | "protocol">,
  appBaseUrl: string,
): string {
  const appBasePath = normalizeAppBasePath(appBaseUrl);
  const callbackPath =
    appBasePath === "/" ? "/auth/callback" : `${appBasePath}/auth/callback`;
  return `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ""}${callbackPath}`;
}

export function resolvePostLogoutRedirectUrl(
  location: Pick<URL, "hostname" | "port" | "protocol">,
  appBaseUrl: string,
): string {
  const appBasePath = normalizeAppBasePath(appBaseUrl);
  const origin = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ""}`;
  return appBasePath === "/" ? `${origin}/` : `${origin}${appBasePath}/`;
}

export function resolveAdminAppUrl(
  location: Pick<URL, "hostname" | "port" | "protocol">,
): string {
  const origin = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ""}`;
  return `${origin}/Admin`;
}

export function resolveAdminProfileUrl(
  location: Pick<URL, "hostname" | "port" | "protocol">,
): string {
  return `${resolveAdminAppUrl(location)}/profile`;
}
