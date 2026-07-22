/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createTextLink } from "./createTextLink.js";
import { createFakeReact, type FakeElement } from "../testing/fakeReact.js";

function asElement(value: unknown): FakeElement {
  assert.ok(value && typeof value === "object");
  return value as FakeElement;
}

test("createTextLink uses router Link when to is provided", () => {
  const ReactLike = createFakeReact();
  const TextLink = createTextLink(ReactLike, "FakeRouterLink");

  const element = asElement(
    TextLink({
      to: "/projects",
      children: "Projects",
    }),
  );

  assert.equal(element.type, "FakeRouterLink");
  assert.equal(element.props.to, "/projects");
  assert.equal(
    element.props.className,
    "text-link text-link-accent text-link-underline-hover",
  );
  assert.equal(element.children[0], "Projects");
});

test("createTextLink falls back to anchor for href", () => {
  const ReactLike = createFakeReact();
  const TextLink = createTextLink(ReactLike);

  const element = asElement(
    TextLink({
      href: "https://example.com",
      external: true,
      children: "Docs",
      variant: "muted",
    }),
  );

  assert.equal(element.type, "a");
  assert.equal(element.props.href, "https://example.com");
  assert.equal(element.props.target, "_blank");
  assert.equal(element.props.rel, "noopener noreferrer");
  assert.equal(
    element.props.className,
    "text-link text-link-muted text-link-underline-hover",
  );
});

test("createTextLink renders button when no destination is provided", () => {
  const ReactLike = createFakeReact();
  const TextLink = createTextLink(ReactLike);
  let clicked = false;

  const element = asElement(
    TextLink({
      children: "Action",
      underline: "always",
      onClick: () => {
        clicked = true;
      },
    }),
  );

  assert.equal(element.type, "button");
  assert.equal(element.props.type, "button");
  assert.equal(
    element.props.className,
    "text-link text-link-accent text-link-underline-always",
  );
  (element.props.onClick as () => void)();
  assert.equal(clicked, true);
});

test("createTextLink disables navigation when disabled", () => {
  const ReactLike = createFakeReact();
  const TextLink = createTextLink(ReactLike, "FakeRouterLink");

  const element = asElement(
    TextLink({
      to: "/projects",
      disabled: true,
      children: "Projects",
    }),
  );

  assert.equal(element.type, "span");
  assert.equal(element.props.href, undefined);
  assert.equal(element.props.to, undefined);
  assert.equal(element.props["aria-disabled"], true);
  assert.match(String(element.props.className), /text-link-disabled/);
});
