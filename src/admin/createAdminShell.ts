type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
  Fragment: any;
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
  onSignOut: () => void | Promise<void>;
  children: ReactNodeLike;
}

function isNavGroup(item: AdminNavItem): item is AdminNavGroup {
  return Array.isArray((item as AdminNavGroup).children);
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
  }: AdminShellProps): any {
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
          className: ({ isActive }: NavLinkRenderArgs) => (isActive ? "nav-item active" : "nav-item"),
        },
        ...sharedChildren,
      );
    }

    const navContent = navItems.map((item) => {
      if (isNavGroup(item)) {
        const open = item.defaultOpen !== false;
        return react.createElement(
          "details",
          {
            key: `group-${item.label}`,
            className: "nav-group",
            open,
          },
          react.createElement(
            "summary",
            { className: "nav-group-summary" },
            react.createElement("span", { className: "nav-icon" }, item.icon),
            react.createElement("span", { className: "nav-label" }, item.label),
            react.createElement("span", { className: "nav-group-chevron", "aria-hidden": true }, "▾"),
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

    return react.createElement(
      "div",
      { className: "admin-layout" },
      react.createElement(
        "aside",
        { className: "sidebar" },
        react.createElement("div", { className: "sidebar-header" }, logo),
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
          react.createElement(
            "button",
            { className: "sidebar-logout-btn", onClick: onSignOut, type: "button" },
            "Sign Out",
          ),
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
            react.createElement("div", { className: "user-menu" }, topBarContent),
          ),
        ),
        react.createElement("main", { className: "content-area" }, contentOverlay, children),
      ),
    );
  };
}
