import type { ThemeResponseBase } from "./themeApi.js";
import { applyThemeVariables } from "./themeApi.js";

export type ThemeColorScheme = "light" | "dark";

export interface ThemePreset {
  id: string;
  label: string;
  description?: string;
  /** Accent swatch shown in the theme menu. */
  swatch: string;
  /** Controls `document.documentElement.style.colorScheme` for native form chrome. */
  colorScheme?: ThemeColorScheme;
  theme: ThemeResponseBase;
}

/** Current LunarQ admin shell palette (`theme/tokens.css`). */
export const LUNARQ_THEME_PRESET: ThemePreset = {
  id: "lunarq",
  label: "LunarQ",
  description: "Default LunarQ admin palette",
  swatch: "#f97316",
  colorScheme: "dark",
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
 */
export const LUNARQ_LIGHT_THEME_PRESET: ThemePreset = {
  id: "lunarq-light",
  label: "LunarQ Light",
  description: "Silver surfaces with slate-blue accents from the LunarQ icon",
  swatch: "#3d5f8a",
  colorScheme: "light",
  theme: {
    tenantId: "lunarq-light",
    tenantName: "LunarQ Light",
    companyName: "LunarQ",
    primaryColor: "#3d5f8a",
    secondaryColor: "#2f4c72",
    successColor: "#2f7d5a",
    dangerColor: "#a33b2d",
    warningColor: "#9a6b12",
    bgColor: "#eef2f7",
    cardBgColor: "#f7f9fc",
    textColor: "#0c121c",
    textMutedColor: "#66768c",
    borderColor: "#c8d2e0",
    shadowColor: "0 8px 24px rgba(12, 18, 28, 0.1)",
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

export const BUILTIN_THEME_PRESETS: ThemePreset[] = [
  LUNARQ_THEME_PRESET,
  LUNARQ_LIGHT_THEME_PRESET,
  MIDNIGHT_THEME_PRESET,
];

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
    document.documentElement.style.colorScheme = resolveThemeColorScheme(preset);
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
