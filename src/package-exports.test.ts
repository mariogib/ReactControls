/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type ExportTarget = string | { types?: string; import?: string };

test("frontend-shared package exports define required public subpaths", () => {
  const packagePath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
    exports?: Record<string, ExportTarget>;
  };

  const exportsMap = packageJson.exports;
  assert.ok(exportsMap, "package exports must be defined");

  const requiredSubpaths = [
    ".",
    "./admin",
    "./auth",
    "./components",
    "./hooks",
    "./maintenance",
    "./theme",
    "./theme/index.css",
    "./utils",
    "./react-fields",
  ];

  for (const subpath of requiredSubpaths) {
    assert.ok(exportsMap[subpath], `missing export subpath: ${subpath}`);
  }

  const reactFieldsExport = exportsMap["./react-fields"] as {
    types?: string;
    import?: string;
  };
  assert.equal(reactFieldsExport.types, "./dist/react-fields.d.ts");
  assert.equal(reactFieldsExport.import, "./dist/react-fields.js");
});
