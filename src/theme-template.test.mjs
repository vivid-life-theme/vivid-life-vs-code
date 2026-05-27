import { test } from "node:test";
import assert from "node:assert/strict";
import tokens from "@vivid-life-theme/design-system";
import { buildTheme } from "./theme-template.mjs";

// Look up a tokenColors entry by its `name` field.
function findRule(theme, name) {
  const rule = theme.tokenColors.find((r) => r.name === name);
  if (!rule) throw new Error(`No tokenColors rule named "${name}"`);
  return rule.settings;
}

// Smoke test: buildTheme runs without throwing for all 24 combinations.
test("buildTheme produces output for all 24 flavor×variant combinations", () => {
  const flavors = ["midnight", "twilight", "dawn", "noon"];
  const variants = ["red", "orange", "yellow", "green", "blue", "purple"];
  for (const flavor of flavors) {
    for (const variant of variants) {
      const theme = buildTheme(flavor, variant, tokens);
      assert.ok(theme.colors, `${flavor}+${variant}: missing colors`);
      assert.ok(
        theme.tokenColors.length > 0,
        `${flavor}+${variant}: empty tokenColors`,
      );
      assert.ok(
        theme.semanticTokenColors,
        `${flavor}+${variant}: missing semanticTokenColors`,
      );
    }
  }
});
