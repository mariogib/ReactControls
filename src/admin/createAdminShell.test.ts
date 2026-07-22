/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createAdminShell } from "./createAdminShell.js";

type FakeNode = {
  type: any;
  props: Record<string, unknown>;
  children: unknown[];
};

function createFakeReact() {
  let stateSlot = 0;
  const states: unknown[] = [];

  return {
    Fragment: "Fragment",
    useState<T>(initial: T | (() => T)): [T, (value: T | ((current: T) => T)) => void] {
      const index = stateSlot++;
      if (states[index] === undefined) {
        states[index] = typeof initial === "function" ? (initial as () => T)() : initial;
      }
      return [
        states[index] as T,
        (value) => {
          states[index] =
            typeof value === "function"
              ? (value as (current: T) => T)(states[index] as T)
              : value;
        },
      ];
    },
    createElement(
      type: any,
      props: Record<string, unknown> | null,
      ...children: unknown[]
    ): FakeNode {
      return { type, props: props ?? {}, children };
    },
  };
}

function findByClass(root: FakeNode, className: string): FakeNode | null {
  if (String(root.props.className ?? "").split(/\s+/).includes(className)) {
    return root;
  }
  for (const child of root.children) {
    if (child && typeof child === "object" && "props" in (child as FakeNode)) {
      const match = findByClass(child as FakeNode, className);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

test("createAdminShell renders open sidebar by default with toggle", () => {
  const react = createFakeReact();
  const AdminShell = createAdminShell(react, "FakeNavLink");

  const element = AdminShell({
    navItems: [{ to: "/app", end: true, label: "Overview", icon: "⌂" }],
    logo: "Logo",
    userName: "Admin",
    userEmail: "admin@lunarq.com",
    onSignOut: () => undefined,
    children: "Content",
  }) as FakeNode;

  assert.equal(element.props.className, "admin-layout");
  const toggle = findByClass(element, "sidebar-toggle-btn");
  assert.ok(toggle);
  assert.equal(toggle?.props["aria-expanded"], true);
  assert.equal(toggle?.props["aria-controls"], "admin-sidebar");
  const closeBtn = findByClass(element, "sidebar-close-btn");
  assert.ok(closeBtn);
  assert.equal(closeBtn?.props["aria-label"], "Close menu");
});

test("createAdminShell can collapse the sidebar to an icon rail", () => {
  const react = createFakeReact();
  const AdminShell = createAdminShell(react, "FakeNavLink");

  const element = AdminShell({
    navItems: [{ to: "/app", end: true, label: "Overview", icon: "⌂" }],
    logo: "Logo",
    userName: "Admin",
    userEmail: "admin@lunarq.com",
    onSignOut: () => undefined,
    children: "Content",
    sidebarOpen: false,
  }) as FakeNode;

  assert.equal(element.props.className, "admin-layout sidebar-collapsed");
  const toggle = findByClass(element, "sidebar-toggle-btn");
  assert.equal(toggle?.props["aria-expanded"], false);
  assert.match(String(toggle?.props["aria-label"]), /Expand/i);
  assert.ok(findByClass(element, "sidebar-close-btn"));
});
