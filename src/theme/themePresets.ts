import type { ThemeResponseBase } from "./themeApi.js";
import { applyThemeVariables } from "./themeApi.js";

export type ThemeColorScheme = "light" | "dark";

/** Visual family shown as a section header in ThemeButton. */
export type ThemeLookAndFeel = "lunarq" | "fluent";

export interface ThemePreset {
  id: string;
  label: string;
  description?: string;
  /** Accent swatch shown in the theme menu. */
  swatch: string;
  /** Controls `document.documentElement.style.colorScheme` for native form chrome. */
  colorScheme?: ThemeColorScheme;
  /**
   * Look-and-feel family for menu grouping (LunarQ vs Fluent).
   * Defaults to `"lunarq"` when omitted.
   */
  lookAndFeel?: ThemeLookAndFeel;
  theme: ThemeResponseBase;
}

export const THEME_LOOK_AND_FEEL_LABELS: Record<ThemeLookAndFeel, string> = {
  lunarq: "LunarQ",
  fluent: "Microsoft Fluent",
};

/** Current LunarQ admin shell palette (`theme/tokens.css`). */
export const LUNARQ_THEME_PRESET: ThemePreset = {
  id: "lunarq",
  label: "LunarQ",
  description: "Default LunarQ admin palette",
  swatch: "#f97316",
  colorScheme: "dark",
  lookAndFeel: "lunarq",
  theme: {
    tenantId: "lunarq",
    tenantName: "LunarQ",
    companyName: "LunarQ",
    primaryColor: "#f97316",
    secondaryColor: "#fb923c",
    successColor: "#22c55e",
    dangerColor: "#ef4444",
    warningColor: "#f59e0b",
    bgColor: "#1f2937",
    cardBgColor: "#374151",
    textColor: "#ffffff",
    textMutedColor: "#d1d5db",
    borderColor: "#4b5563",
    shadowColor: "0 24px 60px rgba(0, 0, 0, 0.35)",
    isDefault: true,
  },
};

/**
 * Cool silver surfaces with slate-blue accents — matches the LunarQ LQ icon
 * (metallic silver L + indigo crescent Q) on a light dashboard field.
 * Tuned for stronger text/border contrast on pale surfaces.
 */
export const LUNARQ_LIGHT_THEME_PRESET: ThemePreset = {
  id: "lunarq-light",
  label: "LunarQ Light",
  description: "Silver surfaces with slate-blue accents from the LunarQ icon",
  swatch: "#2f4f78",
  colorScheme: "light",
  lookAndFeel: "lunarq",
  theme: {
    tenantId: "lunarq-light",
    tenantName: "LunarQ Light",
    companyName: "LunarQ",
    primaryColor: "#2f4f78",
    secondaryColor: "#243d5e",
    successColor: "#1f6b4a",
    dangerColor: "#8f2f24",
    warningColor: "#8a5a0a",
    bgColor: "#dfe7f1",
    cardBgColor: "#ffffff",
    textColor: "#070b12",
    textMutedColor: "#2a3444",
    borderColor: "#7f91a8",
    shadowColor: "0 10px 28px rgba(7, 11, 18, 0.14)",
    isDefault: true,
  },
};

/** Deep charcoal dashboard look inspired by developer tooling UIs. */
export const MIDNIGHT_THEME_PRESET: ThemePreset = {
  id: "midnight",
  label: "Midnight",
  description: "Near-black surfaces with emerald status accents",
  swatch: "#3fb950",
  colorScheme: "dark",
  lookAndFeel: "lunarq",
  theme: {
    tenantId: "midnight",
    tenantName: "Midnight",
    companyName: "Midnight",
    primaryColor: "#3fb950",
    secondaryColor: "#238636",
    successColor: "#3fb950",
    dangerColor: "#f85149",
    warningColor: "#d29922",
    bgColor: "#0d1117",
    cardBgColor: "#161b22",
    textColor: "#e6edf3",
    textMutedColor: "#8b949e",
    borderColor: "#30363d",
    shadowColor: "0 16px 40px rgba(0, 0, 0, 0.45)",
    isDefault: true,
  },
};

/**
 * Microsoft Fluent Design 2 light palette — Segoe-friendly neutrals and brand blue.
 * Pair with `[data-theme='fluent']` look-and-feel CSS for radius/type.
 */
export const FLUENT_THEME_PRESET: ThemePreset = {
  id: "fluent",
  label: "Fluent",
  description: "Microsoft Fluent light — brand blue on neutral surfaces",
  swatch: "#0f6cbd",
  colorScheme: "light",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent",
    tenantName: "Fluent",
    companyName: "Fluent",
    primaryColor: "#0f6cbd",
    secondaryColor: "#115ea3",
    successColor: "#0e700e",
    dangerColor: "#b10e1c",
    warningColor: "#8a3707",
    bgColor: "#f5f5f5",
    cardBgColor: "#ffffff",
    textColor: "#242424",
    textMutedColor: "#616161",
    borderColor: "#d1d1d1",
    shadowColor: "0 2px 8px rgba(0, 0, 0, 0.14), 0 0 2px rgba(0, 0, 0, 0.12)",
    isDefault: true,
  },
};

