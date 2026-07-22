import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(packageRoot, "src");
const outputDirectory = path.join(packageRoot, "dist");

await mkdir(outputDirectory, { recursive: true });

await cp(sourceDirectory, outputDirectory, {
  filter: (itemPath) => {
    const relativePath = path.relative(sourceDirectory, itemPath);
    return !relativePath || !path.extname(relativePath) || itemPath.endsWith(".css");
  },
  recursive: true,
});
