/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createUseFormChange } from "./useFormChange.js";

// Minimal DOM stubs for Node.js
class FakeHTMLInputElement {
  name: string;
  type: string;
  value: string;
  checked: boolean;

  constructor(attrs: { name: string; type: string; value?: string; checked?: boolean }) {
    this.name = attrs.name;
    this.type = attrs.type;
    this.value = attrs.value ?? "";
    this.checked = attrs.checked ?? false;
  }
}

// Inject HTMLInputElement globally for instanceof checks
(globalThis as any).HTMLInputElement = FakeHTMLInputElement;

function createFakeReactCallback() {
  return {
    useCallback<T extends (...args: any[]) => any>(callback: T, _deps: readonly unknown[]): T {
      return callback;
    },
  };
}

test("useFormChange sets text input value on form state", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { name: "", age: 0 };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const handleChange = useFormChange<typeof formData>(setFormData);

  const target = new FakeHTMLInputElement({ name: "name", type: "text", value: "Alice" });
  handleChange({ target: target as any });

  assert.equal(formData.name, "Alice");
});

test("useFormChange handles checkbox inputs", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { active: false };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const target = new FakeHTMLInputElement({ name: "active", type: "checkbox", checked: true });
  const handleChange = useFormChange<typeof formData>(setFormData);
  handleChange({ target: target as any });

  assert.equal(formData.active, true);
});

test("useFormChange coerces number inputs when option enabled", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { count: 0 };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const target = new FakeHTMLInputElement({ name: "count", type: "number", value: "42" });
  const handleChange = useFormChange<typeof formData>(setFormData, { coerceNumberInputs: true });
  handleChange({ target: target as any });

  assert.equal(formData.count, 42);
});

test("useFormChange defaults to 0 for non-numeric number input value", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { count: 5 };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const target = new FakeHTMLInputElement({ name: "count", type: "number", value: "abc" });
  const handleChange = useFormChange<typeof formData>(setFormData, { coerceNumberInputs: true });
  handleChange({ target: target as any });

  assert.equal(formData.count, 0);
});

test("useFormChange uses custom field parser when provided", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { tags: "" };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const handleChange = useFormChange<typeof formData>(setFormData, {
    fieldParsers: {
      tags: (value) => String(value).toUpperCase(),
    },
  });

  const target = new FakeHTMLInputElement({ name: "tags", type: "text", value: "hello" });
  handleChange({ target: target as any });

  assert.equal(formData.tags, "HELLO");
});

test("useFormChange calls onFieldChange callback", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { email: "" };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };
  const changedFields: string[] = [];

  const handleChange = useFormChange<typeof formData>(setFormData, {
    onFieldChange: (fieldName) => changedFields.push(fieldName),
  });

  const target = new FakeHTMLInputElement({ name: "email", type: "text", value: "test@example.com" });
  handleChange({ target: target as any });

  assert.deepEqual(changedFields, ["email"]);
});

test("useFormChange accepts legacy fieldParsers object directly", () => {
  const react = createFakeReactCallback();
  const useFormChange = createUseFormChange(react);
  let formData = { score: "" };
  const setFormData = (action: any) => {
    formData = typeof action === "function" ? action(formData) : action;
  };

  const handleChange = useFormChange<typeof formData>(setFormData, {
    score: (value) => `parsed:${value}`,
  });

  const target = new FakeHTMLInputElement({ name: "score", type: "text", value: "10" });
  handleChange({ target: target as any });

  assert.equal(formData.score, "parsed:10");
});
