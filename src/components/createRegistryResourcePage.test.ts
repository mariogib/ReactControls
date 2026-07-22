/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createRegistryResourcePage } from "./createRegistryResourcePage.js";
import { createFakeReact } from "../testing/fakeReact.js";

test("createRegistryResourcePage wires editor and table state into CrudRegistryPage", () => {
  const ReactLike = createFakeReact();
  const RegistryResourcePage = createRegistryResourcePage(ReactLike, {
    CrudRegistryPage: "CrudRegistryPage",
    DataTable: "DataTable",
    EmptyState: "EmptyState",
    EntityModalForm: "EntityModalForm",
    PanelSection: "PanelSection",
    StatusMessage: "StatusMessage",
  });

  const element = RegistryResourcePage({
    eyebrow: "Registry",
    title: "Suppliers",
    description: "Manage suppliers",
    errorTitle: "Supplier error",
    error: null,
    isFormOpen: true,
    editorTitle: "Edit Supplier",
    onClose: () => undefined,
    onSubmit: async () => undefined,
    editorContent: "Editor body",
    saving: false,
    submitLabel: "Save",
    sectionEyebrow: "Stored",
    sectionTitle: "Rows",
    sectionMeta: "1 row",
    loading: false,
    isEmpty: false,
    emptyTitle: "No rows",
    emptyDetail: "Create the first row.",
    headers: ["Name"],
    rows: "row-data",
  });

  assert.equal(element.type, "CrudRegistryPage");
  assert.ok(element.props.editor);
  assert.equal((element.props.editor as { type: string }).type, "EntityModalForm");
});

test("createRegistryResourcePage uses EmptyState when resource list is empty", () => {
  const ReactLike = createFakeReact();
  const RegistryResourcePage = createRegistryResourcePage(ReactLike, {
    CrudRegistryPage: "CrudRegistryPage",
    DataTable: "DataTable",
    EmptyState: "EmptyState",
    EntityModalForm: "EntityModalForm",
    PanelSection: "PanelSection",
    StatusMessage: "StatusMessage",
  });

  const element = RegistryResourcePage({
    eyebrow: "Registry",
    title: "Suppliers",
    description: "Manage suppliers",
    errorTitle: "Supplier error",
    error: null,
    isFormOpen: false,
    editorTitle: "Edit Supplier",
    onClose: () => undefined,
    onSubmit: () => undefined,
    editorContent: "Editor body",
    saving: false,
    submitLabel: "Save",
    sectionEyebrow: "Stored",
    sectionTitle: "Rows",
    sectionMeta: "0 rows",
    loading: false,
    isEmpty: true,
    emptyTitle: "No suppliers stored yet",
    emptyDetail: "Create the first supplier before adding supplier-backed prizes.",
    headers: ["Name"],
    rows: "row-data",
  });

  const body = element.children[0] as { type: string; children: unknown[] };
  const panel = body.children[0] as { type: string; children: unknown[] };
  const emptyState = panel.children[0] as { type: string };

  assert.equal(emptyState.type, "EmptyState");
});
