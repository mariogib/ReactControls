import React from "react";
import {
  createOidcRuntimeConfig,
  normalizeBaseUrl,
  resolveLoopbackUri,
  createStatusMessage,
} from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const StatusMessage = createStatusMessage(React);

function OidcHelpersExample() {
  const config = createOidcRuntimeConfig({
    authority: "https://identity.example.lunarq",
    clientId: "lunarq-admin",
    baseUrl: "/admin",
    scope: "openid profile email roles",
    origin: "https://app.example.lunarq",
  });
  const base = normalizeBaseUrl("/admin/");
  const loopback = resolveLoopbackUri(
    undefined,
    "/auth/callback",
    "http://127.0.0.1:4190",
    true,
  );

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone="info"
        title="OIDC runtime helpers"
        detail="Build authority/client settings and normalize callback URLs for local/ngrok/prod."
      />
      <pre className="showcase-code-block">
        {JSON.stringify({ config, base, loopback }, null, 2)}
      </pre>
    </div>
  );
}

function RequireAuthExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone="warning"
        title="RequireAuth"
        detail="Gate routes behind an authenticated OIDC session. On failure it renews or redirects to sign-in."
      />
      <pre className="showcase-code-block">{`const RequireAuth = createRequireAuth(React, {
  userManager,
  signInRedirect: () => userManager.signinRedirect(),
});

<Route
  path="/app/*"
  element={
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  }
/>`}</pre>
    </div>
  );
}

function AuthCallbackExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone="info"
        title="AuthCallback"
        detail="Handle sign-in / sign-out redirect callbacks, then navigate into the app."
      />
      <pre className="showcase-code-block">{`const AuthCallback = createAuthCallback(React, {
  userManager,
  navigate,
  homePath: "/app",
});

<Route path="/auth/callback" element={<AuthCallback />} />`}</pre>
    </div>
  );
}

export const AUTH_HELP_GROUPS: HelpGroup[] = [
  {
    id: "authGuards",
    eyebrow: "Auth",
    title: "Guards & Callbacks",
    items: [
      {
        id: "requireAuth",
        title: "RequireAuth",
        description: "Protect routes; renew the session or redirect to sign-in when needed.",
        code: snippetCode(
          'import { createRequireAuth } from "@lunarq/frontend-shared";',
          "const RequireAuth = createRequireAuth(React, { userManager, signInRedirect });",
          `export function Protected({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}`,
        ),
        Example: RequireAuthExample,
      },
      {
        id: "authCallback",
        title: "AuthCallback",
        description: "Complete OIDC redirect handling for sign-in and sign-out callbacks.",
        code: snippetCode(
          'import { createAuthCallback } from "@lunarq/frontend-shared";',
          "const AuthCallback = createAuthCallback(React, { userManager, navigate, homePath: \"/app\" });",
          `export function CallbackRoute() {
  return <AuthCallback />;
}`,
        ),
        Example: AuthCallbackExample,
      },
      {
        id: "oidcHelpers",
        title: "OIDC helpers",
        description: "createOidcRuntimeConfig, normalizeBaseUrl, and resolveLoopbackUri.",
        code: snippetCode(
          'import { createOidcRuntimeConfig, normalizeBaseUrl, resolveLoopbackUri } from "@lunarq/frontend-shared";',
          "",
          `const config = createOidcRuntimeConfig({
  authority: "https://identity.example.lunarq",
  clientId: "lunarq-admin",
  baseUrl: "/admin",
});
const base = normalizeBaseUrl("/admin/");
const callback = resolveLoopbackUri(undefined, "/auth/callback", window.location.origin, true);`,
        ),
        Example: OidcHelpersExample,
      },
    ],
  },
];
