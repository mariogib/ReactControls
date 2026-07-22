import React from "react";
import {
  BUILTIN_THEME_PRESETS,
  MIDNIGHT_THEME_PRESET,
  LUNARQ_LIGHT_THEME_PRESET,
  LUNARQ_THEME_PRESET,
  applyThemePreset,
  createThemeButton,
  getThemePresetById,
  resolveThemePreset,
} from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const ThemeButton = createThemeButton(React, {
  themes: BUILTIN_THEME_PRESETS,
  defaultThemeId: "lunarq",
  storageKey: "showcase-help-theme-id",
  applyOnMount: false,
});

function ThemeButtonExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <p className="showcase-copy">
        ThemeButton persists the selected preset and applies CSS variables.
      </p>
      <ThemeButton />
    </div>
  );
}

function ThemePresetsExample() {
  const [activeId, setActiveId] = React.useState(LUNARQ_THEME_PRESET.id);
  const active = getThemePresetById(activeId) ?? LUNARQ_THEME_PRESET;

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <div className="showcase-action-row">
        {[LUNARQ_THEME_PRESET, LUNARQ_LIGHT_THEME_PRESET, MIDNIGHT_THEME_PRESET].map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={activeId === preset.id ? "primary-btn" : "secondary-btn"}
            onClick={() => {
              setActiveId(preset.id);
              applyThemePreset(preset);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <pre className="showcase-code-block">
        {JSON.stringify(
          {
            id: active.id,
            label: active.label,
            primary: active.theme.primaryColor,
            background: active.theme.bgColor,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}

function ResolveThemePresetExample() {
  const resolved = resolveThemePreset("midnight", BUILTIN_THEME_PRESETS, "lunarq");
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <p className="showcase-copy">
        resolveThemePreset("midnight") → <strong>{resolved.label}</strong>
      </p>
      <pre className="showcase-code-block">{JSON.stringify(resolved.theme, null, 2)}</pre>
    </div>
  );
}

export const THEME_HELP_GROUPS: HelpGroup[] = [
  {
    id: "themeControls",
    eyebrow: "Theme",
    title: "Theme Controls",
    items: [
      {
        id: "themeButton",
        title: "ThemeButton",
        description: "Preset picker with localStorage persistence and CSS variable application.",
        code: snippetCode(
          'import { createThemeButton, BUILTIN_THEME_PRESETS } from "@lunarq/frontend-shared";',
          `const ThemeButton = createThemeButton(React, {
  themes: BUILTIN_THEME_PRESETS,
  defaultThemeId: "lunarq",
  storageKey: "app-theme-id",
});`,
          `export function Example() {
  return <ThemeButton />;
}`,
        ),
        Example: ThemeButtonExample,
      },
      {
        id: "themePresets",
        title: "Theme presets",
        description:
          "LUNARQ_THEME_PRESET, LUNARQ_LIGHT_THEME_PRESET, MIDNIGHT_THEME_PRESET, and applyThemePreset helpers.",
        code: snippetCode(
          'import { LUNARQ_THEME_PRESET, LUNARQ_LIGHT_THEME_PRESET, MIDNIGHT_THEME_PRESET, applyThemePreset } from "@lunarq/frontend-shared";',
          "",
          `export function Example() {
  return (
    <button onClick={() => applyThemePreset(MIDNIGHT_THEME_PRESET)}>
      Use {MIDNIGHT_THEME_PRESET.label}
    </button>
  );
}`,
        ),
        Example: ThemePresetsExample,
      },
      {
        id: "resolveThemePreset",
        title: "resolveThemePreset",
        description: "Resolve a stored theme id against the available preset list.",
        code: snippetCode(
          'import { resolveThemePreset, BUILTIN_THEME_PRESETS } from "@lunarq/frontend-shared";',
          "",
          `const preset = resolveThemePreset("midnight", BUILTIN_THEME_PRESETS, "lunarq");`,
        ),
        Example: ResolveThemePresetExample,
      },
    ],
  },
];
