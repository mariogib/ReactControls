import type { ThemeResponseBase } from "./themeApi.js";
import { applyThemeVariables } from "./themeApi.js";
import {
  applyThemePreset,
  BUILTIN_THEME_PRESETS,
  readStoredThemeId,
  resolveThemePreset,
  type ThemePreset,
  writeStoredThemeId,
} from "./themePresets.js";

type ReactNodeLike = any;
type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactThemeButtonApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
  useRef: <T>(initialValue: T) => { current: T };
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

export interface ThemeButtonProps {
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  /** Override the label shown on the closed button. */
  buttonLabel?: string;
  "aria-label"?: string;
}

export interface CreateThemeButtonOptions {
  /** Themes offered in the menu. Defaults to LunarQ + Midnight. */
  themes?: ThemePreset[];
  /** Used when nothing is stored yet. */
  defaultThemeId?: string;
  /** localStorage key; set `null` to disable persistence. */
  storageKey?: string | null;
  /** Called whenever a theme is applied. Defaults to CSS variable mapping. */
  applyTheme?: (theme: ThemeResponseBase) => void;
  /** Format the closed-button label. Defaults to the preset label. */
  formatButtonLabel?: (preset: ThemePreset) => string;
  /** Invoked after a theme is selected. */
  onThemeChange?: (preset: ThemePreset) => void;
  /** Apply the resolved theme immediately when the button mounts. */
  applyOnMount?: boolean;
}

export function createThemeButton(
  react: ReactThemeButtonApi,
  {
    themes = BUILTIN_THEME_PRESETS,
    defaultThemeId = themes[0]?.id ?? "lunarq",
    storageKey = "lunarq-theme-id",
    applyTheme = applyThemeVariables,
    formatButtonLabel = (preset) => preset.label,
    onThemeChange,
    applyOnMount = true,
  }: CreateThemeButtonOptions = {},
) {
  function resolveInitialPreset(): ThemePreset {
    const storedId = storageKey ? readStoredThemeId(storageKey) : null;
    return resolveThemePreset(storedId, themes, defaultThemeId);
  }

  return function ThemeButton({
    className = "",
    menuClassName = "",
    disabled = false,
    buttonLabel,
    "aria-label": ariaLabel = "Select theme",
  }: ThemeButtonProps = {}) {
    const rootRef = react.useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = react.useState(false);
    const [activePreset, setActivePreset] = react.useState<ThemePreset>(resolveInitialPreset);

    react.useEffect(() => {
      if (!applyOnMount) {
        return;
      }

      applyThemePreset(activePreset, applyTheme);
    }, []);

    react.useEffect(() => {
      if (!open) {
        return;
      }

      function handlePointerDown(event: MouseEvent) {
        const target = event.target as Node | null;
        if (rootRef.current && target && !rootRef.current.contains(target)) {
          setOpen(false);
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    function selectTheme(preset: ThemePreset) {
      setActivePreset(preset);
      applyThemePreset(preset, applyTheme);
      if (storageKey) {
        writeStoredThemeId(storageKey, preset.id);
      }
      onThemeChange?.(preset);
      setOpen(false);
    }

    const label = buttonLabel ?? formatButtonLabel(activePreset);
    const rootClassName = ["theme-button", open ? "is-open" : "", className]
      .filter(Boolean)
      .join(" ");

    return react.createElement(
      "div",
      { className: rootClassName, ref: rootRef },
      react.createElement(
        "button",
        {
          type: "button",
          className: "theme-button-trigger",
          "aria-label": ariaLabel,
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          disabled,
          onClick: () => setOpen((current) => !current),
        },
        react.createElement("span", {
          className: "theme-button-swatch",
          style: { background: activePreset.swatch },
          "aria-hidden": "true",
        }),
        react.createElement("span", { className: "theme-button-label" }, label),
        react.createElement("span", { className: "theme-button-caret", "aria-hidden": "true" }, "▾"),
      ),
      open
        ? react.createElement(
            "div",
            {
              className: ["theme-button-menu", menuClassName].filter(Boolean).join(" "),
              role: "listbox",
              "aria-label": ariaLabel,
            },
            ...themes.map((preset) => {
              const isActive = preset.id === activePreset.id;
              return react.createElement(
                "button",
                {
                  key: preset.id,
                  type: "button",
                  role: "option",
                  "aria-selected": isActive,
                  className: `theme-button-option${isActive ? " is-active" : ""}`,
                  onClick: () => selectTheme(preset),
                },
                react.createElement("span", {
                  className: "theme-button-swatch",
                  style: { background: preset.swatch },
                  "aria-hidden": "true",
                }),
                react.createElement(
                  "span",
                  { className: "theme-button-option-copy" },
                  react.createElement("span", { className: "theme-button-option-label" }, preset.label),
                  preset.description
                    ? react.createElement(
                        "span",
                        { className: "theme-button-option-description" },
                        preset.description,
                      )
                    : null,
                ),
              );
            }),
          )
        : null,
    );
  };
}
