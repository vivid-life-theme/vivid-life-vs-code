# Data-Driven Token Rules — Design Spec

**Date:** 2026-06-27
**Status:** Approved

## Background

`@vivid-life-theme/design-system` 0.4.0 shipped three new top-level objects that
codify the token→scope and token→semantic mappings that were previously hardcoded
in `src/theme-template.mjs`:

| Object                           | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `scope_recommendations`          | Canonical TextMate scope arrays, keyed by token name (37 keys)                |
| `syntax_tokens.extended`         | Color + style intent for each extended token (string or `{ color, style[] }`) |
| `semantic_token_recommendations` | `{ types, modifiers }` tables for LSP semantic tokens                         |

Goal: replace the handwritten scope lists and semantic token maps with generators
that read these objects directly, so future upstream changes auto-propagate without
manual sync.

## Scope

Changes are confined to `src/theme-template.mjs` and `src/theme-template.test.mjs`.
No changes to `build.mjs`, `package.json`, or theme JSON files (the build is
deterministic; the themes re-emit on the next `npm run build`).

## Architecture

### Shared color/style resolver

A single `resolveColor` helper replaces ad-hoc token lookups everywhere:

```js
function resolveColor(key, syntax, textFg, semanticDanger) {
  if (!key || key === "fg") return textFg;
  if (key === "semantic.danger") return semanticDanger;
  return syntax[key] ?? textFg;
}
```

`syntax_tokens.extended` entries are either a plain string (color key, no style)
or `{ color, style: string[] }`. A second helper normalises them:

```js
function resolveExt(ext) {
  if (!ext || typeof ext === "string")
    return { color: ext ?? "fg", styles: [] };
  return { color: ext.color ?? "fg", styles: ext.style ?? [] };
}
```

Both helpers are pure and used by both the TextMate and semantic generators.

### Generated TextMate rules (`buildGeneratedTokenRules`)

```js
function buildGeneratedTokenRules(
  scopeRecs,
  extended,
  syntax,
  textFg,
  semanticDanger,
) {
  return Object.entries(scopeRecs).map(([key, scopes]) => {
    const { color, styles } = resolveExt(extended[key]);
    const settings = {
      foreground: resolveColor(color, syntax, textFg, semanticDanger),
    };
    if (styles.length) settings.fontStyle = styles.join(" ");
    return { name: key, scope: scopes, settings };
  });
}
```

Produces 37 rules keyed by token name. The `name` field matches the
`scope_recommendations` key (e.g., `"emphasis"`, `"lang_var"`).

### Hand-crafted residual rules

Appended after the generated list. These cover scopes not present in
`scope_recommendations`:

| Rule name                   | Scopes                                                                               | Color    | Style            |
| --------------------------- | ------------------------------------------------------------------------------------ | -------- | ---------------- |
| Template string delimiter   | `punctuation.definition.template-expression`, `punctuation.section.embedded`         | keyword  | —                |
| Escape sequence             | `constant.character.escape`                                                          | keyword  | —                |
| Shell variable              | `source.shell variable.other`, `variable.other.normal.shell`                         | keyword  | —                |
| YAML alias                  | `variable.other.alias.yaml`                                                          | string   | italic underline |
| Python docstring            | `string.quoted.docstring.multi`                                                      | comment  | italic           |
| CSS at-rule                 | `keyword.control.at-rule`, `punctuation.definition.keyword`                          | keyword  | —                |
| Markdown bold+italic        | `markup.bold.markdown markup.italic.markdown`, …                                     | type     | bold italic      |
| Markdown link text          | `string.other.link.description.markdown`, `string.other.link.title.markdown`         | function | —                |
| Markdown inline/fenced code | `markup.inline.raw`, `markup.fenced_code.block`, `markup.raw.block`                  | string   | —                |
| Markdown quote              | `markup.quote`, `punctuation.definition.quote.begin`                                 | type     | italic           |
| Markdown list bullet        | `beginning.punctuation.definition.list.markdown`, `punctuation.definition.list_item` | tag      | —                |
| Markdown horizontal rule    | `meta.separator.markdown`                                                            | comment  | —                |
| Diff inserted               | `markup.inserted`, `meta.diff.header.to-file`                                        | string   | —                |
| Diff deleted                | `markup.deleted`, `meta.diff.header.from-file`                                       | regex    | —                |
| Diff changed                | `markup.changed`                                                                     | number   | —                |
| Diff hunk header            | `meta.diff.range`, `meta.diff.header`                                                | function | —                |
| JSON key                    | `support.type.property-name.json`, …                                                 | tag      | —                |
| YAML key                    | `entity.name.tag.yaml`, …                                                            | tag      | —                |

### Generated semantic token colors (`buildSemanticTokenColors`)

**Types** — loop over `semantic_token_recommendations.types`:

- Plain string spec → `{ foreground, fontStyle: "" }` (explicit reset prevents VS Code
  default italic from leaking through).
- Object spec `{ color, style[] }` → `{ foreground, fontStyle: styles.join(" ") }`.

**Modifiers** — loop over `semantic_token_recommendations.modifiers`, skip `"none"` entries,
emit wildcard keys `"*.modifierName"`. Examples:

| Key                | Effect                        |
| ------------------ | ----------------------------- |
| `*.readonly`       | foreground: constant          |
| `*.deprecated`     | fontStyle: "italic underline" |
| `*.abstract`       | fontStyle: "italic"           |
| `*.defaultLibrary` | fontStyle: "italic"           |

This replaces the current hardcoded `"variable.readonly"` and `"variable.defaultLibrary"`
entries with a general mechanism that covers all semantic token types.

### `buildTheme` signature — unchanged

The public API `buildTheme(flavor, variant, tokens)` is unchanged. Internally it
passes `tokens.scope_recommendations`, `tokens.syntax_tokens.extended`, and
`tokens.semantic_token_recommendations` into the new generators, so no changes to
`build.mjs` are needed.

## Test updates (`src/theme-template.test.mjs`)

Three existing assertions need updating to reflect generated behaviour:

1. **`typeParameter`** — now maps to `syntax.parameter` (per recommendations), not
   `syntax.type`.
2. **`"variable.defaultLibrary"` key** — replaced by `"*.defaultLibrary"` wildcard.
3. **Type-family `fontStyle`** — assertions for `class`, `type`, `interface`, `enum`,
   `struct` remain `""` (generated with explicit reset as described above).

## What does NOT change

- `buildWorkbenchColors` — untouched; workbench colors have their own mapping logic.
- `build.mjs`, `package.json`, theme JSON files.
- The 18 hand-crafted residual rules stay named and explicit; they are NOT data-driven
  because the design-system deliberately excludes language-specific and format-specific
  scopes from `scope_recommendations`.
