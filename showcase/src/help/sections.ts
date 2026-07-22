import { HELP_GROUPS as COMPONENT_LANDING_GROUPS } from "../helpCatalog";
import { ADMIN_HELP_GROUPS } from "./adminCatalog";
import { AUTH_HELP_GROUPS } from "./authCatalog";
import { HOOKS_HELP_GROUPS } from "./hooksCatalog";
import { LAYOUT_HELP_GROUPS } from "./layoutCatalog";
import { MAINTENANCE_HELP_GROUPS } from "./maintenanceCatalog";
import { THEME_HELP_GROUPS } from "./themeCatalog";
import { UTILS_HELP_GROUPS } from "./utilsCatalog";
import type { HelpSection } from "./types";

export type { HelpGroup, HelpItem, HelpSection } from "./types";

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "components",
    title: "Components",
    description:
      "Shared UI controls and page chrome, including the Overview landing-page groups plus layout and report shells.",
    groups: [...COMPONENT_LANDING_GROUPS, ...LAYOUT_HELP_GROUPS],
  },
  {
    id: "hooks",
    title: "Hooks",
    description: "Async loaders, form state helpers, JSON-backed state, and filtered report hooks.",
    groups: HOOKS_HELP_GROUPS,
  },
  {
    id: "theme",
    title: "Theme",
    description: "Theme button, built-in presets, and helpers for resolving/applying palettes.",
    groups: THEME_HELP_GROUPS,
  },
  {
    id: "admin",
    title: "Admin",
    description: "Admin shell, session dropdown, user hook, and role-access helpers.",
    groups: ADMIN_HELP_GROUPS,
  },
  {
    id: "auth",
    title: "Auth",
    description: "OIDC route guards, callback handling, and runtime config helpers.",
    groups: AUTH_HELP_GROUPS,
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "API health guard and downtime maintenance screen.",
    groups: MAINTENANCE_HELP_GROUPS,
  },
  {
    id: "utils",
    title: "Utils",
    description: "Formatting, date/time, Excel/PDF export, runtime URL, and collection helpers.",
    groups: UTILS_HELP_GROUPS,
  },
];

export function getHelpSection(sectionId: string | undefined): HelpSection {
  return HELP_SECTIONS.find((section) => section.id === sectionId) ?? HELP_SECTIONS[0];
}
