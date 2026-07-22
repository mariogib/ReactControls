/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createOidcRuntimeConfig, getAccessToken, normalizeBaseUrl, signoutUser } from "./oidcHelpers.js";

test("normalizeBaseUrl trims trailing slash", () => {
  assert.equal(normalizeBaseUrl("/DigitalPrize2/"), "/DigitalPrize2");
  assert.equal(normalizeBaseUrl("/"), "");
});

test("createOidcRuntimeConfig builds callback URIs with explicit base and origin", () => {
  const config = createOidcRuntimeConfig({
    baseUrl: "/DigitalPrize2/",
    origin: "https://example.test",
    authority: "https://auth.test",
    clientId: "client",
    scope: "openid profile",
  });

  assert.equal(config.authority, "https://auth.test");
  assert.equal(config.clientId, "client");
  assert.equal(config.scope, "openid profile");
  assert.equal(config.redirectUri, "https://example.test/DigitalPrize2/auth/callback");
  assert.equal(config.postLogoutRedirectUri, "https://example.test/DigitalPrize2/auth/callback");
});

test("createOidcRuntimeConfig rewrites localhost callback host/port when enabled", () => {
  const config = createOidcRuntimeConfig({
    baseUrl: "/",
    origin: "http://127.0.0.1:5173",
    redirectUri: "http://localhost:3000/auth/callback",
    postLogoutRedirectUri: "http://localhost:3000/auth/callback",
    rewriteLoopbackUris: true,
  });

  assert.equal(config.redirectUri, "http://127.0.0.1:5173/auth/callback");
  assert.equal(config.postLogoutRedirectUri, "http://127.0.0.1:5173/auth/callback");
});

test("signoutUser revokes tokens and redirects with post logout URI", async () => {
  const calls: string[] = [];
  const manager = {
    async revokeTokens(types?: ("access_token" | "refresh_token")[]) {
      calls.push(`revoke:${(types ?? []).join(",")}`);
    },
    async removeUser() {
      calls.push("removeUser");
    },
    async clearStaleState() {
      calls.push("clearStaleState");
    },
    async signoutRedirect(input: { state: { source: string }; post_logout_redirect_uri: string }) {
      calls.push(`redirect:${input.state.source}:${input.post_logout_redirect_uri}`);
      return undefined;
    },
    async getUser() {
      return null;
    },
  };

  await signoutUser(manager, "https://app.test/out");

  assert.deepEqual(calls, [
    "revoke:refresh_token,access_token",
    "removeUser",
    "clearStaleState",
    "redirect:signout:https://app.test/out",
  ]);
});

test("getAccessToken returns null when user is missing or expired", async () => {
  assert.equal(await getAccessToken({ getUser: async () => null }), null);
  assert.equal(await getAccessToken({ getUser: async () => ({ expired: true, access_token: "x" }) }), null);
});

test("getAccessToken returns access token for active user", async () => {
  const token = await getAccessToken({
    getUser: async () => ({
      expired: false,
      access_token: "token-123",
    }),
  });

  assert.equal(token, "token-123");
});
