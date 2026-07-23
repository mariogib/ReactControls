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

export type AdminNavLeaf = {
  label: string;
  icon: string;
} & (InternalAdminNavItem | ExternalAdminNavItem);

export type AdminNavGroup = {
  label: string;
  icon: string;
  children: AdminNavLeaf[];
  /** When true, the submenu starts expanded. Defaults to true. */
  defaultOpen?: boolean;
};

export type AdminNavItem = AdminNavLeaf | AdminNavGroup;

export interface AdminShellProps {
  navItems: AdminNavItem[];
  logo: ReactNodeLike;
  topBarContent?: ReactNodeLike;
  contentOverlay?: ReactNodeLike;
  userName: string;
  userEmail: string;
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
}

function isNavGroup(item: AdminNavItem): item is AdminNavGroup {
  return Array.isArray((item as AdminNavGroup).children);
}

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function createAdminShell(react: ReactElementApi, NavLink: NavLinkComponent) {
  return function AdminShell({
    navItems,
    logo,
    topBarContent = null,
    contentOverlay = null,
    userName,
    userEmail,
    onSignOut,
    children,
    sidebarOpen,
    defaultSidebarOpen = true,
    onSidebarOpenChange,
    sidebarToggleLabel,
  }: AdminShellProps): any {
    const isControlled = sidebarOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = react.useState(defaultSidebarOpen);
    const open = isControlled ? Boolean(sidebarOpen) : uncontrolledOpen;

    function setOpen(next: boolean) {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onSidebarOpenChange?.(next);
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

      const internalItem = item as AdminNavLeaf & InternalAdminNavItem;
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
        react.createElement(
          "div",
          { className: "sidebar-user" },
          react.createElement(
            "div",
            { className: "user-info" },
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
            react.createElement("div", { className: "user-menu" }, topBarContent),
          ),
        ),
        react.createElement("main", { className: "content-area" }, contentOverlay, children),
      ),
    );
  };
}
