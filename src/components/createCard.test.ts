/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createCard } from "./createCard.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createCard renders div with card class and children", () => {
  const react = createFakeReact();
  const Card = createCard(react);

  const element = Card({ children: "Card content" });

  assert.equal(element.type, "div");
  assert.equal(element.props.className, "card");
  assert.equal(element.children[0], "Card content");
});

test("createCard appends custom className", () => {
  const react = createFakeReact();
  const Card = createCard(react);

  const element = Card({ children: "Content", className: "highlight" });

  assert.equal(element.props.className, "card highlight");
});

test("createCard adds onClick handler and cursor pointer when onClick provided", () => {
  const react = createFakeReact();
  const Card = createCard(react);
  const handler = () => {};

  const element = Card({ children: "Clickable", onClick: handler });

  assert.equal(element.props.onClick, handler);
  assert.deepEqual(element.props.style, { cursor: "pointer" });
});

test("createCard does not add onClick or style when onClick not provided", () => {
  const react = createFakeReact();
  const Card = createCard(react);

  const element = Card({ children: "Static" });

  assert.equal(element.props.onClick, undefined);
  assert.equal(element.props.style, undefined);
});

test("createCard trims className when custom class is empty", () => {
  const react = createFakeReact();
  const Card = createCard(react);

  const element = Card({ children: "Content", className: "" });

  assert.equal(element.props.className, "card");
});
