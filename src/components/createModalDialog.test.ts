/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createModalDialog } from "./createModalDialog.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createModalDialog renders overlay with dialog role", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({ title: "Test Modal", children: "Body content" });

  assert.equal(element.type, "div");
  assert.equal(element.props.className, "modal-overlay");
  assert.equal(element.props.role, "dialog");
  assert.equal(element.props["aria-modal"], true);
});

test("createModalDialog renders title in h2", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({ title: "My Title", children: "Body" });

  const content = element.children[0];
  const header = content.children[0];
  const titleDiv = header.children[0];
  const h2 = titleDiv.children[0];

  assert.equal(h2.type, "h2");
  assert.equal(h2.children[0], "My Title");
});

test("createModalDialog renders subtitle when provided", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({ title: "Title", subtitle: "Sub", children: "Body" });

  const content = element.children[0];
  const header = content.children[0];
  const titleDiv = header.children[0];
  const subtitle = titleDiv.children[1];

  assert.equal(subtitle.type, "p");
  assert.equal(subtitle.props.className, "page-subtitle");
  assert.equal(subtitle.children[0], "Sub");
});

test("createModalDialog shows close button when onClose provided", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);
  const onClose = () => {};

  const element = ModalDialog({ title: "Title", children: "Body", onClose });

  const content = element.children[0];
  const header = content.children[0];
  const actions = header.children[1];
  const closeBtn = actions.children[1];

  assert.equal(actions.props.className, "modal-header-actions");
  assert.equal(closeBtn.type, "button");
  assert.equal(closeBtn.props["aria-label"], "Close dialog");
  assert.equal(closeBtn.props.onClick, onClose);
});

test("createModalDialog hides close button when showCloseButton is false", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({
    title: "Title",
    children: "Body",
    onClose: () => {},
    showCloseButton: false,
  });

  const content = element.children[0];
  const header = content.children[0];
  const actions = header.children[1];

  assert.equal(actions, null);
});

test("createModalDialog renders headerActions before close button", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({
    title: "Title",
    children: "Body",
    onClose: () => {},
    headerActions: "Maximize",
  });

  const content = element.children[0];
  const header = content.children[0];
  const actions = header.children[1];

  assert.equal(actions.props.className, "modal-header-actions");
  assert.equal(actions.children[0], "Maximize");
  assert.equal(actions.children[1].type, "button");
});

test("createModalDialog renders footer when provided", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({ title: "Title", children: "Body", footer: "Footer content" });

  const content = element.children[0];
  const footer = content.children[2];

  assert.equal(footer.type, "div");
  assert.equal(footer.props.className, "modal-footer");
  assert.equal(footer.children[0], "Footer content");
});

test("createModalDialog does not render footer when not provided", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({ title: "Title", children: "Body" });

  const content = element.children[0];
  const footer = content.children[2];

  assert.equal(footer, null);
});

test("createModalDialog applies custom class names", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({
    title: "Title",
    children: "Body",
    contentClassName: "wide",
    bodyClassName: "scrollable",
    headerClassName: "sticky",
    footerClassName: "right-align",
    footer: "Actions",
  });

  const content = element.children[0];
  assert.equal(content.props.className, "modal-content wide");

  const header = content.children[0];
  assert.equal(header.props.className, "modal-header sticky");

  const body = content.children[1];
  assert.equal(body.props.className, "modal-body scrollable");

  const footer = content.children[2];
  assert.equal(footer.props.className, "modal-footer right-align");
});

test("createModalDialog uses custom close label", () => {
  const react = createFakeReact();
  const ModalDialog = createModalDialog(react);

  const element = ModalDialog({
    title: "Title",
    children: "Body",
    onClose: () => {},
    closeLabel: "Dismiss",
  });

  const content = element.children[0];
  const header = content.children[0];
  const actions = header.children[1];
  const closeBtn = actions.children[1];

  assert.equal(closeBtn.props["aria-label"], "Dismiss");
});
