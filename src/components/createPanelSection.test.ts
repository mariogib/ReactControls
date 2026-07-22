/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createPanelSection } from "./createPanelSection.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createPanelSection renders section with panel class", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({ children: "Panel content" });

  assert.equal(element.type, "section");
  assert.equal(element.props.className, "panel");
});

test("createPanelSection renders children without header when no header props", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({ children: "Content" });

  assert.equal(element.children[0], null);
  assert.equal(element.children[1], "Content");
});

test("createPanelSection renders header with eyebrow and title", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({
    eyebrow: "Section",
    title: "Panel Title",
    children: "Body",
  });

  const header = element.children[0];
  assert.equal(header.type, "div");
  assert.equal(header.props.className, "panel-header");

  const titleGroup = header.children[0];
  const eyebrow = titleGroup.children[0];
  assert.equal(eyebrow.type, "p");
  assert.equal(eyebrow.props.className, "eyebrow");
  assert.equal(eyebrow.children[0], "Section");

  const h2 = titleGroup.children[1];
  assert.equal(h2.type, "h2");
  assert.equal(h2.children[0], "Panel Title");
});

test("createPanelSection renders actions when provided", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({
    title: "Title",
    actions: "Action buttons",
    children: "Body",
  });

  const header = element.children[0];
  const actionsDiv = header.children[1];
  assert.equal(actionsDiv.type, "div");
  assert.equal(actionsDiv.props.className, "panel-actions");
  assert.equal(actionsDiv.children[0], "Action buttons");
});

test("createPanelSection renders meta when provided without actions", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({
    title: "Title",
    meta: "Updated 2 hours ago",
    children: "Body",
  });

  const header = element.children[0];
  const metaDiv = header.children[1];
  assert.equal(metaDiv.type, "div");
  assert.equal(metaDiv.props.className, "panel-meta");
  assert.equal(metaDiv.children[0], "Updated 2 hours ago");
});

test("createPanelSection uses compact class when compact is true", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({
    title: "Title",
    compact: true,
    children: "Body",
  });

  const header = element.children[0];
  assert.equal(header.props.className, "panel-header compact");
});

test("createPanelSection does not render eyebrow when not provided", () => {
  const react = createFakeReact();
  const PanelSection = createPanelSection(react);

  const element = PanelSection({
    title: "Only Title",
    children: "Body",
  });

  const header = element.children[0];
  const titleGroup = header.children[0];
  assert.equal(titleGroup.children[0], null);
  assert.equal(titleGroup.children[1].children[0], "Only Title");
});
