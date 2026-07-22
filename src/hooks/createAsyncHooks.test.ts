/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createAsyncHooks } from "./createAsyncHooks.js";

function createMockReact() {
  const effects: Array<() => void | (() => void)> = [];
  return {
    useState<T>(initialState: T | (() => T)): [T, (action: T | ((prev: T) => T)) => void] {
      let value: T = typeof initialState === "function" ? (initialState as () => T)() : initialState;
      const setter = (action: T | ((prev: T) => T)) => {
        value = typeof action === "function" ? (action as (prev: T) => T)(value) : action;
      };
      return [value, setter];
    },
    useRef<T>(initialValue: T): { current: T } {
      return { current: initialValue };
    },
    useEffect(effect: () => void | (() => void), _deps?: readonly unknown[]): void {
      effects.push(effect);
    },
    useCallback<T extends (...args: any[]) => any>(callback: T, _deps: readonly unknown[]): T {
      return callback;
    },
    _effects: effects,
  };
}

test("createAsyncHooks returns all four hook functions", () => {
  const react = createMockReact();
  const hooks = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Something went wrong",
  });

  assert.equal(typeof hooks.useAsync, "function");
  assert.equal(typeof hooks.useAsyncValue, "function");
  assert.equal(typeof hooks.useAsyncList, "function");
  assert.equal(typeof hooks.useAsyncMutation, "function");
});

test("useAsyncValue returns initial state shape", () => {
  const react = createMockReact();
  const { useAsyncValue } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = useAsyncValue(async () => "test-data", [], { immediate: false });

  assert.equal(result.data, null);
  assert.equal(result.loading, false);
  assert.equal(result.error, null);
  assert.equal(typeof result.refresh, "function");
  assert.equal(typeof result.retry, "function");
  assert.equal(typeof result.setData, "function");
  assert.equal(typeof result.setError, "function");
});

test("useAsyncValue sets loading to true when immediate is true", () => {
  const react = createMockReact();
  const { useAsyncValue } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = useAsyncValue(async () => "data", [], { immediate: true });

  assert.equal(result.loading, true);
});

test("useAsyncValue uses initialData when provided", () => {
  const react = createMockReact();
  const { useAsyncValue } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = useAsyncValue(async () => "new-data", [], {
    initialData: "initial-data",
    immediate: false,
  });

  assert.equal(result.data, "initial-data");
});

test("useAsyncList returns items array from initialItems", () => {
  const react = createMockReact();
  const { useAsyncList } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = useAsyncList(async () => ["a", "b"], [], {
    initialItems: ["x", "y"],
    immediate: false,
  });

  assert.deepEqual(result.items, ["x", "y"]);
  assert.equal(result.loading, false);
  assert.equal(result.error, null);
  assert.equal(typeof result.setItems, "function");
});

test("useAsyncList defaults to empty items array", () => {
  const react = createMockReact();
  const { useAsyncList } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = useAsyncList(async () => ["a"], [], { immediate: false });

  assert.deepEqual(result.items, []);
});

test("useAsyncMutation returns initial state shape", () => {
  const react = createMockReact();
  const { useAsyncMutation } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Mutation failed",
  });

  const result = useAsyncMutation();

  assert.equal(result.loading, false);
  assert.equal(result.error, null);
  assert.equal(typeof result.run, "function");
  assert.equal(typeof result.setError, "function");
});

test("useAsyncMutation run executes operation and returns result", async () => {
  const react = createMockReact();
  const { useAsyncMutation } = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Mutation failed",
  });

  const { run } = useAsyncMutation();
  const result = await run(async () => "success");

  assert.equal(result, "success");
});

test("useAsyncMutation run throws on error and sets error message", async () => {
  const react = createMockReact();
  const errors: string[] = [];
  const { useAsyncMutation } = createAsyncHooks({
    react,
    getErrorMessage: (_err, fallback) => fallback,
    defaultErrorMessage: "Default error",
  });

  const { run, setError } = useAsyncMutation("Custom error");

  await assert.rejects(
    () => run(async () => { throw new Error("boom"); }),
    { message: "boom" },
  );
});

test("useAsync is an alias for useAsyncValue", () => {
  const react = createMockReact();
  const hooks = createAsyncHooks({
    react,
    getErrorMessage: (err, fallback) => fallback,
    defaultErrorMessage: "Error",
  });

  const result = hooks.useAsync(async () => "data", [], { immediate: false });
  assert.equal(result.data, null);
  assert.equal(typeof result.refresh, "function");
});
