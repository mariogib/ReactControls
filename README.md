# frontend-shared

Shared frontend platform assets for LunarQ applications.

## Install

This package is intended for local or private consumption (it is marked `private` and is not published to the public npm registry).

From another project on disk:

```bash
npm install ../frontend-shared
```

Or with an explicit file URL:

```bash
npm install file:../frontend-shared
```

From a git repository:

```bash
npm install git+ssh://git@github.com/<org>/frontend-shared.git
```

Peer dependency: `react` ^18 or ^19.

After install, import from the published entrypoints below. The package builds to `dist/` automatically via `prepare`/`prepack` when installed from source.

## Public Surface

- `@lunarq/frontend-shared`
  General top-level exports.
- `@lunarq/frontend-shared/admin`
  Admin shell, session UI, and identity helpers.
- `@lunarq/frontend-shared/components`
  Reusable UI primitive factories and shared CRUD scaffolding.
- `@lunarq/frontend-shared/hooks`
  Shared async, form, and filtering hook factories.
- `@lunarq/frontend-shared/theme`
  Theme API helpers, presets (`LunarQ`, `Midnight`), and `createThemeButton`.
- `@lunarq/frontend-shared/theme/index.css`
  Shared design tokens, primitive CSS, and theme button styles.
- `@lunarq/frontend-shared/components/index.css`
  Shared component-level CSS primitives, including the report layout shell and browse list controls.
- `@lunarq/frontend-shared/admin/index.css`
  Shared admin shell and session styling.

## Usage Pattern

This package currently uses factory-style exports so app code can supply its local React runtime or local component dependencies.

### CSS Order

Import CSS from the package entrypoints (JS modules do not pull styles in automatically). For an admin-style app, use this order:

1. `@lunarq/frontend-shared/theme/index.css`
2. `@lunarq/frontend-shared/components/index.css`
3. `@lunarq/frontend-shared/admin/index.css`
4. `@lunarq/frontend-shared/maintenance/index.css` (only if using maintenance screens)
5. App-local feature styles

This keeps tokens and component primitives stable before app-local overrides are applied.

Example:

```ts
import React from "react";
import { createButton } from "@lunarq/frontend-shared";

const Button = createButton(React);
```

### Browse calendar scopes

When calendar view is enabled, `BrowseListControls` can show Day / Month / Year scope options (Month is the default). Hide Day or Year when configuring:

```ts
<BrowseListControls
  allowCalendarView
  calendarScope={scope}                 // "day" | "month" | "year"
  onCalendarScopeChange={setScope}
  showCalendarDayOption={true}          // set false to hide Day
  showCalendarYearOption={true}         // set false to hide Year
  ...
/>
```

### Date / time control

One configurable field for date-only, date+time, or date+time with seconds:

```ts
import React from "react";
import { createFormFields } from "@lunarq/frontend-shared";

const { DateTimeControl } = createFormFields(React);

<DateTimeControl htmlFor="day" label="Day" mode="date" value={day} onChange={...} />
<DateTimeControl htmlFor="start" label="Start" mode="datetime" value={start} onChange={...} />
<DateTimeControl htmlFor="stamp" label="Stamp" mode="datetime-seconds" value={stamp} onChange={...} />
```

Value formats: `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`, `YYYY-MM-DDTHH:mm:ss`.

### Excel export

```ts
import { exportToExcel } from "@lunarq/frontend-shared";

await exportToExcel({
  filename: "campaigns",
  title: "Campaigns",
  timestamp: "2026-07-20",
  columns: [
    { header: "Campaign", key: "name" },
    { header: "Status", key: "status" },
  ],
  data: rows,
});
```

This downloads a real `.xlsx` workbook with the rows formatted as an Excel Table (filterable/banded).

```ts
import { exportToPdf } from "@lunarq/frontend-shared";

await exportToPdf({
  filename: "campaigns",
  title: "Campaigns",
  timestamp: "2026-07-20",
  columns: [
    { header: "Campaign", key: "name" },
    { header: "Status", key: "status" },
  ],
  data: rows,
});
```

This downloads a landscape `.pdf` with the rows rendered as a table.

### Theme button

