export interface OidcRuntimeConfig {
  authority: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
}

interface OidcRuntimeConfigOptions {
  baseUrl?: string;
  origin?: string;
  authority?: string;
  clientId?: string;
  scope?: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  rewriteLoopbackUris?: boolean;
}

interface UserLike {
  expired?: boolean;
  access_token?: string | null;
}

interface UserManagerLike {
  getUser(): Promise<UserLike | null>;
  revokeTokens(tokenTypes?: ("access_token" | "refresh_token")[]): Promise<void>;
  removeUser(): Promise<void>;
  clearStaleState(): Promise<void>;
  signoutRedirect(input: { state: { source: string }; post_logout_redirect_uri: string }): Promise<unknown>;
}

export function normalizeBaseUrl(baseUrl: string = "/"): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function resolveLoopbackUri(
  configuredUri: string | undefined,
  fallbackPath: string,
  origin: string,
  rewriteLoopbackUris: boolean): string
{
  const fallbackUri = `${origin}${fallbackPath}`;
  if (!configuredUri) {
    return fallbackUri;
  }

  if (!rewriteLoopbackUris) {
    return configuredUri;
  }

  try {
    const configured = new URL(configuredUri);
    const current = new URL(origin);
    const loopbackHosts = new Set(["localhost", "127.0.0.1"]);

    if (loopbackHosts.has(configured.hostname) && loopbackHosts.has(current.hostname)) {
      configured.protocol = current.protocol;
      configured.hostname = current.hostname;
      configured.port = current.port;
      return configured.toString();
    }
  } catch {
    return fallbackUri;
  }

  return configuredUri;
}

export function createOidcRuntimeConfig({
  baseUrl = "/",
  origin = window.location.origin,
  authority = "https://lunarqauth.ngrok.app",
  clientId = "lunarq-admin",
  scope = "openid profile email roles",
  redirectUri,
  postLogoutRedirectUri,
  rewriteLoopbackUris = false,
}: OidcRuntimeConfigOptions = {}): OidcRuntimeConfig
{
  const normalizedBasePath = normalizeBaseUrl(baseUrl);
  const redirectPath = `${normalizedBasePath}/auth/callback`;

  const resolvedRedirectUri = resolveLoopbackUri(redirectUri, redirectPath, origin, rewriteLoopbackUris);
  const resolvedPostLogoutRedirectUri = resolveLoopbackUri(
    postLogoutRedirectUri ?? resolvedRedirectUri,
    redirectPath,
    origin,
    rewriteLoopbackUris);

  return {
    authority,
    clientId,
    scope,
    redirectUri: resolvedRedirectUri,
    postLogoutRedirectUri: resolvedPostLogoutRedirectUri,
  };
}

export async function signoutUser(userManager: UserManagerLike, postLogoutRedirectUri: string): Promise<void> {
  try {
    await userManager.revokeTokens(["refresh_token", "access_token"]);
  } catch {
    // The auth server may not expose revocation metadata in all environments.
  }

  await userManager.removeUser();
  await userManager.clearStaleState();
  await userManager.signoutRedirect({
    state: { source: "signout" },
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
}

export async function getAccessToken(userManager: Pick<UserManagerLike, "getUser">): Promise<string | null> {
  const user = await userManager.getUser();
  if (!user || user.expired) {
    return null;
  }

  return user.access_token ?? null;
}
