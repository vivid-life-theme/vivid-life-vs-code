// Reads foundation tokens from @vivid-life-theme/design-system,
// emits one VS Code color-theme JSON per (flavor, variant).

import { mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tokens from "@vivid-life-theme/design-system";

import { buildTheme } from "./src/theme-template.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = join(__dirname, "themes");

const flavors = ["midnight", "twilight", "dawn", "noon"];
const variants = tokens.variant_hues;

mkdirSync(THEMES_DIR, { recursive: true });

// Clean stale theme files so renames don't leave orphans.
for (const file of readdirSync(THEMES_DIR)) {
  if (file.endsWith(".json")) {
    rmSync(join(THEMES_DIR, file));
  }
}

let count = 0;
for (const flavor of flavors) {
  for (const variant of variants) {
    const theme = buildTheme(flavor, variant, tokens);
    const fileName = `vivid-life-${flavor}-${variant}.json`;
    writeFileSync(
      join(THEMES_DIR, fileName),
      JSON.stringify(theme, null, 2) + "\n",
      "utf8",
    );
    count++;
  }
}

console.log(
  `Built ${count} themes (${flavors.length} flavors x ${variants.length} variants) into themes/`,
);
