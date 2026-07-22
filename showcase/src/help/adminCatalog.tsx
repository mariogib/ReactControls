import React from "react";
import {
  createButton,
  createSessionInfo,
  createStatusMessage,
  createUseAdminUser,
  getRolesFromSessionUser,
  isSystemAdministratorUser,
} from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const Button = createButton(React);
const SessionInfo = createSessionInfo(React);
const StatusMessage = createStatusMessage(React);
const useAdminUser = createUseAdminUser(React);

const mockUserManager = {
  async getUser() {
    return {
      profile: {
        name: "System Administrator",
        email: "admin@lunarq.com",
        sub: "system-admin-1",
        roles: ["system administrator", "operator"],
      },
      access_token: "demo-token",
      scope: "openid profile email roles",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    };
  },
};

function SessionInfoExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <p className="showcase-copy">Session dropdown used in the admin top bar.</p>
      <div className="showcase-help-session-host">
        <SessionInfo
          userManager={mockUserManager}
          apiLabel="https://api.example.lunarq"
          authority="https://identity.example.lunarq"
          formatDateTime={(value) =>
            value.toLocaleString("en-ZA", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        />
      </div>
    </div>
  );
}

function UseAdminUserExample() {
  const { userName, userEmail } = useAdminUser(async () => ({
    name: "Ava Patel",
    email: "ava@lunarq.com",
  }));

  return (
    <StatusMessage
      tone="info"
      title={userName || "Loading user…"}
      detail={userEmail || "Resolving admin display identity"}
    />
  );
}

function SessionAccessExample() {
  const user = {
    profile: {
      roles: ["system administrator", "editor"],
    },
  };
  const roles = getRolesFromSessionUser(user);
  const isAdmin = isSystemAdministratorUser(user);

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone={isAdmin ? "success" : "warning"}
        title={isAdmin ? "System administrator" : "Standard user"}
        detail={`Roles: ${roles.join(", ")}`}
      />
      <Button variant="secondary" onClick={() => undefined}>
        Access helpers are pure functions
      </Button>
    </div>
  );
}

function AdminShellExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <StatusMessage
        tone="info"
        title="AdminShell"
        detail="This showcase is already wrapped in createAdminShell. Use the top-bar arrow control to hide or show the sidebar. Pass navItems, logo, topBarContent, and sign-out."
      />
      <pre className="showcase-code-block">{`const AdminShell = createAdminShell(React, NavLink);

<AdminShell
  navItems={[
    { to: "/app", end: true, label: "Overview", icon: "📊" },
    {
      to: "/app/help",
      label: "Help",
      icon: "❓",
      children: [
        { to: "/app/help/components", label: "Components", icon: "🧩" },
        { to: "/app/help/hooks", label: "Hooks", icon: "🪝" },
      ],
    },
  ]}
  logo={<div>Logo</div>}
  userName="Admin"
  userEmail="admin@lunarq.com"
  defaultSidebarOpen
  onSignOut={() => {}}
>
  <Outlet />
</AdminShell>`}</pre>
    </div>
  );
}

export const ADMIN_HELP_GROUPS: HelpGroup[] = [
  {
    id: "adminShell",
    eyebrow: "Admin",
    title: "Shell & Session",
    items: [
      {
        id: "adminShell",
        title: "AdminShell",
        description:
          "App chrome with hideable sidebar nav, optional submenus, top-bar menu toggle, and sign-out.",
        code: snippetCode(
          'import { createAdminShell } from "@lunarq/frontend-shared";\nimport { NavLink } from "react-router-dom";',
          "const AdminShell = createAdminShell(React, NavLink);",
          `export function AppShell({ children }) {
  return (
    <AdminShell
      navItems={[{ to: "/app", end: true, label: "Overview", icon: "📊" }]}
      logo={<div>Logo</div>}
      userName="Admin"
      userEmail="admin@lunarq.com"
      defaultSidebarOpen
      onSignOut={() => {}}
    >
      {children}
    </AdminShell>
  );
}`,
        ),
        Example: AdminShellExample,
      },
      {
        id: "sessionInfo",
        title: "SessionInfo",
        description: "Session dropdown showing profile, roles, scopes, API, and authority.",
        code: snippetCode(
          'import { createSessionInfo } from "@lunarq/frontend-shared";',
          "const SessionInfo = createSessionInfo(React);",
          `export function Example({ userManager }) {
  return (
    <SessionInfo
      userManager={userManager}
      apiLabel="https://api.example.lunarq"
      authority="https://identity.example.lunarq"
      formatDateTime={(value) => value.toLocaleString()}
    />
  );
}`,
        ),
        Example: SessionInfoExample,
      },
      {
        id: "useAdminUser",
        title: "useAdminUser",
        description: "Resolve display name/email for the admin shell user block.",
        code: snippetCode(
          'import { createUseAdminUser } from "@lunarq/frontend-shared";',
          "const useAdminUser = createUseAdminUser(React);",
          `export function Example() {
  const { userName, userEmail } = useAdminUser(async () => ({
    name: "Ava Patel",
    email: "ava@lunarq.com",
  }));
  return <div>{userName} · {userEmail}</div>;
}`,
        ),
        Example: UseAdminUserExample,
      },
      {
        id: "sessionAccess",
        title: "Session access helpers",
        description: "getRolesFromSessionUser and isSystemAdministratorUser for role checks.",
        code: snippetCode(
          'import { getRolesFromSessionUser, isSystemAdministratorUser } from "@lunarq/frontend-shared";',
          "",
          `const roles = getRolesFromSessionUser(user);
const isAdmin = isSystemAdministratorUser(user);`,
        ),
        Example: SessionAccessExample,
      },
    ],
  },
];
