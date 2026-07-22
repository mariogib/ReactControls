/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { checkApiHealth, ApiHealthMonitor } from "./health.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

function setupGlobals() {
  const timeouts = new Map<number, () => void>();
  const intervals = new Map<number, { fn: () => void; ms: number }>();
  let nextId = 1;

  (globalThis as any).window = {
    setTimeout(fn: () => void, ms: number): number {
      const id = nextId++;
      timeouts.set(id, fn);
      return id;
    },
    clearTimeout(id: number): void {
      timeouts.delete(id);
    },
    setInterval(fn: () => void, ms: number): number {
      const id = nextId++;
      intervals.set(id, { fn, ms });
      return id;
    },
    clearInterval(id: number): void {
      intervals.delete(id);
    },
  };

  return { timeouts, intervals };
}

function teardownGlobals() {
  if (originalWindow) {
    (globalThis as any).window = originalWindow;
  } else {
    delete (globalThis as any).window;
  }
  globalThis.fetch = originalFetch;
}

test("checkApiHealth returns healthy result on successful response", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, _options: any) => {
    return { ok: true, status: 200, statusText: "OK" } as Response;
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health" });

    assert.equal(result.isHealthy, true);
    assert.equal(result.endpoint, "/health");
    assert.equal(result.error, undefined);
    assert.ok(result.lastCheck instanceof Date);
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth returns unhealthy on non-ok response", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, _options: any) => {
    return { ok: false, status: 503, statusText: "Service Unavailable" } as Response;
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health" });

    assert.equal(result.isHealthy, false);
    assert.equal(result.error, "HTTP 503: Service Unavailable");
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth returns timeout error on abort", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, options: any) => {
    const error = new DOMException("The operation was aborted.", "AbortError");
    throw error;
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health", timeoutMs: 100 });

    assert.equal(result.isHealthy, false);
    assert.equal(result.error, "Request timeout - API not responding");
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth returns network error on fetch failure", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, _options: any) => {
    throw new Error("Failed to fetch");
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health" });

    assert.equal(result.isHealthy, false);
    assert.equal(result.error, "Network connectivity issues between client and server");
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth returns generic error message for other errors", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, _options: any) => {
    throw new Error("Some other error");
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health" });

    assert.equal(result.isHealthy, false);
    assert.equal(result.error, "Some other error");
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth returns unknown error for non-Error throws", async () => {
  setupGlobals();
  globalThis.fetch = async (_url: any, _options: any) => {
    throw "string error";
  };

  try {
    const result = await checkApiHealth({ endpoint: "/health" });

    assert.equal(result.isHealthy, false);
    assert.equal(result.error, "Unknown error occurred");
  } finally {
    teardownGlobals();
  }
});

test("checkApiHealth passes request headers", async () => {
  setupGlobals();
  let capturedHeaders: any = null;
  globalThis.fetch = async (_url: any, options: any) => {
    capturedHeaders = options.headers;
    return { ok: true, status: 200, statusText: "OK" } as Response;
  };

  try {
    await checkApiHealth({
      endpoint: "/health",
      requestHeaders: { Authorization: "Bearer token" },
    });

    assert.equal(capturedHeaders.Authorization, "Bearer token");
    assert.equal(capturedHeaders.Accept, "application/json");
  } finally {
    teardownGlobals();
  }
});

test("ApiHealthMonitor tracks check count", async () => {
  setupGlobals();
  let fetchResolve: () => void;
  const fetchCalled = new Promise<void>((resolve) => { fetchResolve = resolve; });
  globalThis.fetch = async () => {
    const res = { ok: true, status: 200, statusText: "OK" } as Response;
    fetchResolve();
    return res;
  };

  try {
    const monitor = new ApiHealthMonitor({ endpoint: "/health", checkIntervalMs: 1000 });

    assert.equal(monitor.getCheckCount(), 0);
    monitor.start();

    await fetchCalled;
    // Allow microtask queue to flush
    await Promise.resolve();

    assert.ok(monitor.getCheckCount() >= 1);
    monitor.stop();
  } finally {
    teardownGlobals();
  }
});

test("ApiHealthMonitor resetCheckCount resets to zero", async () => {
  setupGlobals();
  let fetchResolve: () => void;
  const fetchCalled = new Promise<void>((resolve) => { fetchResolve = resolve; });
  globalThis.fetch = async () => {
    const res = { ok: true, status: 200, statusText: "OK" } as Response;
    fetchResolve();
    return res;
  };

  try {
    const monitor = new ApiHealthMonitor({ endpoint: "/health", checkIntervalMs: 1000 });
    monitor.start();
    await fetchCalled;
    await Promise.resolve();

    monitor.resetCheckCount();
    assert.equal(monitor.getCheckCount(), 0);
    monitor.stop();
  } finally {
    teardownGlobals();
  }
});

test("ApiHealthMonitor does not start twice", async () => {
  setupGlobals();
  let fetchCount = 0;
  let fetchResolve: () => void;
  const fetchCalled = new Promise<void>((resolve) => { fetchResolve = resolve; });
  globalThis.fetch = async () => {
    fetchCount++;
    const res = { ok: true, status: 200, statusText: "OK" } as Response;
    fetchResolve();
    return res;
  };

  try {
    const monitor = new ApiHealthMonitor({ endpoint: "/health", checkIntervalMs: 5000 });
    monitor.start();
    monitor.start();
    await fetchCalled;
    await Promise.resolve();

    assert.equal(monitor.getCheckCount(), 1);
    monitor.stop();
  } finally {
    teardownGlobals();
  }
});

test("ApiHealthMonitor calls onStatusChange callback", async () => {
  setupGlobals();
  let fetchResolve: () => void;
  const fetchCalled = new Promise<void>((resolve) => { fetchResolve = resolve; });
  globalThis.fetch = async () => {
    const res = { ok: true, status: 200, statusText: "OK" } as Response;
    fetchResolve();
    return res;
  };

  try {
    const results: any[] = [];
    const monitor = new ApiHealthMonitor({
      endpoint: "/health",
      checkIntervalMs: 5000,
      onStatusChange: (result) => results.push(result),
    });

    monitor.start();
    await fetchCalled;
    // Allow onStatusChange to fire after the await chain
    await new Promise((resolve) => { queueMicrotask(() => resolve(undefined)); });

    assert.ok(results.length >= 1);
    assert.equal(results[0].isHealthy, true);
    monitor.stop();
  } finally {
    teardownGlobals();
  }
});
