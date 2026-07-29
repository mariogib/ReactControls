import React from "react";
import {
  BUILTIN_THEME_PRESETS,
  FLUENT_DARK_THEME_PRESET,
  FLUENT_LUNARQ_THEME_PRESET,
  FLUENT_LUNARQ_LIGHT_THEME_PRESET,
  FLUENT_LUNARQ_BLUE_THEME_PRESET,
  FLUENT_METAL_THEME_PRESET,
  FLUENT_METAL_BLUE_THEME_PRESET,
  FLUENT_METAL_GREEN_THEME_PRESET,
  FLUENT_AURORA_THEME_PRESET,
  FLUENT_THEME_PRESET,
  MIDNIGHT_THEME_PRESET,
  LUNARQ_LIGHT_THEME_PRESET,
  LUNARQ_THEME_PRESET,
  applyThemePreset,
  createThemeButton,
  getThemePresetById,
  groupThemePresetsByLookAndFeel,
  resolveThemeLookAndFeel,
  resolveThemePreset,
  THEME_LOOK_AND_FEEL_LABELS,
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
        ThemeButton persists the selected preset and switches between LunarQ and Microsoft Fluent
        look-and-feel groups.
      </p>
      <ThemeButton />
    </div>
  );
}

function ThemePresetsExample() {
  const [activeId, setActiveId] = React.useState(LUNARQ_THEME_PRESET.id);
  const active = getThemePresetById(activeId) ?? LUNARQ_THEME_PRESET;
  const presets = [
    LUNARQ_THEME_PRESET,
    LUNARQ_LIGHT_THEME_PRESET,
    MIDNIGHT_THEME_PRESET,
    FLUENT_THEME_PRESET,
    FLUENT_DARK_THEME_PRESET,
    FLUENT_METAL_THEME_PRESET,
    FLUENT_METAL_BLUE_THEME_PRESET,
    FLUENT_METAL_GREEN_THEME_PRESET,
    FLUENT_AURORA_THEME_PRESET,
    FLUENT_LUNARQ_THEME_PRESET,
    FLUENT_LUNARQ_LIGHT_THEME_PRESET,
    FLUENT_LUNARQ_BLUE_THEME_PRESET,
  ];

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <div className="showcase-action-row">
        {presets.map((preset) => (
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
            lookAndFeel: active.lookAndFeel ?? "lunarq",
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
  const resolved = resolveThemePreset("fluent-aurora", BUILTIN_THEME_PRESETS, "lunarq");
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <p className="showcase-copy">
        resolveThemePreset("fluent-aurora") → <strong>{resolved.label}</strong> (
        {resolveThemeLookAndFeel(resolved)})
      </p>
      <pre className="showcase-code-block">{JSON.stringify(resolved.theme, null, 2)}</pre>
    </div>
  );
}

function LookAndFeelGroupingExample() {
  const groups = groupThemePresetsByLookAndFeel(BUILTIN_THEME_PRESETS);
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      {groups.map((group) => (
        <div key={group.lookAndFeel}>
          <p className="showcase-copy" style={{ marginBottom: "0.35rem" }}>
            <strong>{group.label}</strong>{" "}
            <span>
              ({THEME_LOOK_AND_FEEL_LABELS[group.lookAndFeel]} · {group.themes.length} presets)
            </span>
          </p>
          <div className="showcase-action-row">
            {group.themes.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="secondary-btn"
                onClick={() => applyThemePreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ))}
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
        description:
          "Preset picker with LunarQ / Fluent look-and-feel groups. Fluent also switches type ramp, 4px spacing, radii, nav density, and control heights.",
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
          "LunarQ palettes plus Fluent variants including Fluent Aurora (indigo night with teal glow accents).",
        code: snippetCode(
          'import { FLUENT_THEME_PRESET, LUNARQ_THEME_PRESET, applyThemePreset } from "@lunarq/frontend-shared";',
          "",
          `export function Example() {
  return (
    <button onClick={() => applyThemePreset(FLUENT_THEME_PRESET)}>
      Use {FLUENT_THEME_PRESET.label}
    </button>
  );
}`,
        ),
        Example: ThemePresetsExample,
      },
      {
        id: "lookAndFeelGrouping",
        title: "Look-and-feel grouping",
        description:
          "groupThemePresetsByLookAndFeel and resolveThemeLookAndFeel organize LunarQ vs Microsoft Fluent sections.",
        code: snippetCode(
          'import {\n  BUILTIN_THEME_PRESETS,\n  groupThemePresetsByLookAndFeel,\n  resolveThemeLookAndFeel,\n} from "@lunarq/frontend-shared";',
          "",
          `const groups = groupThemePresetsByLookAndFeel(BUILTIN_THEME_PRESETS);
const feel = resolveThemeLookAndFeel(groups[0].themes[0]);`,
        ),
        Example: LookAndFeelGroupingExample,
      },
      {
        id: "resolveThemePreset",
        title: "resolveThemePreset",
        description: "Resolve a stored theme id against the available preset list.",
        code: snippetCode(
          'import { resolveThemePreset, BUILTIN_THEME_PRESETS } from "@lunarq/frontend-shared";',
          "",
          `const preset = resolveThemePreset("fluent", BUILTIN_THEME_PRESETS, "lunarq");`,
        ),
        Example: ResolveThemePresetExample,
      },
    ],
  },
];