/**
 * Microsoft Fluent Design 2 dark palette — elevated charcoal with light brand blue.
 */
export const FLUENT_DARK_THEME_PRESET: ThemePreset = {
  id: "fluent-dark",
  label: "Fluent Dark",
  description: "Microsoft Fluent dark — charcoal surfaces with brand blue accents",
  swatch: "#479ef5",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent-dark",
    tenantName: "Fluent Dark",
    companyName: "Fluent",
    primaryColor: "#479ef5",
    secondaryColor: "#62abf5",
    successColor: "#54b054",
    dangerColor: "#f1707b",
    warningColor: "#fce100",
    bgColor: "#1f1f1f",
    cardBgColor: "#292929",
    textColor: "#ffffff",
    textMutedColor: "#adadad",
    borderColor: "#666666",
    shadowColor: "0 8px 16px rgba(0, 0, 0, 0.4), 0 0 2px rgba(0, 0, 0, 0.3)",
    isDefault: true,
  },
};

export const BUILTIN_THEME_PRESETS: ThemePreset[] = [
  LUNARQ_THEME_PRESET,
  LUNARQ_LIGHT_THEME_PRESET,
  MIDNIGHT_THEME_PRESET,
  FLUENT_THEME_PRESET,
  FLUENT_DARK_THEME_PRESET,
];

export function resolveThemeLookAndFeel(preset: ThemePreset): ThemeLookAndFeel {
  return preset.lookAndFeel === "fluent" ? "fluent" : "lunarq";
}

/** Group presets in ThemeButton order, preserving first-seen look-and-feel sequence. */
export function groupThemePresetsByLookAndFeel(
  themes: readonly ThemePreset[],
): Array<{ lookAndFeel: ThemeLookAndFeel; label: string; themes: ThemePreset[] }> {
  const groups: Array<{ lookAndFeel: ThemeLookAndFeel; label: string; themes: ThemePreset[] }> = [];
  const indexByFeel = new Map<ThemeLookAndFeel, number>();

  for (const preset of themes) {
    const lookAndFeel = resolveThemeLookAndFeel(preset);
    const existing = indexByFeel.get(lookAndFeel);
    if (existing == null) {
      indexByFeel.set(lookAndFeel, groups.length);
      groups.push({
        lookAndFeel,
        label: THEME_LOOK_AND_FEEL_LABELS[lookAndFeel],
        themes: [preset],
      });
      continue;
    }
    groups[existing]!.themes.push(preset);
  }

  return groups;
}

export function getThemePresetById(
  themeId: string,
  themes: readonly ThemePreset[] = BUILTIN_THEME_PRESETS,
): ThemePreset | undefined {
  return themes.find((preset) => preset.id === themeId);
}

/** Relative luminance of a #RRGGBB (or #RGB) color; null if unparsable. */
function hexLuminance(cssColor: string): number | null {
  const raw = cssColor.trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Prefer explicit `colorScheme`; otherwise infer from background luminance. */
export function resolveThemeColorScheme(preset: ThemePreset): ThemeColorScheme {
  if (preset.colorScheme === "light" || preset.colorScheme === "dark") {
    return preset.colorScheme;
  }
  const luminance = hexLuminance(preset.theme.bgColor);
  if (luminance == null) {
    return "dark";
  }
  return luminance > 0.55 ? "light" : "dark";
}

export function applyThemePreset(
  preset: ThemePreset,
  applyTheme: (theme: ThemeResponseBase) => void = applyThemeVariables,
): void {
  applyTheme(preset.theme);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = preset.id;
    document.documentElement.dataset.lookAndFeel = resolveThemeLookAndFeel(preset);
    document.documentElement.style.colorScheme = resolveThemeColorScheme(preset);
    document.dispatchEvent(
      new CustomEvent("lunarq:themechange", {
        detail: {
          themeId: preset.id,
          lookAndFeel: resolveThemeLookAndFeel(preset),
        },
      }),
    );
  }
}

export function readStoredThemeId(storageKey: string): string | null {
  if (typeof window === "undefined" || !storageKey) {
    return null;
  }

  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function writeStoredThemeId(storageKey: string, themeId: string): void {
  if (typeof window === "undefined" || !storageKey) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, themeId);
  } catch {
    // Ignore quota / privacy mode failures.
  }
}

export function resolveThemePreset(
  themeId: string | null | undefined,
  themes: readonly ThemePreset[],
  fallbackId: string,
): ThemePreset {
  return (
    getThemePresetById(themeId ?? "", themes) ??
    getThemePresetById(fallbackId, themes) ??
    themes[0] ??
    LUNARQ_THEME_PRESET
  );
}
