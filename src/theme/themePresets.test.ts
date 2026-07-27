import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILTIN_THEME_PRESETS,
  FLUENT_DARK_THEME_PRESET,
  FLUENT_LUNARQ_BLUE_THEME_PRESET,
  FLUENT_LUNARQ_LIGHT_THEME_PRESET,
  FLUENT_LUNARQ_THEME_PRESET,
  FLUENT_METAL_THEME_PRESET,
  FLUENT_THEME_PRESET,
  getThemePresetById,
  groupThemePresetsByLookAndFeel,
  MIDNIGHT_THEME_PRESET,
  resolveThemeColorScheme,
  resolveThemeLookAndFeel,
  resolveThemePreset,
  LUNARQ_LIGHT_THEME_PRESET,
  LUNARQ_THEME_PRESET,
  type ThemePreset,
} from "./themePresets.js";

test("builtin presets include LunarQ and Fluent look-and-feels", () => {
  assert.equal(BUILTIN_THEME_PRESETS.length, 9);
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
  assert.equal(FLUENT_THEME_PRESET.id, "fluent");
  assert.equal(FLUENT_THEME_PRESET.lookAndFeel, "fluent");
  assert.equal(FLUENT_THEME_PRESET.theme.primaryColor, "#0f6cbd");
  assert.equal(FLUENT_DARK_THEME_PRESET.id, "fluent-dark");
  assert.equal(FLUENT_DARK_THEME_PRESET.theme.primaryColor, "#479ef5");
  assert.equal(FLUENT_METAL_THEME_PRESET.id, "fluent-metal");
  assert.equal(FLUENT_METAL_THEME_PRESET.lookAndFeel, "fluent");
  assert.equal(FLUENT_METAL_THEME_PRESET.theme.primaryColor, "#b8c0cc");
  assert.equal(FLUENT_METAL_THEME_PRESET.theme.bgColor, "#0e1012");
  assert.equal(FLUENT_LUNARQ_THEME_PRESET.id, "fluent-lunarq");
  assert.equal(FLUENT_LUNARQ_THEME_PRESET.lookAndFeel, "fluent");
  assert.equal(FLUENT_LUNARQ_THEME_PRESET.theme.primaryColor, LUNARQ_THEME_PRESET.theme.primaryColor);
  assert.equal(FLUENT_LUNARQ_THEME_PRESET.theme.bgColor, LUNARQ_THEME_PRESET.theme.bgColor);
  assert.equal(FLUENT_LUNARQ_LIGHT_THEME_PRESET.id, "fluent-lunarq-light");
  assert.equal(
    FLUENT_LUNARQ_LIGHT_THEME_PRESET.theme.primaryColor,
    LUNARQ_LIGHT_THEME_PRESET.theme.primaryColor,
  );
  assert.equal(FLUENT_LUNARQ_BLUE_THEME_PRESET.id, "fluent-lunarq-blue");
  assert.equal(FLUENT_LUNARQ_BLUE_THEME_PRESET.lookAndFeel, "fluent");
  assert.equal(FLUENT_LUNARQ_BLUE_THEME_PRESET.theme.primaryColor, "#5b9fd4");
  assert.equal(FLUENT_LUNARQ_BLUE_THEME_PRESET.theme.bgColor, LUNARQ_THEME_PRESET.theme.bgColor);
});

test("getThemePresetById resolves known ids", () => {
  assert.equal(getThemePresetById("midnight")?.label, "Midnight");
  assert.equal(getThemePresetById("lunarq-light")?.label, "LunarQ Light");
  assert.equal(getThemePresetById("fluent")?.label, "Fluent");
  assert.equal(getThemePresetById("fluent-dark")?.label, "Fluent Dark");
  assert.equal(getThemePresetById("fluent-metal")?.label, "Fluent Metal");
  assert.equal(getThemePresetById("fluent-lunarq")?.label, "Fluent LunarQ");
  assert.equal(getThemePresetById("fluent-lunarq-light")?.label, "Fluent LunarQ Light");
  assert.equal(getThemePresetById("fluent-lunarq-blue")?.label, "Fluent LunarQ Blue");
  assert.equal(getThemePresetById("missing"), undefined);
});

test("resolveThemePreset falls back to default then first theme", () => {
  const resolved = resolveThemePreset("missing", BUILTIN_THEME_PRESETS, "lunarq");
  assert.equal(resolved.id, "lunarq");

  const midnight = resolveThemePreset("midnight", BUILTIN_THEME_PRESETS, "lunarq");
  assert.equal(midnight.id, "midnight");

  const fluent = resolveThemePreset("fluent", BUILTIN_THEME_PRESETS, "lunarq");
  assert.equal(fluent.id, "fluent");
});

test("resolveThemeColorScheme uses explicit scheme or luminance", () => {
  assert.equal(resolveThemeColorScheme(LUNARQ_LIGHT_THEME_PRESET), "light");
  assert.equal(resolveThemeColorScheme(LUNARQ_THEME_PRESET), "dark");
  assert.equal(resolveThemeColorScheme(FLUENT_THEME_PRESET), "light");
  assert.equal(resolveThemeColorScheme(FLUENT_DARK_THEME_PRESET), "dark");
  assert.equal(resolveThemeColorScheme(FLUENT_METAL_THEME_PRESET), "dark");
  assert.equal(resolveThemeColorScheme(FLUENT_LUNARQ_THEME_PRESET), "dark");
  assert.equal(resolveThemeColorScheme(FLUENT_LUNARQ_LIGHT_THEME_PRESET), "light");

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

test("groupThemePresetsByLookAndFeel keeps LunarQ and Fluent sections", () => {
  const groups = groupThemePresetsByLookAndFeel(BUILTIN_THEME_PRESETS);
  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.lookAndFeel, "lunarq");
  assert.equal(groups[0]?.label, "LunarQ");
  assert.equal(groups[0]?.themes.length, 3);
  assert.equal(groups[1]?.lookAndFeel, "fluent");
  assert.equal(groups[1]?.label, "Microsoft Fluent");
  assert.equal(groups[1]?.themes.length, 6);
  assert.equal(resolveThemeLookAndFeel(FLUENT_THEME_PRESET), "fluent");
  assert.equal(resolveThemeLookAndFeel(FLUENT_METAL_THEME_PRESET), "fluent");
  assert.equal(resolveThemeLookAndFeel(FLUENT_LUNARQ_THEME_PRESET), "fluent");
  assert.equal(resolveThemeLookAndFeel(LUNARQ_THEME_PRESET), "lunarq");
});
