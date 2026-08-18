type ReactNodeLike = any;
type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
  Fragment: any;
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
}

type NavLinkRenderArgs = {
  isActive: boolean;
};

type NavLinkComponent = any;

type ExternalAdminNavItem = {
  href: string;
  target?: string;
  rel?: string;
  to?: never;
  end?: never;
};

type InternalAdminNavItem = {
  to: string;
  end?: boolean;
  href?: never;
};

type ActionAdminNavItem = {
  id: string;
  onSelect: () => void;
  active?: boolean;
  disabled?: boolean;
  to?: never;
  href?: never;
  end?: never;
};

export type AdminNavLeaf = {
  label: string;
  /** Glyph, emoji, or Fluent SVG node (`createFluentNavIcons`). */
  icon: ReactNodeLike;
} & (InternalAdminNavItem | ExternalAdminNavItem | ActionAdminNavItem);

export type AdminNavGroup = {
  label: string;
  /** Glyph, emoji, or Fluent SVG node (`createFluentNavIcons`). */
  icon: ReactNodeLike;
  children: AdminNavLeaf[];
  /** When true, the submenu starts expanded. Defaults to true. */
  defaultOpen?: boolean;
};

export type AdminNavItem = AdminNavLeaf | AdminNavGroup;

export interface AdminShellProps {
  navItems: AdminNavItem[];
  logo: ReactNodeLike;
  /** Primary top-bar content (typically page title). */
  topBarContent?: ReactNodeLike;
  /**
   * Right-side controls rendered in the same row as shell Refresh
   * (e.g. status badges, ThemeButton).
   */
  topBarActions?: ReactNodeLike;
  /** Optional banner rendered above the top bar in the main content column. */
  mainBanner?: ReactNodeLike;
  /** Optional controls rendered between sidebar navigation and the user block. */
  sidebarActions?: ReactNodeLike;
  contentOverlay?: ReactNodeLike;
  userName: string;
  userEmail: string;
  /** Optional supporting content shown below the user email (for example, tenant name). */
  userMeta?: ReactNodeLike;
  /** When provided, the sidebar user block becomes an accessible button. */
  onUserClick?: () => void;
  /** Accessible label for the clickable user block. Defaults to `Open user profile`. */
  userActionLabel?: string;
  /** When provided, shows a Sign Out control under the sidebar user block. */
  onSignOut?: () => void | Promise<void>;
  children: ReactNodeLike;
  /** Controlled sidebar visibility. */
  sidebarOpen?: boolean;
  /** Uncontrolled initial visibility. Defaults to `true`. */
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /** Accessible label for the menu toggle. */
  sidebarToggleLabel?: string;
  /**
   * Show a top-bar Refresh control in the shared controls row.
   * Defaults to `true`.
   */
  showContentRefresh?: boolean;
  /** Button label. Defaults to `Refresh`. */
  contentRefreshLabel?: string;
  /** Accessible name for the refresh control. Defaults to `Refresh page content`. */
  contentRefreshAriaLabel?: string;
  /**
   * Called when Refresh is clicked, after the content area is scheduled to remount.
   * Use this to invalidate queries or reload remote data.
   */
  onContentRefresh?: () => void | Promise<void>;
}

