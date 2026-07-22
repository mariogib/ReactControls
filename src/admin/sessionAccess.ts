export interface SessionUserLike {
  profile?: Record<string, unknown> | null;
  access_token?: string | null;
}

const roleClaimNames = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role",
];

const systemAdministratorRoles = new Set([
  "systemadministrator",
  "system administrator",
  "systemadmin",
  "system admin",
  "lunarqsuperadmin",
  "lunarq super admin",
  "superadmin",
  "super admin",
]);

export function getRolesFromSessionUser(user: SessionUserLike | null | undefined): string[] {
  if (!user) {
    return [];
  }

  const roles = new Set<string>();
  collectRoles(user.profile, roles);
  collectRoles(user.access_token ? parseJwtPayload(user.access_token) : null, roles);
  return Array.from(roles);
}

export function isSystemAdministratorUser(user: SessionUserLike | null | undefined): boolean {
  return getRolesFromSessionUser(user).some((role) => systemAdministratorRoles.has(normalizeRole(role)));
}

function collectRoles(source: unknown, roles: Set<string>) {
  if (!source || typeof source !== "object") {
    return;
  }

  const claims = source as Record<string, unknown>;
  for (const claimName of roleClaimNames) {
    const raw = claims[claimName];
    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const value of values) {
      if (typeof value === "string" && value.trim()) {
        roles.add(value.trim());
      }
    }
  }
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}
