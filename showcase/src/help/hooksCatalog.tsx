import React from "react";
import {
  createAsyncHooks,
  createButton,
  createFormFields,
  createStatusMessage,
  createUseFormData,
  createUseFormChange,
  createUseJsonBackedState,
  createUseFilteredReport,
  getErrorMessage,
} from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const Button = createButton(React);
const StatusMessage = createStatusMessage(React);
const { TextField } = createFormFields(React);

const { useAsyncValue, useAsyncList, useAsyncMutation } = createAsyncHooks({
  react: React,
  getErrorMessage,
  defaultErrorMessage: "Request failed",
});
const useFormData = createUseFormData(React);
const useFormChange = createUseFormChange(React);
const useJsonBackedState = createUseJsonBackedState(React);
const useFilteredReport = createUseFilteredReport(React, useAsyncList);

function UseAsyncValueExample() {
  const { data, loading, error, refresh } = useAsyncValue(
    async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      return { message: "Loaded from async hook" };
    },
    [],
    { immediate: true },
  );

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      {loading ? <p className="showcase-copy">Loading…</p> : null}
      {error ? <StatusMessage tone="error" title="Failed" detail={error} /> : null}
      {data ? <StatusMessage tone="success" title="Ready" detail={data.message} /> : null}
      <Button variant="secondary" onClick={() => void refresh()}>
        Reload
      </Button>
    </div>
  );
}

function UseAsyncListExample() {
  const { items, loading, refresh } = useAsyncList(
    async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      return ["Alpha", "Bravo", "Charlie"];
    },
    [],
    { immediate: true },
  );

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      {loading ? <p className="showcase-copy">Loading list…</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Button variant="secondary" onClick={() => void refresh()}>
        Refresh list
      </Button>
    </div>
  );
}

function UseAsyncMutationExample() {
  const { loading, error, run, setError } = useAsyncMutation("Mutation failed");
  const [result, setResult] = React.useState<string | null>(null);

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <Button
        onClick={async () => {
          try {
            setError(null);
            const saved = await run(async () => {
              await new Promise((resolve) => window.setTimeout(resolve, 350));
              return { name: "Campaign A" };
            });
            setResult(`Saved ${saved.name}`);
          } catch {
            setResult(null);
          }
        }}
        disabled={loading}
      >
        {loading ? "Saving…" : "Run mutation"}
      </Button>
      {error ? <StatusMessage tone="error" title="Mutation failed" detail={error} /> : null}
      {result ? <StatusMessage tone="success" title="Mutation ok" detail={result} /> : null}
    </div>
  );
}

