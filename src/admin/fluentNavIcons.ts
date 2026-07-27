type ReactNodeLike = any;

interface ReactIconApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

/** Fluent System–style outline glyph (20×20, currentColor stroke). */
export function createFluentNavIcon(
  react: ReactIconApi,
  paths: string | readonly string[],
  title?: string,
): ReactNodeLike {
  const pathList = typeof paths === "string" ? [paths] : [...paths];
  return react.createElement(
    "svg",
    {
      className: "fluent-nav-icon",
      viewBox: "0 0 20 20",
      width: 20,
      height: 20,
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": title ? undefined : true,
      role: title ? "img" : "presentation",
      focusable: "false",
    },
    title ? react.createElement("title", null, title) : null,
    ...pathList.map((d, index) =>
      react.createElement("path", {
        key: index,
        d,
        stroke: "currentColor",
        strokeWidth: 1.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  );
}

/** Common Fluent-style nav glyphs used by LunarQ shells. */
export function createFluentNavIcons(react: ReactIconApi) {
  return {
    overview: createFluentNavIcon(
      react,
      "M3.5 3.5h5.5v5.5H3.5V3.5Zm7.5 0H16.5V9H11V3.5ZM3.5 11H9v5.5H3.5V11Zm7.5 0h5.5v5.5H11V11Z",
      "Overview",
    ),
    projects: createFluentNavIcon(
      react,
      [
        "M3.5 7h13v8.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V7Z",
        "M7.25 7V5.75A1.75 1.75 0 0 1 9 4h2a1.75 1.75 0 0 1 1.75 1.75V7",
      ],
      "Projects",
    ),
    timesheet: createFluentNavIcon(
      react,
      ["M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z", "M10 6.25v4.1l2.75 1.65"],
      "Timesheet",
    ),
    reports: createFluentNavIcon(
      react,
      ["M4.5 15.5V9", "M8.5 15.5V5.5", "M12.5 15.5v-3.5", "M16.5 15.5V7.5"],
      "Reports",
    ),
    import: createFluentNavIcon(
      react,
      ["M10 3.5v9.25", "M6.75 9.5 10 12.75 13.25 9.5", "M4.5 15.5h11"],
      "Import",
    ),
    settings: createFluentNavIcon(
      react,
      [
        "M10 7.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Z",
        "M10 3.25v1.5M10 15.25v1.5M16.75 10h-1.5M4.75 10h-1.5M14.77 5.23l-1.06 1.06M6.29 13.71l-1.06 1.06M14.77 14.77l-1.06-1.06M6.29 6.29 5.23 5.23",
      ],
      "Settings",
    ),
    help: createFluentNavIcon(
      react,
      [
        "M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z",
        "M7.85 7.6a2.15 2.15 0 1 1 2.9 2c-.55.35-.85.75-.85 1.45V12",
        "M10 14.35h.01",
      ],
      "Help",
    ),
    components: createFluentNavIcon(
      react,
      "M7 3.75 3.75 7 7 10.25 10.25 7 7 3.75Zm6 0L9.75 7 13 10.25 16.25 7 13 3.75ZM7 9.75 3.75 13 7 16.25 10.25 13 7 9.75Zm6 0L9.75 13 13 16.25 16.25 13 13 9.75Z",
      "Components",
    ),
    hooks: createFluentNavIcon(
      react,
      ["M6.5 4v7.25a3.5 3.5 0 0 0 7 0V9", "M13.5 9V4"],
      "Hooks",
    ),
    theme: createFluentNavIcon(
      react,
      "M10 3.5a6.5 6.5 0 1 1-4.7 11.1c1.1-1.25 1.45-2.5 1.05-3.85-.35-1.2.15-2.45 1.25-3.05A4.6 4.6 0 0 0 10 3.5Z",
      "Theme",
    ),
    admin: createFluentNavIcon(
      react,
      ["M10 3.75 16.25 6.5v2.9c0 3.55-2.4 6.15-6.25 7.35-3.85-1.2-6.25-3.8-6.25-7.35V6.5L10 3.75Z"],
      "Admin",
    ),
    auth: createFluentNavIcon(
      react,
      ["M6.75 9V7.1a3.25 3.25 0 0 1 6.5 0V9", "M5.25 9.25h9.5V16.5h-9.5V9.25Z"],
      "Auth",
    ),
    maintenance: createFluentNavIcon(
      react,
      ["M12.75 4.25a3 3 0 0 0-4.05 3.45L4.25 12.15V15.75h3.6l4.45-4.45a3 3 0 0 0 .45-7.05Z"],
      "Maintenance",
    ),
    utils: createFluentNavIcon(
      react,
      ["M4.25 5.5h11.5", "M4.25 10h11.5", "M4.25 14.5h11.5"],
      "Utils",
    ),
  };
}

export type FluentNavIcons = ReturnType<typeof createFluentNavIcons>;
