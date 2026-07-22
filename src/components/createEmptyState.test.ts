/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyState } from "./createEmptyState.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createEmptyState renders framed section by default", () => {
  const ReactLike = createFakeReact();
  const EmptyState = createEmptyState(ReactLike);

  const element = EmptyState({
    title: "Nothing here",
    detail: "Add the first item.",
  });

  assert.equal(element.type, "section");
  assert.equal(element.props.className, "panel empty-panel");
  assert.equal((element.children[0] as { type: string }).type, "h3");
  assert.equal((element.children[1] as { type: string }).type, "p");
});

test("createEmptyState respects custom wrapper and class names", () => {
  const ReactLike = createFakeReact();
  const EmptyState = createEmptyState(ReactLike);

  const element = EmptyState({
    title: "Loading items",
    detail: "Reading records.",
    as: "div",
    framed: false,
    className: "custom-empty",
  });

  assert.equal(element.type, "div");
  assert.equal(element.props.className, "empty-panel custom-empty");
});
