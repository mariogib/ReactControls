/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createUseJsonBackedState } from "./createUseJsonBackedState.js";

function createFakeReactForJsonState() {
  return {
    useState<T>(initialState: T | (() => T)): [T, (action: T | ((prev: T) => T)) => void] {
      const value: T = typeof initialState === "function" ? (initialState as () => T)() : initialState;
      const setValue = (_action: T | ((prev: T) => T)) => {};
      return [value, setValue];
    },
    useEffect(_effect: () => void | (() => void), _deps?: readonly unknown[]): void {},
  };
}

test("useJsonBackedState parses valid JSON on init", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState('{"key":"value"}', () => ({}));
  assert.deepEqual(value, { key: "value" });
});

test("useJsonBackedState uses fallback when sourceJson is null", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState(null, () => ({ fallback: true }));
  assert.deepEqual(value, { fallback: true });
});

test("useJsonBackedState uses fallback when sourceJson is undefined", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState(undefined, () => ({ fallback: true }));
  assert.deepEqual(value, { fallback: true });
});

test("useJsonBackedState uses fallback when sourceJson is invalid JSON", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState("not valid json{", () => ({ defaulted: true }));
  assert.deepEqual(value, { defaulted: true });
});

test("useJsonBackedState uses fallback for empty string", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState("", () => ({ empty: true }));
  assert.deepEqual(value, { empty: true });
});

test("useJsonBackedState parses array JSON", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [value] = useJsonBackedState('[1,2,3]', () => ([]));
  assert.deepEqual(value, [1, 2, 3]);
});

test("useJsonBackedState returns a setter function", () => {
  const react = createFakeReactForJsonState();
  const useJsonBackedState = createUseJsonBackedState(react);
  const [, setValue] = useJsonBackedState('{"x":1}', () => ({}));
  assert.equal(typeof setValue, "function");
});
