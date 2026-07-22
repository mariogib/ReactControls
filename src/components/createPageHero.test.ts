/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createPageHero } from "./createPageHero.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createPageHero renders header with hero class", () => {
  const react = createFakeReact();
  const PageHero = createPageHero(react);

  const element = PageHero({
    eyebrow: "Dashboard",
    title: "Welcome",
    description: "Main page",
  });

  assert.equal(element.type, "header");
  assert.equal(element.props.className, "hero");
});

test("createPageHero renders eyebrow, title, and description", () => {
  const react = createFakeReact();
  const PageHero = createPageHero(react);

  const element = PageHero({
    eyebrow: "Section",
    title: "Page Title",
    description: "A description",
  });

  const contentDiv = element.children[0];
  const eyebrow = contentDiv.children[0];
  const h1 = contentDiv.children[1];
  const desc = contentDiv.children[2];

  assert.equal(eyebrow.type, "p");
  assert.equal(eyebrow.props.className, "eyebrow");
  assert.equal(eyebrow.children[0], "Section");
  assert.equal(h1.type, "h1");
  assert.equal(h1.children[0], "Page Title");
  assert.equal(desc.type, "p");
  assert.equal(desc.props.className, "hero-copy");
  assert.equal(desc.children[0], "A description");
});

test("createPageHero renders actions when provided", () => {
  const react = createFakeReact();
  const PageHero = createPageHero(react);

  const element = PageHero({
    eyebrow: "Dash",
    title: "Title",
    description: "Desc",
    actions: "Action buttons",
  });

  const actionsDiv = element.children[1];
  assert.equal(actionsDiv.type, "div");
  assert.equal(actionsDiv.props.className, "hero-actions");
  assert.equal(actionsDiv.children[0], "Action buttons");
});

test("createPageHero does not render actions div when actions not provided", () => {
  const react = createFakeReact();
  const PageHero = createPageHero(react);

  const element = PageHero({
    eyebrow: "Dash",
    title: "Title",
    description: "Desc",
  });

  const actionsDiv = element.children[1];
  assert.equal(actionsDiv, null);
});
