import test from "node:test";
import assert from "node:assert/strict";
import { createThemeButton } from "./createThemeButton.js";
import { MIDNIGHT_THEME_PRESET, LUNARQ_THEME_PRESET } from "./themePresets.js";

type FakeNode = {
  type: any;
  props: Record<string, unknown>;
  children: unknown[];
};

function createFakeReact() {
  let stateSlot = 0;
  const states: unknown[] = [];
  const effects: Array<() => void | (() => void)> = [];

  const react = {
    useState<T>(initial: T | (() => T)): [T, (value: T | ((current: T) => T)) => void] {
      const index = stateSlot++;
      if (states[index] === undefined) {
        states[index] = typeof initial === "function" ? (initial as () => T)() : initial;
      }
      return [
        states[index] as T,
        (value) => {
          states[index] =
            typeof value === "function" ? (value as (current: T) => T)(states[index] as T) : value;
        },
      ];
    },
    useEffect(effect: () => void | (() => void)) {
      effects.push(effect);
    },
    useRef: <T>(initial: T) => ({ current: initial }),
    createElement(type: any, props: Record<string, unknown> | null, ...children: unknown[]): FakeNode {
      return { type, props: props ?? {}, children };
    },
  };

  return {
    react,
    flushEffects() {
      for (const effect of effects.splice(0)) {
        effect();
      }
    },
    resetRender() {
      stateSlot = 0;
      effects.length = 0;
    },
  };
}

function collectText(node: unknown): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join("");
  }
  if (typeof node === "object" && node && "children" in node) {
    return collectText((node as FakeNode).children);
  }
  return "";
}

function findByClass(node: FakeNode, className: string): FakeNode | null {
  const current = typeof node.props.className === "string" ? node.props.className : "";
  if (current.split(/\s+/).includes(className)) {
    return node;
  }

  for (const child of node.children) {
    if (child && typeof child === "object" && "props" in (child as FakeNode)) {
      const match = findByClass(child as FakeNode, className);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

function findOptionByLabel(menu: FakeNode, label: string): FakeNode | null {
  for (const child of menu.children) {
    if (!child || typeof child !== "object") {
      continue;
    }
    const option = child as FakeNode;
    if (collectText(option).includes(label)) {
      return option;
    }
  }
  return null;
}

test("createThemeButton renders current theme label and opens menu options", () => {
  const { react, flushEffects, resetRender } = createFakeReact();
  const applied: string[] = [];
  const ThemeButton = createThemeButton(react as any, {
    themes: [LUNARQ_THEME_PRESET, MIDNIGHT_THEME_PRESET],
    defaultThemeId: "lunarq",
    storageKey: null,
    applyTheme: (theme) => applied.push(theme.primaryColor),
  });

  resetRender();
  const first = ThemeButton({}) as FakeNode;
  flushEffects();
  assert.equal(applied[0], "#f97316");

  const trigger = findByClass(first, "theme-button-trigger");
  assert.ok(trigger);
  assert.match(collectText(trigger), /LunarQ/);

  (trigger?.props.onClick as () => void)();
  resetRender();
  const openTree = ThemeButton({}) as FakeNode;
  const menu = findByClass(openTree, "theme-button-menu");
  assert.ok(menu);

  const midnightOption = findOptionByLabel(menu as FakeNode, "Midnight");
  assert.ok(midnightOption);
  (midnightOption?.props.onClick as () => void)();
  assert.equal(applied.at(-1), "#3fb950");
});
