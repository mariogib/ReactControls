import test from "node:test";
import assert from "node:assert/strict";
import { createFluentNavIcon, createFluentNavIcons } from "./fluentNavIcons.js";

type FakeNode = {
  type: any;
  props: Record<string, unknown>;
  children: unknown[];
};

function createFakeReact() {
  return {
    createElement(type: any, props: Record<string, unknown> | null, ...children: unknown[]): FakeNode {
      return { type, props: props ?? {}, children };
    },
  };
}

test("createFluentNavIcon renders an SVG with currentColor stroke", () => {
  const react = createFakeReact();
  const icon = createFluentNavIcon(react, "M1 1h1", "Demo") as FakeNode;
  assert.equal(icon.type, "svg");
  assert.equal(icon.props.className, "fluent-nav-icon");
  assert.equal(icon.props.viewBox, "0 0 20 20");
  const path = icon.children.find(
    (child) => child && typeof child === "object" && (child as FakeNode).type === "path",
  ) as FakeNode;
  assert.ok(path);
  assert.equal(path.props.stroke, "currentColor");
  assert.equal(path.props.strokeWidth, 1.5);
});

test("createFluentNavIcons exposes dashboard glyphs", () => {
  const icons = createFluentNavIcons(createFakeReact());
  assert.ok(icons.overview);
  assert.ok(icons.projects);
  assert.ok(icons.settings);
  assert.ok(icons.help);
});
