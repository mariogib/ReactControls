/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createButton } from "./createButton.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createButton applies variant and custom class", () => {
  const ReactLike = createFakeReact();
  const Button = createButton(ReactLike);

  const element = Button({
    children: "Save",
    variant: "secondary",
    className: "extra-class",
    disabled: true,
  });

  assert.equal(element.type, "button");
  assert.equal(element.props.className, "secondary-btn extra-class");
  assert.equal(element.props.disabled, true);
  assert.equal(element.children[0], "Save");
});

test("createButton defaults to primary variant and button type", () => {
  const ReactLike = createFakeReact();
  const Button = createButton(ReactLike);

  const element = Button({ children: "Submit" });

  assert.equal(element.props.className, "primary-btn");
  assert.equal(element.props.type, "button");
});
