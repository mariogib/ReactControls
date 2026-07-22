import { readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

function findTestFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTestFiles(full));
    } else if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      results.push(full);
    }
  }
  return results;
}

const files = findTestFiles("src");
if (files.length === 0) {
  console.error("No test files found");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");

execFileSync(process.execPath, [tsxCli, "--test", ...files], { stdio: "inherit" });
