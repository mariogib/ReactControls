/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import {
  getApiPathFromAppBase,
  resolveApiBaseUrl,
  resolveApiOrigin,
  resolveAuthCallbackUrl,
} from "./runtimeUrls.js";

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

test("resolveApiOrigin maps ngrok admin host to api host", () => {
  assert.equal(
    resolveApiOrigin({ hostname: "lunarqadmin.ngrok.app", port: "", protocol: "https:" }),
    "https://lunarqadminapi.ngrok.app",
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
