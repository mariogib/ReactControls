/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createThemeContext } from "./createThemeContext.js";

type FakeContext<T> = {
  _value: T;
  Provider: { __context: FakeContext<T> };
};

function createFakeThemeReact() {
  const effects: Array<() => void | (() => void)> = [];

  return {
    effects,
    Fragment: "Fragment",
    useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
      const value = typeof initialState === "function" ? (initialState as () => T)() : initialState;
      let state = value;
      return [state, (next) => {
        state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      }];
    },
    useEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
    useCallback<T extends (...args: any[]) => any>(callback: T): T {
      return callback;
    },
    useRef<T>(initialValue: T): { current: T } {
      return { current: initialValue };
    },
    useContext<T>(context: FakeContext<T>): T {
      return context._value;
    },
    createContext<T>(value: T): FakeContext<T> {
      const context: FakeContext<T> = {
        _value: value,
        Provider: { __context: undefined as unknown as FakeContext<T> },
      };
      context.Provider.__context = context;
      return context;
    },
    createElement(type: any, props?: Record<string, unknown> | null, ...children: any[]) {
      if (type && type.__context && props && "value" in props) {
        type.__context._value = props.value as any;
      }

      return { type, props: props ?? {}, children };
    },
  };
}

test("createThemeContext exposes default loading state via useTheme", () => {
  const react = createFakeThemeReact();
  const { useTheme } = createThemeContext(react as any, {
    loadThemeByUrl: async () => ({ isDefault: true }),
    applyThemeVariables: () => {},
    updateFavicon: () => {},
    updateDocumentTitle: () => {},
    getDefaultTheme: () => ({ isDefault: true }),
  });

  const state = useTheme();

  assert.equal(state.loading, true);
  assert.equal(state.error, null);
  assert.equal(state.theme, null);
});

test("ThemeProvider triggers theme load using window origin", async () => {
  const react = createFakeThemeReact();
  const calls: string[] = [];
  const originalWindow = (globalThis as any).window;

  (globalThis as any).window = {
    location: { origin: "https://tenant.test" },
  };

  const { ThemeProvider } = createThemeContext(react as any, {
    loadThemeByUrl: async (appUrl) => {
      calls.push(`load:${appUrl}`);
      return { isDefault: false, companyName: "Tenant" };
    },
    applyThemeVariables: () => calls.push("apply"),
    updateFavicon: () => calls.push("favicon"),
    updateDocumentTitle: (_theme, title) => calls.push(`title:${title ?? ""}`),
    getDefaultTheme: () => ({ isDefault: true }),
    baseTitle: "Digital Prizes",
    removeLoadingOverlay: false,
  });

  ThemeProvider({ children: null });

  for (const effect of react.effects) {
    effect();
  }

  await Promise.resolve();
  await Promise.resolve();

  assert.equal(calls[0], "load:https://tenant.test");
  assert.ok(calls.includes("apply"));
  assert.ok(calls.includes("favicon"));
  assert.ok(calls.includes("title:Digital Prizes"));

  (globalThis as any).window = originalWindow;
});