function UseFormDataExample() {
  const { formData, handleChange, reset, errors, setFieldError } = useFormData({
    name: "Summer Launch",
    budget: 1000,
  });

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <TextField
        htmlFor="help-formdata-name"
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <TextField
        htmlFor="help-formdata-budget"
        label="Budget"
        name="budget"
        type="number"
        value={String(formData.budget)}
        onChange={handleChange}
      />
      {errors.name ? <p className="showcase-copy">{errors.name}</p> : null}
      <div className="showcase-action-row">
        <Button
          onClick={() => {
            if (!formData.name.trim()) {
              setFieldError("name", "Name is required");
            }
          }}
        >
          Validate
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
      <pre className="showcase-code-block">{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
}

function UseFormChangeExample() {
  const [formData, setFormData] = React.useState({ title: "Draft", qty: 1 });
  const handleChange = useFormChange(setFormData, { coerceNumberInputs: true });

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <TextField
        htmlFor="help-formchange-title"
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
      <TextField
        htmlFor="help-formchange-qty"
        label="Qty"
        name="qty"
        type="number"
        value={String(formData.qty)}
        onChange={handleChange}
      />
      <pre className="showcase-code-block">{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
}

function UseJsonBackedStateExample() {
  const [json, setJson] = React.useState('{"label":"Stored","count":2}');
  const fallback = React.useCallback(() => ({ label: "", count: 0 }), []);
  const [state, setState] = useJsonBackedState(json, fallback);

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <TextField
        htmlFor="help-json-source"
        label="JSON source"
        value={json}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setJson(event.target.value)}
      />
      <TextField
        htmlFor="help-json-label"
        label="Label"
        value={state.label}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setState((current) => ({ ...current, label: event.target.value }))
        }
      />
      <pre className="showcase-code-block">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

function UseFilteredReportExample() {
  const { items, loading, filters, updateFilter, filteredData } = useFilteredReport({
    loadItems: async () => [
      { name: "Alpha", status: "active" },
      { name: "Beta", status: "draft" },
      { name: "Gamma", status: "active" },
    ],
    errorMessage: "Failed to load report",
    initialFilters: { status: "" },
    filterItems: (nextItems, nextFilters) =>
      nextItems.filter((item) => !nextFilters.status || item.status === nextFilters.status),
  });

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      {loading ? <p className="showcase-copy">Loading report…</p> : null}
      <label className="field">
        <span>Status filter</span>
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <p className="showcase-copy">
        Showing {filteredData.length} of {items.length}
      </p>
      <ul>
        {filteredData.map((item) => (
          <li key={item.name}>
            {item.name} — {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const HOOKS_HELP_GROUPS: HelpGroup[] = [
  {
    id: "asyncHooks",
    eyebrow: "Async",
    title: "createAsyncHooks",
    items: [
      {
        id: "useAsyncValue",
        title: "useAsyncValue",
        description: "Load one async value with loading, error, and refresh.",
        code: snippetCode(
          'import { createAsyncHooks, getErrorMessage } from "@lunarq/frontend-shared";',
          `const { useAsyncValue } = createAsyncHooks({
  react: React,
  getErrorMessage,
  defaultErrorMessage: "Request failed",
});`,
          `export function Example() {
  const { data, loading, refresh } = useAsyncValue(async () => ({ ok: true }), []);
  return (
    <>
      {loading ? <p>Loading…</p> : <pre>{JSON.stringify(data)}</pre>}
      <button onClick={() => void refresh()}>Reload</button>
    </>
  );
}`,
        ),
        Example: UseAsyncValueExample,
      },
      {
        id: "useAsyncList",
        title: "useAsyncList",
        description: "Load an async list of items with refresh support.",
        code: snippetCode(
          'import { createAsyncHooks, getErrorMessage } from "@lunarq/frontend-shared";',
          `const { useAsyncList } = createAsyncHooks({
  react: React,
  getErrorMessage,
  defaultErrorMessage: "Request failed",
});`,
          `export function Example() {
  const { items, loading } = useAsyncList(async () => ["A", "B"], []);
  return loading ? <p>Loading…</p> : <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}`,
        ),
        Example: UseAsyncListExample,
      },
      {
        id: "useAsyncMutation",
        title: "useAsyncMutation",
        description: "Run an async mutation and surface loading/error state.",
        code: snippetCode(
          'import { createAsyncHooks, getErrorMessage } from "@lunarq/frontend-shared";',
          `const { useAsyncMutation } = createAsyncHooks({
  react: React,
  getErrorMessage,
  defaultErrorMessage: "Mutation failed",
});`,
          `export function Example() {
  const { loading, run } = useAsyncMutation();
  return (
    <button
      disabled={loading}
      onClick={() => void run(async () => ({ name: "Item" }))}
    >
      Save
    </button>
  );
}`,
        ),
        Example: UseAsyncMutationExample,
      },
    ],
  },
  {
    id: "formHooks",
    eyebrow: "Forms",
    title: "Form State Hooks",
    items: [
      {
        id: "useFormData",
        title: "useFormData",
        description: "Form state, name-based change handler, field errors, and reset.",
        code: snippetCode(
          'import { createUseFormData } from "@lunarq/frontend-shared";',
          "const useFormData = createUseFormData(React);",
          `export function Example() {
  const { formData, handleChange, reset } = useFormData({ name: "" });
  return (
    <>
      <input name="name" value={formData.name} onChange={handleChange} />
      <button onClick={reset}>Reset</button>
    </>
  );
}`,
        ),
        Example: UseFormDataExample,
      },
      {
        id: "useFormChange",
        title: "useFormChange",
        description: "Name-based onChange helper with optional number coercion.",
        code: snippetCode(
          'import { createUseFormChange } from "@lunarq/frontend-shared";',
          "const useFormChange = createUseFormChange(React);",
          `export function Example() {
  const [formData, setFormData] = React.useState({ qty: 1 });
  const handleChange = useFormChange(setFormData, { coerceNumberInputs: true });
  return <input name="qty" type="number" value={formData.qty} onChange={handleChange} />;
}`,
        ),
        Example: UseFormChangeExample,
      },
    ],
  },
  {
    id: "dataHooks",
    eyebrow: "Data",
    title: "State & Report Hooks",
    items: [
      {
        id: "useJsonBackedState",
        title: "useJsonBackedState",
        description: "Keep React state hydrated from a JSON string source.",
        code: snippetCode(
          'import { createUseJsonBackedState } from "@lunarq/frontend-shared";',
          "const useJsonBackedState = createUseJsonBackedState(React);",
          `export function Example() {
  const [json] = React.useState('{"label":"Stored"}');
  const [state] = useJsonBackedState(json, () => ({ label: "" }));
  return <pre>{JSON.stringify(state)}</pre>;
}`,
        ),
        Example: UseJsonBackedStateExample,
      },
      {
        id: "useFilteredReport",
        title: "useFilteredReport",
        description: "Async list loader plus client-side filters for report UIs.",
        code: snippetCode(
          'import { createAsyncHooks, createUseFilteredReport, getErrorMessage } from "@lunarq/frontend-shared";',
          `const { useAsyncList } = createAsyncHooks({
  react: React,
  getErrorMessage,
  defaultErrorMessage: "Failed",
});
const useFilteredReport = createUseFilteredReport(React, useAsyncList);`,
          `export function Example() {
  const { filteredData, updateFilter } = useFilteredReport({
    loadItems: async () => [{ name: "A", status: "active" }],
    errorMessage: "Failed to load",
    initialFilters: { status: "" },
    filterItems: (items, filters) =>
      items.filter((item) => !filters.status || item.status === filters.status),
  });
  return <ul>{filteredData.map((item) => <li key={item.name}>{item.name}</li>)}</ul>;
}`,
        ),
        Example: UseFilteredReportExample,
      },
    ],
  },
];
