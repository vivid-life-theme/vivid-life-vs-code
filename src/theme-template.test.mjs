import { test } from "node:test";
import assert from "node:assert/strict";
import tokens from "@vivid-life-theme/design-system";
import { contrast } from "@vivid-life-theme/design-system/tools/build-tokens";
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

test("Status bar remote item uses reserved ansi.cyan and accent-on-style text — all 4 flavors", () => {
  // Deliberately not surface.bg_sunk / text.fg: commit 8a81d74 moved this to
  // ansi.cyan (fixed per-flavor, outside variant_hues) so it can't collide
  // with semantic.danger/warning the way the accent color did, with a
  // contrasting accentOn-style foreground (same trick as
  // editor.wordHighlightBackground) rather than the normal body-text color.
  const flavors = ["midnight", "twilight", "dawn", "noon"];
  for (const flavor of flavors) {
    const theme = buildTheme(flavor, "purple", tokens);
    const f = tokens.flavors[flavor];
    const accentOn =
      f.type === "dark"
        ? tokens.palette.gray["900"]
        : tokens.palette.gray["100"];
    assert.equal(
      theme.colors["statusBarItem.remoteBackground"],
      f.ansi.cyan,
      `${flavor}: remoteBackground should be ansi.cyan (${f.ansi.cyan})`,
    );
    assert.equal(
      theme.colors["statusBarItem.remoteForeground"],
      accentOn,
      `${flavor}: remoteForeground should be accent-on-style text (${accentOn})`,
    );
  }
});

test("Panel background is distinct from editor background — all 4 flavors", () => {
  const flavors = ["midnight", "twilight", "dawn", "noon"];
  for (const flavor of flavors) {
    const theme = buildTheme(flavor, "purple", tokens);
    const f = tokens.flavors[flavor];
    assert.equal(
      theme.colors["panel.background"],
      f.surface.bg_sunk,
      `${flavor}: panel.background should be surface.bg_sunk (${f.surface.bg_sunk})`,
    );
    assert.notEqual(
      theme.colors["panel.background"],
      theme.colors["editor.background"],
      `${flavor}: panel.background must not match editor.background — that's the bug this test guards against`,
    );
    // terminal.background uses surface.bg_terminal (design-system 0.6.0+),
    // the surface tier verified against all 16 ansi.* colors per flavor —
    // see vivid-life-design-system issue #5. It's distinct from
    // panel.background on all 4 flavors.
    assert.equal(
      theme.colors["terminal.background"],
      f.surface.bg_terminal,
      `${flavor}: terminal.background should be surface.bg_terminal (${f.surface.bg_terminal})`,
    );
    // On dawn only, bg_terminal == bg (design-system 0.7.0 / issue #7):
    // dawn's ANSI normal set can't go lighter than #d2d2d2 without dropping
    // below AA, and everything above that collides with noon, so dawn's
    // terminal fill fell back to the flavor canvas. In this embedded port
    // the terminal panel still reads as a distinct region via bg_inset
    // chrome + border, just not via fill — see the design-system README's
    // "Dawn's terminal panel has no fill of its own" caveat.
    if (flavor === "dawn") {
      assert.equal(
        theme.colors["terminal.background"],
        theme.colors["editor.background"],
        `${flavor}: terminal.background is expected to match editor.background (bg_terminal == bg on dawn)`,
      );
    } else {
      assert.notEqual(
        theme.colors["terminal.background"],
        theme.colors["editor.background"],
        `${flavor}: terminal.background must not match editor.background`,
      );
    }
    // terminalCursor.background must track terminal.background exactly —
    // it's the color painted under a block cursor, so any mismatch would
    // show as a mis-colored cell.
    assert.equal(
      theme.colors["terminalCursor.background"],
      theme.colors["terminal.background"],
      `${flavor}: terminalCursor.background must match terminal.background`,
    );
    // Section headers invert to surface.bg (the lighter step) so they stay
    // readable against the now-darker panel.background.
    assert.equal(
      theme.colors["panelSectionHeader.background"],
      f.surface.bg,
      `${flavor}: panelSectionHeader.background should be surface.bg (${f.surface.bg})`,
    );
    assert.notEqual(
      theme.colors["panelSectionHeader.background"],
      theme.colors["panel.background"],
      `${flavor}: panelSectionHeader.background must not match panel.background`,
    );
    // panel.border/panelSection.border (border.subtle) are expected to stay
    // distinct from panel.background on every flavor except Dawn, where
    // border.subtle == bg_sunk is a pre-existing foundation-token coincidence
    // (tab.border already collides with tab.inactiveBackground the same way
    // on Dawn, unrelated to this file) — not something a different border
    // token choice here can fix without trading it for a worse collision
    // elsewhere (see the PR discussion for the full token comparison).
    for (const key of ["panel.border", "panelSection.border"]) {
      if (flavor === "dawn") {
        assert.equal(
          theme.colors[key],
          theme.colors["panel.background"],
          `dawn: ${key} is expected to collide with panel.background (known, pre-existing border.subtle == bg_sunk coincidence)`,
        );
      } else {
        assert.notEqual(
          theme.colors[key],
          theme.colors["panel.background"],
          `${flavor}: ${key} must not match panel.background`,
        );
      }
    }
  }
});

// Pins the exact exception set documented in CLAUDE.md's surface.bg_terminal
// note: terminal.background must clear 4.5:1 (WCAG AA) against every
// ansi.* color per flavor except the conventional reverse-video anchor
// slot(s), and those documented exceptions must genuinely fail AA (proving
// they're real near-invisible slots, not just labels). If a future
// design-system bump changes ansi.* or bg_terminal, this fails loudly
// instead of requiring a manual re-check.
test("terminal.background AA-contrast exception set matches CLAUDE.md — all 4 flavors", () => {
  const documentedExceptions = {
    midnight: ["black"],
    twilight: ["black"],
    dawn: ["white", "bright_white"],
    noon: ["bright_white"],
  };
  for (const [flavor, exceptions] of Object.entries(documentedExceptions)) {
    const theme = buildTheme(flavor, "purple", tokens);
    const bg = theme.colors["terminal.background"];
    for (const [name, color] of Object.entries(tokens.flavors[flavor].ansi)) {
      const ratio = contrast(bg, color);
      if (exceptions.includes(name)) {
        assert.ok(
          ratio < 4.5,
          `${flavor}: ansi.${name} (${color}) is documented as a near-invisible exception but clears AA (${ratio.toFixed(2)}:1) against terminal.background (${bg}) — CLAUDE.md's exception list is now wrong`,
        );
      } else {
        assert.ok(
          ratio >= 4.5,
          `${flavor}: ansi.${name} (${color}) fails AA (${ratio.toFixed(2)}:1) against terminal.background (${bg}) but isn't in CLAUDE.md's documented exception list`,
        );
      }
    }
  }
});
