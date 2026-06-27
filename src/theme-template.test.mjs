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

  const bold = findRule(theme, "strong");
  assert.equal(bold.foreground, syntax.number);
  assert.equal(bold.fontStyle, "bold");

  const italic = findRule(theme, "emphasis");
  assert.equal(italic.foreground, syntax.type);
  assert.equal(italic.fontStyle, "italic");

  const boldItalic = findRule(theme, "Markdown bold+italic");
  assert.equal(boldItalic.foreground, syntax.type);
  assert.equal(boldItalic.fontStyle, "bold italic");

  const linkText = findRule(theme, "Markdown link text");
  assert.equal(linkText.foreground, syntax.function);

  const linkUrl = findRule(theme, "link");
  assert.equal(linkUrl.foreground, syntax.tag);
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
});

test("Variable semantics", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const lang = findRule(theme, "lang_var");
  assert.equal(lang.foreground, syntax.constant);
  assert.equal(lang.fontStyle, "italic");

  const param = findRule(theme, "parameter");
  assert.equal(param.foreground, syntax.parameter);
  assert.equal(param.fontStyle, "italic");
});

test("JSDoc coloring", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;

  const tags = findRule(theme, "doc_keyword");
  assert.equal(tags.foreground, syntax.keyword);

  const typeRef = findRule(theme, "doc_type");
  assert.equal(typeRef.foreground, syntax.type);
  assert.equal(typeRef.fontStyle, "italic");

  const paramName = findRule(theme, "doc_param");
  assert.equal(paramName.foreground, syntax.parameter);
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
  const f = tokens.flavors.midnight;
  const syntax = f.syntax;

  const type = findRule(theme, "type");
  assert.equal(type.fontStyle, undefined);

  const attr = findRule(theme, "attr");
  assert.equal(attr.fontStyle, undefined);

  const invalid = findRule(theme, "invalid");
  assert.equal(invalid.foreground, f.semantic.danger);
  assert.equal(invalid.fontStyle, "italic underline");

  const deprecated = findRule(theme, "invalid_deprecated");
  assert.equal(deprecated.foreground, f.text.fg);
  assert.equal(deprecated.fontStyle, "italic underline");
});

test("Semantic token consistency", () => {
  const theme = buildTheme("midnight", "purple", tokens);
  const syntax = tokens.flavors.midnight.syntax;
  const sem = theme.semanticTokenColors;

  assert.equal(sem.parameter.foreground, syntax.parameter);
  assert.equal(sem.parameter.fontStyle, "italic");

  assert.equal(sem.typeParameter.foreground, syntax.parameter);
  assert.equal(sem.typeParameter.fontStyle, "");

  assert.equal(sem["*.defaultLibrary"].fontStyle, "italic");

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
