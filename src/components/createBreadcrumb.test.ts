/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createBreadcrumb } from "./createBreadcrumb.js";
import { createFakeReact, type FakeElement } from "../testing/fakeReact.js";

function asElement(value: unknown): FakeElement {
  assert.ok(value && typeof value === "object");
  return value as FakeElement;
}

test("createBreadcrumb returns null for empty items", () => {
  const ReactLike = createFakeReact();
  const Breadcrumb = createBreadcrumb(ReactLike);

  assert.equal(Breadcrumb({ items: [] }), null);
});

test("createBreadcrumb renders current crumb without link", () => {
  const ReactLike = createFakeReact();
  const Breadcrumb = createBreadcrumb(ReactLike);

  const element = asElement(
    Breadcrumb({
      items: [
        { label: "Projects", to: "/projects" },
        { label: "Alpha" },
      ],
    }),
  );

  assert.equal(element.type, "nav");
  assert.equal(element.props["aria-label"], "Breadcrumb");
  assert.equal(element.props.className, "breadcrumb");

  const list = asElement(element.children[0]);
  const currentItem = asElement(list.children[2]);
  const current = asElement(currentItem.children[0]);

  assert.equal(current.type, "span");
  assert.equal(current.props.className, "breadcrumb-current");
  assert.equal(current.props["aria-current"], "page");
  assert.equal(current.children[0], "Alpha");
});

test("createBreadcrumb uses Link for to when provided", () => {
  const ReactLike = createFakeReact();
  const Link = "FakeLink";
  const Breadcrumb = createBreadcrumb(ReactLike, Link);

  const element = asElement(
    Breadcrumb({
      items: [
        { label: "Projects", to: "/projects" },
        { label: "Alpha" },
      ],
    }),
  );

  const list = asElement(element.children[0]);
  const firstItem = asElement(list.children[0]);
  const link = asElement(firstItem.children[0]);

  assert.equal(link.type, "FakeLink");
  assert.equal(link.props.to, "/projects");
  assert.equal(link.props.className, "breadcrumb-link");
  assert.equal(link.children[0], "Projects");
});

test("createBreadcrumb falls back to anchor when Link is missing", () => {
  const ReactLike = createFakeReact();
  const Breadcrumb = createBreadcrumb(ReactLike);

  const element = asElement(
    Breadcrumb({
      items: [
        { label: "Projects", to: "/projects" },
        { label: "Alpha" },
      ],
    }),
  );

  const list = asElement(element.children[0]);
  const firstItem = asElement(list.children[0]);
  const link = asElement(firstItem.children[0]);

  assert.equal(link.type, "a");
  assert.equal(link.props.href, "/projects");
});

test("createBreadcrumb inserts separators between crumbs", () => {
  const ReactLike = createFakeReact();
  const Breadcrumb = createBreadcrumb(ReactLike);

  const element = asElement(
    Breadcrumb({
      items: [
        { label: "Projects", to: "/projects" },
        { label: "Alpha", to: "/projects/1" },
        { label: "Cost" },
      ],
      separator: "/",
    }),
  );

  const list = asElement(element.children[0]);
  const separators = list.children.filter(
    (child) =>
      child &&
      typeof child === "object" &&
      String((child as FakeElement).props.className ?? "").includes(
        "breadcrumb-separator",
      ),
  ) as FakeElement[];

  assert.equal(separators.length, 2);
  assert.equal(separators[0]?.children[0], "/");
});
