type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactRequireAuthApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

interface SessionUserLike {
  expired?: boolean;
}

export interface SignInErrorDetails {
  summary: string;
  origin?: string;
  authority?: string;
  clientId?: string;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  hint?: string;
}

interface RequireAuthOptions {
  redirectingLabel?: string;
  renewSession?: () => Promise<SessionUserLike | null>;
  /** OIDC authority URL shown when discovery/sign-in fails (e.g. CORS). */
  authority?: string;
  /** OIDC client / auth-server application id this app authenticates against. */
  clientId?: string;
  /** Primary redirect URI used by this app (variants are expanded for display). */
  redirectUri?: string;
  /** Primary post-logout redirect URI used by this app. */
  postLogoutRedirectUri?: string;
  /** Explicit redirect URI list; overrides redirectUri expansion when provided. */
  redirectUris?: string[];
  /** Explicit post-logout URI list; overrides postLogoutRedirectUri expansion when provided. */
  postLogoutRedirectUris?: string[];
  formatSignInError?: (error: unknown) => string | SignInErrorDetails;
}

function isNetworkOrCorsFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    error.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  );
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function expandRedirectUris(redirectUri: string | undefined): string[] {
  if (!redirectUri?.trim()) {
    return [];
  }

  const uris = new Set<string>([redirectUri.trim()]);
  try {
    const url = new URL(redirectUri);
    if (url.pathname.endsWith("/auth/callback")) {
      uris.add(
        new URL(
          `${url.pathname.replace(/\/auth\/callback$/, "/callback")}${url.search}${url.hash}`,
          url.origin,
        ).toString(),
      );
    } else if (url.pathname.endsWith("/callback")) {
      uris.add(
        new URL(
          `${url.pathname.replace(/\/callback$/, "/auth/callback")}${url.search}${url.hash}`,
          url.origin,
        ).toString(),
      );
    }
  } catch {
    // Keep the configured URI only when parsing fails.
  }

  return uniqueNonEmpty([...uris]);
}

function expandPostLogoutRedirectUris(postLogoutRedirectUri: string | undefined): string[] {
  if (!postLogoutRedirectUri?.trim()) {
    return [];
  }

  const uris = new Set<string>([postLogoutRedirectUri.trim()]);
  try {
    const url = new URL(postLogoutRedirectUri);
    const pathname = url.pathname || "/";
    const withSlash = `${url.origin}${pathname.endsWith("/") ? pathname : `${pathname}/`}`;
    const withoutSlash = withSlash.replace(/\/$/, "") || url.origin;
    uris.add(withSlash);
    uris.add(withoutSlash);
    uris.add(`${url.origin}/`);
    uris.add(url.origin);
  } catch {
    // Keep the configured URI only when parsing fails.
  }

  return uniqueNonEmpty([...uris]);
}

function resolveExpectedUris(
  explicit: string[] | undefined,
  primary: string | undefined,
  expand: (value: string | undefined) => string[],
): string[] {
  if (explicit?.length) {
    return uniqueNonEmpty(explicit);
  }
  return expand(primary);
}

function defaultFormatSignInError(
  error: unknown,
  authority?: string,
  clientId?: string,
  redirectUris?: string[],
  postLogoutRedirectUris?: string[],
): SignInErrorDetails {
  if (isNetworkOrCorsFailure(error)) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "(unknown origin)";

    return {
      summary:
        "Sign-in could not reach the identity provider. This usually means CORS is not configured for this app origin.",
      origin,
      authority,
      clientId,
      redirectUris,
      postLogoutRedirectUris,
      hint: "Register these URIs on that OIDC application, recycle the Identity Provider, then retry.",
    };
  }

  if (error instanceof Error && error.message.trim()) {
    return buildConfiguredSignInError(error.message, authority, clientId, redirectUris, postLogoutRedirectUris);
  }

  return buildConfiguredSignInError(
    "Sign-in failed.",
    authority,
    clientId,
    redirectUris,
    postLogoutRedirectUris,
  );
}