```ts
import React from "react";
import {
  createThemeButton,
  BUILTIN_THEME_PRESETS,
  MIDNIGHT_THEME_PRESET,
  LUNARQ_THEME_PRESET,
} from "@lunarq/frontend-shared/theme";

const ThemeButton = createThemeButton(React, {
  themes: BUILTIN_THEME_PRESETS, // LunarQ + Midnight
  defaultThemeId: "lunarq",
  storageKey: "my-app-theme-id",
});

// Optional: add your own presets alongside the builtins
const ThemeButtonWithCustom = createThemeButton(React, {
  themes: [
    LUNARQ_THEME_PRESET,
    MIDNIGHT_THEME_PRESET,
    {
      id: "brand",
      label: "Brand",
      swatch: "#8b5cf6",
      description: "App-specific override",
      theme: { ...LUNARQ_THEME_PRESET.theme, primaryColor: "#8b5cf6", tenantId: "brand" },
    },
  ],
});
```

```ts
import React from "react";
import { createRegistryResourcePage } from "@lunarq/frontend-shared";
import CrudRegistryPage from "./CrudRegistryPage";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import EntityModalForm from "./EntityModalForm";
import PanelSection from "./PanelSection";
import StatusMessage from "./StatusMessage";

const RegistryResourcePage = createRegistryResourcePage(React, {
  CrudRegistryPage,
  DataTable,
  EmptyState,
  EntityModalForm,
  PanelSection,
  StatusMessage,
});
```

## Migration Rules

### Move Something Into frontend-shared When

- The same UI pattern exists in two or more apps.
- The code is domain-agnostic and could plausibly serve a future app.
- The behavior can be expressed as a primitive, hook, shell, or factory.
- The styling is part of a visual system, not a single feature workflow.

### Keep Something Local When

- It depends on app-specific APIs or routing semantics.
- It contains business rules unique to one app.
- It encodes feature-specific labels, validation, or workflows.
- It only exists once and is not part of a reusable pattern yet.

### Prefer Thin Wrappers

When moving a component or helper into `frontend-shared`, prefer leaving a thin app-local wrapper if:

- the app still needs a legacy public import path,
- the app injects local collaborators,
- the app must preserve a slightly richer API while reusing shared rendering or behavior.

Examples already in the repo:

- local component wrappers over shared primitive factories
- local `ReportLayout` wrapper over shared report shell
- local control form-field wrapper over shared form-field primitives

### Do Not Duplicate Shared Assets

Before adding a new component, hook, or style block to an app, check whether one of these entrypoints already covers it:

- `@lunarq/frontend-shared`
- `@lunarq/frontend-shared/components`
- `@lunarq/frontend-shared/hooks`
- `@lunarq/frontend-shared/admin`

If the shared asset is close but not exact, prefer extending the shared version over creating a new parallel local copy.

## Shared Categories

### Theme

- tokens
- primitive visual classes
- shared spacing, colors, border, shadow, surface styles

### Components

- button, card, breadcrumb, modal, empty state, status badge, stats grid
- data table, panel section, page hero
- CRUD scaffolding and report shell
- shared form fields

### Hooks

- async resource hooks
- form-state helpers
- filtered-report behavior
- JSON-backed local state utilities

### Admin

- admin shell
- session dropdown
- admin user identity helpers
- access/role helpers

## What Belongs Here

- Shared design tokens and base CSS
- Shared admin shell and session chrome
- Reusable UI primitives like buttons, cards, tables, empty states, status messages, modals, stats grids
- Shared hook factories for async loading, form state, filtered list/report behavior
- Shared CRUD scaffolding for admin-style registry pages

## What Should Stay Local

- App-specific domain workflows
- App-specific report page logic that cannot be expressed as shared filtering/table primitives
- Theme resolution logic that depends on app runtime behavior

## Migration Checklist

When moving a new asset into `frontend-shared`, verify all of the following:

- it has a stable exported entrypoint
- it does not hard-code app-specific domain behavior
- it has either a thin wrapper or a direct consumer migration plan
- it builds in all current consuming apps
- if the asset carries behavior, it has focused tests when practical
- if the asset is a visual primitive or shell, add it to the showcase

When the same UI control, layout section, or hook pattern exists in more than one app and is not domain-specific, prefer moving it here and leaving app-local files as thin wrappers.
