/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { getRolesFromSessionUser, isSystemAdministratorUser } from "./sessionAccess.js";

function createJwtPayload(payload: Record<string, unknown>) {
  const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.`;
}

test("getRolesFromSessionUser collects roles from profile and access token", () => {
  const user = {
    profile: {
      role: "Operations",
    },
    access_token: createJwtPayload({ roles: ["LunarQSuperAdmin"] }),
  };

  const roles = getRolesFromSessionUser(user);

  assert.deepEqual(roles.sort(), ["Operations", "LunarQSuperAdmin"].sort());
});

test("isSystemAdministratorUser recognizes normalized admin roles", () => {
  const user = {
    profile: {
      roles: ["system administrator"],
    },
  };

  assert.equal(isSystemAdministratorUser(user), true);
});

test("isSystemAdministratorUser returns false when no admin roles exist", () => {
  const user = {
    profile: {
      roles: ["viewer"],
    },
  };

  assert.equal(isSystemAdministratorUser(user), false);
});