function buildConfiguredSignInError(
  summary: string,
  authority?: string,
  clientId?: string,
  redirectUris?: string[],
  postLogoutRedirectUris?: string[],
): SignInErrorDetails {
  const looksLikeRedirectUriIssue = /redirect_uri|not registered/i.test(summary);
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  return {
    summary,
    origin,
    authority,
    clientId,
    redirectUris,
    postLogoutRedirectUris,
    hint: looksLikeRedirectUriIssue
      ? "Register these URIs on that OIDC application, recycle the Identity Provider, then retry."
      : redirectUris?.length || postLogoutRedirectUris?.length
        ? "Confirm the OIDC application redirect settings match the URIs below, then retry."
        : undefined,
  };
}

function readAuthErrorFromLocation(
  authority?: string,
  clientId?: string,
  redirectUris?: string[],
  postLogoutRedirectUris?: string[],
): SignInErrorDetails | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const authError = params.get("authError");
  if (!authError) {
    return null;
  }

  const description = params.get("authErrorDescription")?.trim();
  const summary = description || authError;

  params.delete("authError");
  params.delete("authErrorDescription");
  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, nextUrl);

  return buildConfiguredSignInError(
    summary,
    authority,
    clientId,
    redirectUris,
    postLogoutRedirectUris,
  );
}

function toSignInErrorDetails(value: string | SignInErrorDetails): SignInErrorDetails {
  return typeof value === "string" ? { summary: value } : value;
}

function UriList({ title, uris }: { title: string; uris: string[] }) {
  if (uris.length === 0) {
    return null;
  }

  return (
    <div className="auth-error-section">
      <h3>{title}</h3>
      <ul className="auth-error-uri-list">
        {uris.map((uri) => (
          <li key={uri}>
            <code>{uri}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthErrorPanel({ details }: { details: SignInErrorDetails }) {
  return (
    <div className="auth-error" role="alert">
      <h2>Authentication unavailable</h2>
      <p className="auth-error-summary">{details.summary}</p>

      <dl className="auth-error-meta">
        {details.origin ? (
          <>
            <dt>Current origin</dt>
            <dd>
              <code>{details.origin}</code>
            </dd>
          </>
        ) : null}
        <dt>Identity provider</dt>
        <dd>
          <code>{details.authority ?? "(not configured)"}</code>
        </dd>
        <dt>Auth server application</dt>
        <dd>
          <code>{details.clientId ?? "(not configured)"}</code>
        </dd>
      </dl>

      <UriList title="Expected Redirect URIs" uris={details.redirectUris ?? []} />
      <UriList
        title="Expected Post Logout Redirect URIs"
        uris={details.postLogoutRedirectUris ?? []}
      />

      {details.hint ? <p className="auth-error-hint">{details.hint}</p> : null}
    </div>
  );
}

export function createRequireAuth(
  react: ReactRequireAuthApi,
  getUser: () => Promise<SessionUserLike | null>,
  signIn: () => Promise<void>,
  {
    redirectingLabel = "Redirecting to sign in…",
    renewSession,
    authority,
    clientId,
    redirectUri,
    postLogoutRedirectUri,
    redirectUris,
    postLogoutRedirectUris,
    formatSignInError,
  }: RequireAuthOptions = {},
) {
  const expectedRedirectUris = resolveExpectedUris(
    redirectUris,
    redirectUri,
    expandRedirectUris,
  );
  const expectedPostLogoutRedirectUris = resolveExpectedUris(
    postLogoutRedirectUris,
    postLogoutRedirectUri,
    expandPostLogoutRedirectUris,
  );

  return function RequireAuth({ children }: { children: any }) {
    const [ready, setReady] = react.useState(false);
    const [error, setError] = react.useState<SignInErrorDetails | null>(() =>
      readAuthErrorFromLocation(
        authority,
        clientId,
        expectedRedirectUris,
        expectedPostLogoutRedirectUris,
      ),
    );

    react.useEffect(() => {
      let cancelled = false;

      void (async () => {
        if (error) {
          return;
        }

        try {
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
        } catch (signInError) {
          if (cancelled) {
            return;
          }

          const message = formatSignInError
            ? formatSignInError(signInError)
            : defaultFormatSignInError(
                signInError,
                authority,
                clientId,
                expectedRedirectUris,
                expectedPostLogoutRedirectUris,
              );
          setError(toSignInErrorDetails(message));
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [error]);

    if (error) {
      return <AuthErrorPanel details={error} />;
    }

    if (!ready) {
      return <div className="auth-message">{redirectingLabel}</div>;
    }

    return <>{children}</>;
  };
}
