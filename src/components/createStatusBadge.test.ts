/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createStatusBadge } from "./createStatusBadge.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createStatusBadge renders span with normalized status class", () => {
  const react = createFakeReact();
  const StatusBadge = createStatusBadge(react);

  const element = StatusBadge({ status: "Active" });

  assert.equal(element.type, "span");
  assert.equal(element.props.className, "status-badge status-active");
  assert.equal(element.children[0], "Active");
});

test("createStatusBadge normalizes uppercase status to lowercase class", () => {
  const react = createFakeReact();
  const StatusBadge = createStatusBadge(react);

  const element = StatusBadge({ status: "PENDING" });

  assert.equal(element.props.className, "status-badge status-pending");
  assert.equal(element.children[0], "PENDING");
});

test("createStatusBadge handles already lowercase status", () => {
  const react = createFakeReact();
  const StatusBadge = createStatusBadge(react);

  const element = StatusBadge({ status: "completed" });

  assert.equal(element.props.className, "status-badge status-completed");
  assert.equal(element.children[0], "completed");
});

test("createStatusBadge handles mixed-case status", () => {
  const react = createFakeReact();
  const StatusBadge = createStatusBadge(react);

  const element = StatusBadge({ status: "In Progress" });

  assert.equal(element.props.className, "status-badge status-in-progress");
  assert.equal(element.children[0], "In Progress");
});
