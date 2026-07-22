/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createStatusMessage } from "./createStatusMessage.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createStatusMessage renders section with info tone by default", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({ title: "Info Title", detail: "Some detail" });

  assert.equal(element.type, "section");
  assert.equal(element.props.className, "status-message status-info");
  assert.equal(element.props.role, "status");
});

test("createStatusMessage uses alert role for error tone", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({ title: "Error", detail: "Something broke", tone: "error" });

  assert.equal(element.props.className, "status-message status-error");
  assert.equal(element.props.role, "alert");
});

test("createStatusMessage uses alert role for warning tone", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({ title: "Warning", detail: "Be careful", tone: "warning" });

  assert.equal(element.props.className, "status-message status-warning");
  assert.equal(element.props.role, "alert");
});

test("createStatusMessage uses status role for success tone", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({ title: "Done", detail: "All good", tone: "success" });

  assert.equal(element.props.className, "status-message status-success");
  assert.equal(element.props.role, "status");
});

test("createStatusMessage appends custom className", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({
    title: "Title",
    detail: "Detail",
    tone: "info",
    className: "custom-class",
  });

  assert.equal(element.props.className, "status-message status-info custom-class");
});

test("createStatusMessage renders title in h3 and detail in p", () => {
  const react = createFakeReact();
  const StatusMessage = createStatusMessage(react);

  const element = StatusMessage({ title: "My Title", detail: "My Detail" });

  const h3 = element.children[0];
  const p = element.children[1];
  assert.equal(h3.type, "h3");
  assert.equal(h3.children[0], "My Title");
  assert.equal(p.type, "p");
  assert.equal(p.children[0], "My Detail");
});
