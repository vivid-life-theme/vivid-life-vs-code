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

test("Markdown inline formatting", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const bold = findRule(theme, "Markdown bold");
  assert.equal(bold.foreground, syntax.number);
  assert.equal(bold.fontStyle, "bold");

  const italic = findRule(theme, "Markdown italic");
  assert.equal(italic.foreground, syntax.type);
  assert.equal(italic.fontStyle, "italic");

  const boldItalic = findRule(theme, "Markdown bold+italic");
  assert.equal(boldItalic.foreground, syntax.type);
  assert.equal(boldItalic.fontStyle, "bold italic");

  const linkText = findRule(theme, "Markdown link text");
  assert.equal(linkText.foreground, syntax.function);

  const linkUrl = findRule(theme, "Markdown link URL");
  assert.equal(linkUrl.foreground, syntax.string);
});

test("Markdown structural elements", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const quote = findRule(theme, "Markdown quote");
  assert.equal(quote.foreground, syntax.type);
  assert.equal(quote.fontStyle, "italic");

  const bullet = findRule(theme, "Markdown list bullet");
  assert.equal(bullet.foreground, syntax.tag);

  const hr = findRule(theme, "Markdown horizontal rule");
  assert.equal(hr.foreground, syntax.comment);

  const headingPunct = findRule(theme, "Markdown heading punctuation");
  assert.equal(headingPunct.foreground, syntax.comment);
});

test("Variable semantics", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const lang = findRule(theme, "Language variable / this / self / super");
  assert.equal(lang.foreground, syntax.constant);
  assert.equal(lang.fontStyle, "italic");

  const param = findRule(theme, "Parameter");
  assert.equal(param.foreground, syntax.parameter);
  assert.equal(param.fontStyle, "italic");
});

test("JSDoc coloring", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const tags = findRule(theme, "JSDoc tag");
  assert.equal(tags.foreground, syntax.keyword);

  const typeRef = findRule(theme, "JSDoc type reference");
  assert.equal(typeRef.foreground, syntax.function);
  assert.equal(typeRef.fontStyle, "italic");

  const paramName = findRule(theme, "JSDoc parameter name");
  assert.equal(paramName.foreground, syntax.number);
  assert.equal(paramName.fontStyle, "italic");
});

test("Language-specific tokens", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const escape = findRule(theme, "Escape sequence");
  assert.equal(escape.foreground, syntax.keyword);

  const shellVar = findRule(theme, "Shell variable");
  assert.equal(shellVar.foreground, syntax.keyword);

  const yamlAlias = findRule(theme, "YAML alias");
  assert.equal(yamlAlias.foreground, syntax.string);
  assert.equal(yamlAlias.fontStyle, "italic underline");

  const pyDoc = findRule(theme, "Python docstring");
  assert.equal(pyDoc.foreground, syntax.comment);
  assert.equal(pyDoc.fontStyle, "italic");
});

test("Structural and semantic cleanup", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const type = findRule(theme, "Type");
  assert.equal(type.fontStyle, "");

  const attr = findRule(theme, "Attribute name");
  assert.equal(attr.fontStyle, "italic");

  const invalid = findRule(theme, "Invalid");
  assert.equal(invalid.foreground, syntax.regex);
  assert.equal(invalid.fontStyle, "italic underline");

  const deprecated = findRule(theme, "Deprecated");
  assert.equal(deprecated.foreground, syntax.regex);
  assert.equal(deprecated.fontStyle, "italic");
});

test("Semantic token consistency", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;
  const sem = theme.semanticTokenColors;

  assert.equal(sem.parameter.foreground, syntax.parameter);
  assert.equal(sem.parameter.fontStyle, "italic");

  assert.equal(sem["variable.defaultLibrary"].foreground, syntax.keyword);
  assert.equal(sem["variable.defaultLibrary"].fontStyle, "italic");

  assert.equal(sem.class.fontStyle, "");
  assert.equal(sem.type.fontStyle, "");
  assert.equal(sem.interface.fontStyle, "");
  assert.equal(sem.enum.fontStyle, "");
  assert.equal(sem.struct.fontStyle, "");
});

test("Status bar remote item uses bg_sunk and text.fg — all 4 flavors", () => {
  const flavors = ["midnight", "twilight", "dawn", "noon"];
  for (const flavor of flavors) {
    const theme = buildTheme(flavor, "purple", tokens);
    const f = tokens.flavors[flavor];
    assert.equal(
      theme.colors["statusBarItem.remoteBackground"],
      f.surface.bg_sunk,
      `${flavor}: remoteBackground should be bg_sunk (${f.surface.bg_sunk})`,
    );
    assert.equal(
      theme.colors["statusBarItem.remoteForeground"],
      f.text.fg,
      `${flavor}: remoteForeground should be text.fg (${f.text.fg})`,
    );
  }
});
