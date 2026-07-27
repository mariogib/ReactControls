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

/**
 * Fluent structure with a dark metallic / gunmetal palette — brushed silver accents
 * on deep steel surfaces (still `lookAndFeel: "fluent"`).
 */
export const FLUENT_METAL_THEME_PRESET: ThemePreset = {
  id: "fluent-metal",
  label: "Fluent Metal",
  description: "Dark metallic Fluent — gunmetal surfaces with brushed silver accents",
  swatch: "#b8c0cc",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent-metal",
    tenantName: "Fluent Metal",
    companyName: "Fluent",
    primaryColor: "#b8c0cc",
    secondaryColor: "#d4dae3",
    successColor: "#7dbc96",
    dangerColor: "#e08a8a",
    warningColor: "#d4b45a",
    bgColor: "#0e1012",
    cardBgColor: "#1c1f24",
    textColor: "#eef1f5",
    textMutedColor: "#9aa3b0",
    borderColor: "#4a515c",
    shadowColor: "0 10px 28px rgba(0, 0, 0, 0.55), 0 0 1px rgba(184, 192, 204, 0.18)",
    isDefault: true,
  },
};

/**
 * Fluent metallic chrome with a brushed cobalt / steel-blue palette —
 * deep navy surfaces and cool metallic blue accents.
 */
export const FLUENT_METAL_BLUE_THEME_PRESET: ThemePreset = {
  id: "fluent-metal-blue",
  label: "Fluent Metal Blue",
  description: "Dark metallic Fluent — navy steel surfaces with brushed cobalt accents",
  swatch: "#8eb4d4",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent-metal-blue",
    tenantName: "Fluent Metal Blue",
    companyName: "Fluent",
    primaryColor: "#8eb4d4",
    secondaryColor: "#b3cfe6",
    successColor: "#6db89a",
    dangerColor: "#e08a9a",
    warningColor: "#c9a85a",
    bgColor: "#0a1018",
    cardBgColor: "#141c28",
    textColor: "#e8f0f8",
    textMutedColor: "#8fa3b8",
    borderColor: "#3a4d63",
    shadowColor: "0 10px 28px rgba(0, 0, 0, 0.55), 0 0 1px rgba(142, 180, 212, 0.22)",
    isDefault: true,
  },
};

/**
 * Fluent metallic chrome with a brushed jade / steel-green palette —
 * deep forest-steel surfaces and cool metallic green accents.
 */
export const FLUENT_METAL_GREEN_THEME_PRESET: ThemePreset = {
  id: "fluent-metal-green",
  label: "Fluent Metal Green",
  description: "Dark metallic Fluent — forest-steel surfaces with brushed jade accents",
  swatch: "#8ec4a8",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent-metal-green",
    tenantName: "Fluent Metal Green",
    companyName: "Fluent",
    primaryColor: "#8ec4a8",
    secondaryColor: "#b3d9c4",
    successColor: "#6db89a",
    dangerColor: "#e08a9a",
    warningColor: "#c9a85a",
    bgColor: "#0a1210",
    cardBgColor: "#141f1b",
    textColor: "#e8f5ef",
    textMutedColor: "#8faba0",
    borderColor: "#3a554a",
    shadowColor: "0 10px 28px rgba(0, 0, 0, 0.55), 0 0 1px rgba(142, 196, 168, 0.22)",
    isDefault: true,
  },
};

/**
 * Fluent chrome with an aurora palette — deep indigo night field and
 * teal/cyan glow accents (distinct from the metal and LunarQ families).
 */
export const FLUENT_AURORA_THEME_PRESET: ThemePreset = {
  id: "fluent-aurora",
  label: "Fluent Aurora",
  description: "Deep indigo night field with teal aurora accents",
  swatch: "#5ec8c0",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    tenantId: "fluent-aurora",
    tenantName: "Fluent Aurora",
    companyName: "Fluent",
    primaryColor: "#5ec8c0",
    secondaryColor: "#8eddd6",
    successColor: "#6db89a",
    dangerColor: "#e08a9a",
    warningColor: "#e0c06a",
    bgColor: "#0b0f1a",
    cardBgColor: "#141a2a",
    textColor: "#e8eef8",
    textMutedColor: "#8f9bb8",
    borderColor: "#2a3550",
    shadowColor: "0 10px 28px rgba(0, 0, 0, 0.55), 0 0 1px rgba(94, 200, 192, 0.28)",
    isDefault: true,
  },
};

/**
 * Fluent layout/type chrome with the classic LunarQ dark orange palette.
 */
export const FLUENT_LUNARQ_THEME_PRESET: ThemePreset = {
  id: "fluent-lunarq",
  label: "Fluent LunarQ",
  description: "Fluent density and type with the LunarQ dark orange palette",
  swatch: LUNARQ_THEME_PRESET.swatch,
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    ...LUNARQ_THEME_PRESET.theme,
    tenantId: "fluent-lunarq",
    tenantName: "Fluent LunarQ",
    companyName: "LunarQ",
  },
};

/**
 * Fluent layout/type chrome with the LunarQ Light slate-blue palette.
 */
export const FLUENT_LUNARQ_LIGHT_THEME_PRESET: ThemePreset = {
  id: "fluent-lunarq-light",
  label: "Fluent LunarQ Light",
  description: "Fluent density and type with the LunarQ Light slate-blue palette",
  swatch: LUNARQ_LIGHT_THEME_PRESET.swatch,
  colorScheme: "light",
  lookAndFeel: "fluent",
  theme: {
    ...LUNARQ_LIGHT_THEME_PRESET.theme,
    tenantId: "fluent-lunarq-light",
    tenantName: "Fluent LunarQ Light",
    companyName: "LunarQ",
  },
};

/**
 * Fluent chrome on LunarQ dark slate surfaces, with a cool blue accent
 * that matches the gray-blue field (instead of LunarQ orange).
 */
export const FLUENT_LUNARQ_BLUE_THEME_PRESET: ThemePreset = {
  id: "fluent-lunarq-blue",
  label: "Fluent LunarQ Blue",
  description: "LunarQ dark slate surfaces with a cool blue accent that fits the gray field",
  swatch: "#5b9fd4",
  colorScheme: "dark",
  lookAndFeel: "fluent",
  theme: {
    ...LUNARQ_THEME_PRESET.theme,
    tenantId: "fluent-lunarq-blue",
    tenantName: "Fluent LunarQ Blue",
    companyName: "LunarQ",
    primaryColor: "#5b9fd4",
    secondaryColor: "#7eb8e8",
  },
};

export const BUILTIN_THEME_PRESETS: ThemePreset[] = [
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
