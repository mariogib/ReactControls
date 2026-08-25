/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import {
  getApiPathFromAppBase,
  resolveAdminAppUrl,
  resolveAdminProfileUrl,
  resolveApiBaseUrl,
  resolveApiOrigin,
  resolveAuthCallbackUrl,
  resolvePostLogoutRedirectUrl,
} from "./runtimeUrls.js";

const WORLDPLAY_ADMIN_HOST_TO_API_HOST = {
  "worldplayadmin.ngrok.app": "worldplayadminapi.ngrok.app",
} as const;

const LUNARQ_ADMIN_HOST_TO_API_HOST = {
  "lunarqadmin.ngrok.app": "lunarqadminapi.ngrok.app",
} as const;

test("getApiPathFromAppBase maps app virtual directory to api virtual directory", () => {
  assert.equal(getApiPathFromAppBase("/DigitalPrize2/"), "/DigitalPrize2-api");
  assert.equal(getApiPathFromAppBase("/DigitalPrize2-control/"), "/DigitalPrize2-control-api");
});

test("resolveApiOrigin maps local admin port to api port", () => {
  assert.equal(
    resolveApiOrigin({ hostname: "localhost", port: "5173", protocol: "http:" }),
    "http://localhost:5206",
  );
  assert.equal(
    resolveApiOrigin({ hostname: "127.0.0.1", port: "5173", protocol: "http:" }),
    "http://127.0.0.1:5206",
  );
  assert.equal(
    resolveApiOrigin({ hostname: "lunarq.admin", port: "5173", protocol: "http:" }),
    "http://lunarq.admin:5206",
  );
});

test("resolveApiOrigin maps ngrok admin host using caller-provided host map", () => {
  assert.equal(
    resolveApiOrigin(
      { hostname: "lunarqadmin.ngrok.app", port: "", protocol: "https:" },
      LUNARQ_ADMIN_HOST_TO_API_HOST,
    ),
    "https://lunarqadminapi.ngrok.app",
  );
  assert.equal(
    resolveApiOrigin(
      { hostname: "worldplayadmin.ngrok.app", port: "", protocol: "https:" },
      WORLDPLAY_ADMIN_HOST_TO_API_HOST,
    ),
    "https://worldplayadminapi.ngrok.app",
  );
  assert.equal(
    resolveApiOrigin({ hostname: "worldplayadmin.ngrok.app", port: "", protocol: "https:" }),
    "https://worldplayadmin.ngrok.app",
  );
});

test("resolveApiBaseUrl maps worldplayadmin control app using caller-provided host map", () => {
  assert.equal(
    resolveApiBaseUrl(
      { hostname: "worldplayadmin.ngrok.app", port: "", protocol: "https:" },
      "/DigitalPrize2-control/",
      undefined,
      WORLDPLAY_ADMIN_HOST_TO_API_HOST,
    ),
    "https://worldplayadminapi.ngrok.app/DigitalPrize2-control-api",
  );
});

test("resolveApiBaseUrl uses configured override when provided", () => {
  assert.equal(
    resolveApiBaseUrl(
      { hostname: "localhost", port: "5173", protocol: "http:" },
      "/DigitalPrize2-control/",
      "https://example.test/custom-api",
    ),
    "https://example.test/custom-api",
  );
});

test("resolveApiBaseUrl maps local IIS split-site deployment", () => {
  assert.equal(
    resolveApiBaseUrl(
      { hostname: "localhost", port: "5173", protocol: "http:" },
      "/DigitalPrize2-control/",
    ),
    "http://localhost:5206/DigitalPrize2-control-api",
  );
});

test("resolveAuthCallbackUrl stays on the web origin", () => {
  assert.equal(
    resolveAuthCallbackUrl(
      { hostname: "localhost", port: "5173", protocol: "http:" },
      "/DigitalPrize2-control/",
    ),
    "http://localhost:5173/DigitalPrize2-control/auth/callback",
  );
});

test("resolvePostLogoutRedirectUrl uses the app base path", () => {
  assert.equal(
    resolvePostLogoutRedirectUrl(
      { hostname: "acme-prizes.ngrok.app", port: "", protocol: "https:" },
      "/DigitalPrize2/",
    ),
    "https://acme-prizes.ngrok.app/DigitalPrize2/",
  );
  assert.equal(
    resolvePostLogoutRedirectUrl(
      { hostname: "localhost", port: "5173", protocol: "http:" },
      "/",
    ),
    "http://localhost:5173/",
  );
});

test("resolveAdminAppUrl uses the current origin and /Admin", () => {
  assert.equal(
    resolveAdminAppUrl({ hostname: "acme-prizes.ngrok.app", port: "", protocol: "https:" }),
    "https://acme-prizes.ngrok.app/Admin",
  );
  assert.equal(
    resolveAdminProfileUrl({ hostname: "acme-prizes.ngrok.app", port: "", protocol: "https:" }),
    "https://acme-prizes.ngrok.app/Admin/profile",
  );
});
