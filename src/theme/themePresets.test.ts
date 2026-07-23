import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILTIN_THEME_PRESETS,
  getThemePresetById,
  MIDNIGHT_THEME_PRESET,
  resolveThemeColorScheme,
  resolveThemePreset,
  LUNARQ_LIGHT_THEME_PRESET,
  LUNARQ_THEME_PRESET,
  type ThemePreset,
} from "./themePresets.js";

test("builtin presets include lunarq, lunarq-light, and midnight", () => {
  assert.equal(BUILTIN_THEME_PRESETS.length, 3);
  assert.equal(LUNARQ_THEME_PRESET.theme.primaryColor, "#f97316");
  assert.equal(LUNARQ_THEME_PRESET.theme.bgColor, "#1f2937");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.label, "LunarQ Light");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.colorScheme, "light");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.theme.primaryColor, "#2f4f78");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.theme.textMutedColor, "#2a3444");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.theme.borderColor, "#7f91a8");
  assert.equal(LUNARQ_LIGHT_THEME_PRESET.theme.cardBgColor, "#ffffff");
  assert.equal(MIDNIGHT_THEME_PRESET.theme.primaryColor, "#3fb950");
  assert.equal(MIDNIGHT_THEME_PRESET.theme.bgColor, "#0d1117");
});

test("getThemePresetById resolves known ids", () => {
  assert.equal(getThemePresetById("midnight")?.label, "Midnight");
  assert.equal(getThemePresetById("lunarq-light")?.label, "LunarQ Light");
  assert.equal(getThemePresetById("missing"), undefined);
});

test("resolveThemePreset falls back to default then first theme", () => {
  const resolved = resolveThemePreset("missing", BUILTIN_THEME_PRESETS, "lunarq");
  assert.equal(resolved.id, "lunarq");

  const midnight = resolveThemePreset("midnight", BUILTIN_THEME_PRESETS, "lunarq");
  assert.equal(midnight.id, "midnight");
});

test("resolveThemeColorScheme uses explicit scheme or luminance", () => {
  assert.equal(resolveThemeColorScheme(LUNARQ_LIGHT_THEME_PRESET), "light");
  assert.equal(resolveThemeColorScheme(LUNARQ_THEME_PRESET), "dark");

  const inferredLight: ThemePreset = {
    id: "inferred-light",
    label: "Inferred",
    swatch: "#ccc",
    theme: {
      ...LUNARQ_LIGHT_THEME_PRESET.theme,
      tenantId: "inferred-light",
      bgColor: "#f5f5f5",
    },
  };
  assert.equal(resolveThemeColorScheme(inferredLight), "light");
});