function isNavGroup(item: AdminNavItem): item is AdminNavGroup {
  return Array.isArray((item as AdminNavGroup).children);
}

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function createAdminShell(react: ReactElementApi, NavLink?: NavLinkComponent) {
  return function AdminShell({
    navItems,
    logo,
    topBarContent = null,
    topBarActions = null,
    mainBanner = null,
    sidebarActions = null,
    contentOverlay = null,
    userName,
    userEmail,
    userMeta = null,
    onUserClick,
    userActionLabel = "Open user profile",
    onSignOut,
    children,
    sidebarOpen,
    defaultSidebarOpen = true,
    onSidebarOpenChange,
    sidebarToggleLabel,
    showContentRefresh = true,
    contentRefreshLabel = "Refresh",
    contentRefreshAriaLabel = "Refresh page content",
    onContentRefresh,
  }: AdminShellProps): any {
    const isControlled = sidebarOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = react.useState(defaultSidebarOpen);
    const [contentRevision, setContentRevision] = react.useState(0);
    const open = isControlled ? Boolean(sidebarOpen) : uncontrolledOpen;

    function setOpen(next: boolean) {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onSidebarOpenChange?.(next);
    }

    function handleContentRefresh() {
      setContentRevision((value) => value + 1);
      void onContentRefresh?.();
    }

    function renderLeaf(item: AdminNavLeaf, keyPrefix = "") {
      const sharedChildren = [
        react.createElement("span", { className: "nav-icon", key: "icon" }, item.icon),
        react.createElement("span", { className: "nav-label", key: "label" }, item.label),
      ];

      if ("href" in item) {
        const externalItem = item as AdminNavLeaf & ExternalAdminNavItem;
        return react.createElement(
          "a",
          {
            key: `${keyPrefix}${externalItem.href}`,
            href: externalItem.href,
            className: "nav-item",
            title: item.label,
            target: externalItem.target ?? "_blank",
            rel: externalItem.rel ?? "noopener noreferrer",
          },
          ...sharedChildren,
        );
      }

      if ("onSelect" in item) {
        const actionItem = item as AdminNavLeaf & ActionAdminNavItem;
        return react.createElement(
          "button",
          {
            key: `${keyPrefix}${actionItem.id}`,
            type: "button",
            className: actionItem.active ? "nav-item active" : "nav-item",
            title: item.label,
            "aria-current": actionItem.active ? "page" : undefined,
            disabled: actionItem.disabled,
            onClick: actionItem.onSelect,
          },
          ...sharedChildren,
        );
      }

      const internalItem = item as AdminNavLeaf & InternalAdminNavItem;
      if (!NavLink) {
        throw new Error(
          `AdminShell navigation item "${item.label}" requires a NavLink adapter.`,
        );
      }
      return react.createElement(
        NavLink,
        {
          key: `${keyPrefix}${internalItem.to}`,
          to: internalItem.to,
          end: internalItem.end,
          title: item.label,
          className: ({ isActive }: NavLinkRenderArgs) =>
            isActive ? "nav-item active" : "nav-item",
        },
        ...sharedChildren,
      );
    }

    const navContent = navItems.map((item) => {
      if (isNavGroup(item)) {
        const groupOpen = item.defaultOpen !== false;
        return react.createElement(
          "details",
          {
            key: `group-${item.label}`,
            className: "nav-group",
            // Keep groups expanded while collapsed so child icons remain reachable.
            open: open ? groupOpen : true,
          },
          react.createElement(
            "summary",
            { className: "nav-group-summary", title: item.label },
            react.createElement("span", { className: "nav-icon" }, item.icon),
            react.createElement("span", { className: "nav-label" }, item.label),
            react.createElement(
              "span",
              { className: "nav-group-chevron", "aria-hidden": true },
              "▾",
            ),
          ),
          react.createElement(
            "div",
            { className: "nav-submenu" },
            ...item.children.map((child) => renderLeaf(child, `${item.label}-`)),
          ),
        );
      }

      return renderLeaf(item);
    });

    const toggleLabel =
      sidebarToggleLabel ?? (open ? "Collapse sidebar" : "Expand sidebar");

    return react.createElement(
      "div",
      {
        className: classNames("admin-layout", !open && "sidebar-collapsed"),
      },
      react.createElement(
        "aside",
        {
          id: "admin-sidebar",
          className: "sidebar",
        },
        react.createElement(
          "div",
          { className: "sidebar-header" },
          logo,
          react.createElement(
            "button",
            {
              type: "button",
              className: "sidebar-close-btn",
              "aria-label": "Close menu",
              onClick: () => setOpen(false),
            },
            react.createElement("span", { "aria-hidden": true }, "\u00D7"),
          ),
        ),
        react.createElement("nav", { className: "sidebar-nav" }, ...navContent),
        sidebarActions
          ? react.createElement("div", { className: "sidebar-actions" }, sidebarActions)
          : null,
        react.createElement(
          "div",
          { className: "sidebar-user" },
          react.createElement(
            onUserClick ? "button" : "div",
            {
              className: classNames("user-info", onUserClick && "user-info-button"),
              ...(onUserClick
                ? {
                    type: "button",
                    onClick: onUserClick,
                    "aria-label": userActionLabel,
                  }
                : {}),
            },
            react.createElement(
              "div",
              { className: "user-avatar" },
              react.createElement("span", null, userName.charAt(0).toUpperCase()),
            ),
          react.createElement(
            "div",
            { className: "user-details" },
            react.createElement("div", { className: "user-name" }, userName),
            react.createElement("div", { className: "user-email" }, userEmail),
              userMeta
                ? react.createElement("div", { className: "user-meta" }, userMeta)
                : null,
          ),
        ),
        onSignOut
          ? react.createElement(
              "button",
              { className: "sidebar-logout-btn", onClick: onSignOut, type: "button" },
              "Sign Out",
            )
          : null,
        ),
      ),
      react.createElement(
        "div",
        { className: "main-content" },
        mainBanner
          ? react.createElement("div", { className: "admin-main-banner" }, mainBanner)
          : null,
        react.createElement(
          "header",
          { className: "top-bar" },
          react.createElement(
            "div",
            { className: "top-bar-content" },
            react.createElement(
              "div",
              { className: "top-bar-start" },
              react.createElement(
                "button",
                {
                  type: "button",
                  className: "sidebar-toggle-btn",
                  "aria-label": toggleLabel,
                  "aria-controls": "admin-sidebar",
                  "aria-expanded": open,
                  onClick: () => setOpen(!open),
                },
                react.createElement(
                  "span",
                  { className: "sidebar-toggle-hamburger", "aria-hidden": true },
                  "\u2630",
                ),
                react.createElement(
                  "span",
                  {
                    className: `sidebar-toggle-icon sidebar-toggle-icon-${open ? "left" : "right"}`,
                    "aria-hidden": true,
                  },
                ),
              ),
            ),
            react.createElement(
              "div",
              { className: "user-menu" },
              topBarContent
                ? react.createElement("div", { className: "top-bar-primary" }, topBarContent)
                : null,
              topBarActions || showContentRefresh
                ? react.createElement(
                    "div",
                    { className: "top-bar-controls" },
                    topBarActions,
                    showContentRefresh
                      ? react.createElement(
                          "button",
                          {
                            type: "button",
                            className: "content-refresh-btn",
                            "aria-label": contentRefreshAriaLabel,
                            title: contentRefreshAriaLabel,
                            onClick: handleContentRefresh,
                          },
                          react.createElement(
                            "span",
                            { className: "content-refresh-icon", "aria-hidden": true },
                            "\u21BB",
                          ),
                          react.createElement(
                            "span",
                            { className: "content-refresh-label" },
                            contentRefreshLabel,
                          ),
                        )
                      : null,
                  )
                : null,
            ),
          ),
        ),
        react.createElement(
          "main",
          { className: "content-area", key: `content-${contentRevision}` },
          contentOverlay,
          children,
        ),
      ),
    );
  };
}
