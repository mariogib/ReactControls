import type React from "react";

export type HelpItem = {
  id: string;
  title: string;
  description: string;
  code: string;
  Example: () => React.ReactNode;
};

export type HelpGroup = {
  id: string;
  eyebrow: string;
  title: string;
  items: HelpItem[];
};

export type HelpSection = {
  id: string;
  title: string;
  description: string;
  groups: HelpGroup[];
};

export function factoryCode(factoryName: string, binding: string, body: string) {
  return [
    'import React from "react";',
    `import { ${factoryName} } from "@lunarq/frontend-shared";`,
    "",
    `const ${binding} = ${factoryName}(React);`,
    "",
    body.trim(),
  ].join("\n");
}

export function snippetCode(imports: string, setup: string, body: string) {
  return [
    'import React from "react";',
    imports.trim(),
    "",
    setup.trim(),
    "",
    body.trim(),
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");
}
