# VS Code Theme Audit — Design Spec

**Date:** 2026-05-27  
**Scope:** Full audit of Vivid Life VS Code theme against Dracula as parity target. Applies to `src/theme-template.mjs` in the VS Code port repo. Changes feed all 24 generated themes (4 flavors × 6 variants).

---

## Architectural constraint

Two categories of change with different rules:

- **Syntax token changes** (`tokenColors`, `semanticTokenColors`) — reference `syntax.*` values that are fixed per flavor. Appear on `vl-bg`, never on an accent-colored surface. Fully variant-independent; no cross-variant checking needed.
- **Workbench color changes** (`colors`) — some entries are accent-driven. Any workbench color that must stand out from an accent-colored surface must use a value that remains distinguishable across all 6 possible accent shades. Verify variant-independence before proposing values.

All changes in this spec except the status bar remote item are syntax token changes.

---

## 1 — Markdown inline formatting

**Bold** (`markup.bold`)

- `foreground`: `syntax.type` (yellow)
- `fontStyle`: `bold`

**Italic** (`markup.italic`)

- `foreground`: `syntax.string` (green)
- `fontStyle`: `italic`

**Bold + italic overlap** (`markup.bold.markdown markup.italic.markdown`, `markup.italic.markdown markup.bold.markdown`)

- `foreground`: `syntax.type` (yellow)
- `fontStyle`: `bold italic`

**Link text** (`string.other.link.description.markdown`, `string.other.link.title.markdown`)

- `foreground`: `syntax.function` (blue)

**Link URL** (`markup.underline.link`, `constant.other.reference.link.markdown`)

- `foreground`: `syntax.string` (green)

**Rationale:** Dracula-level information density for markdown. Bold and italic each carry a distinct hue; link text and URL are visually separable at a glance.

---

## 2 — Markdown structural elements

**Blockquotes** (`markup.quote`)

- `foreground`: `syntax.type` (yellow)
- `fontStyle`: `italic`

**List punctuation** (`beginning.punctuation.definition.list.markdown`)

- `foreground`: `syntax.tag` (blue)

**Horizontal rule** (`meta.separator.markdown`)

- `foreground`: `syntax.comment` (gray)

**Heading punctuation** (`punctuation.definition.heading.markdown` — the `#` sigils)

- `foreground`: `syntax.comment` (gray)

**Rationale:** Structural chrome recedes (gray); block markers use the existing structural hue (blue); blockquotes get yellow+italic to signal "quoted voice."

---

## 3 — Variable semantics

**Language pseudo-variables** (`variable.language` — `this`, `self`, `super`, `$this`)

- `foreground`: `syntax.keyword` (purple)
- `fontStyle`: `italic`

**Function parameters** (`variable.parameter`)

- `foreground`: `syntax.number` (orange)
- `fontStyle`: `italic`

**Import / export destructuring** (`meta.import variable.other.readwrite`, `meta.export variable.other.readwrite`)

- `foreground`: `syntax.number` (orange)
- `fontStyle`: `italic`

**Rationale:** `this`/`self`/`super` are compiler built-ins, not user symbols — purple+italic separates them from regular function calls. Parameters and binding-site names are orange (value-like, not declarations), italic marks their binding context.

---

## 4 — JSDoc / documentation comments

**JSDoc tags** (`comment.block.documentation keyword`, `storage.type.class.jsdoc`)  
`@param`, `@returns`, `@type`, `@deprecated`, etc.

- `foreground`: `syntax.keyword` (purple)

**Type references inside JSDoc** (`comment.block.documentation entity.name.type`)  
`{string}`, `{MyClass}`, `{Array<T>}` etc.

- `foreground`: `syntax.function` (blue)
- `fontStyle`: `italic`

**Parameter names inside JSDoc** (`comment.block.documentation variable`)  
The `paramName` in `@param {string} paramName`.

- `foreground`: `syntax.number` (orange)
- `fontStyle`: `italic`

**Rationale:** Doc-comment prose stays gray; structured sub-elements surface their semantic role. Consistent with the variable semantics section: tags=keywords, type refs=blue, param names=orange.

---

## 5 — Language-specific

**Escape sequences** (`constant.character.escape`)

- `foreground`: `syntax.keyword` (purple)
- Previously: `syntax.constant` (orange)

**Shell variables** (`source.shell variable.other`, `variable.other.normal.shell`)

- `foreground`: `syntax.keyword` (purple)
- Previously: uncolored

**YAML aliases** (`variable.other.alias.yaml`)

- `foreground`: `syntax.string` (green)
- `fontStyle`: `italic underline`

**Python docstrings** (`string.quoted.docstring.multi`)

- `foreground`: `syntax.comment` (gray)
- `fontStyle`: `italic`
- Previously: `syntax.string` (green)

**Rationale:** Escape sequences are compiler-interpreted syntax, not values — purple fits. Shell variables are special forms, not user symbols — purple. YAML aliases are value references — green+italic+underline (the only underlined token; immediately distinctive). Python docstrings are documentation, not data — gray+italic matches their prose nature.

---

## 6 — Structural and semantic cleanup

**Class and type name italic reset** (`entity.name.class`, `entity.name.type`, `entity.name.class.forward-decl`)

- `fontStyle`: `""` (explicit reset)

**HTML/JSX attribute names** (`entity.other.attribute-name`)

- `foreground`: `syntax.attr` (yellow) — unchanged
- `fontStyle`: `italic` — added

**Invalid code** (`invalid`)

- `foreground`: `syntax.regex` (red)
- `fontStyle`: `italic underline`

**Deprecated code** (`invalid.deprecated`)

- `foreground`: `syntax.regex` (red)
- `fontStyle`: `italic`

**Rationale:** Class names are declarations — italic reset makes behavior deterministic across grammar versions. Attribute names are modifiers — italic signals "qualifies the element." Invalid/deprecated code uses the existing error hue (red); underline on hard-invalid mirrors VS Code's squiggle convention.

---

## 7 — Semantic token consistency

Semantic tokens (LSP-level, override TextMate in modern editors) must stay consistent with the TextMate rules above.

**`parameter` semantic token**

- `foreground`: `syntax.number` (orange)
- `fontStyle`: `italic`
- Must match `variable.parameter` TextMate rule.

**`variable.defaultLibrary` semantic token**

- `foreground`: `syntax.keyword` (purple)
- `fontStyle`: `italic`
- Must match `variable.language` TextMate rule.

**`class` / `type` semantic token**

- `fontStyle`: `""` (explicit reset)
- Must match `entity.name.class` TextMate rule.

---

## 8 — Workbench: status bar remote item

**Architectural note:** This is a workbench color change. The status bar background is `accent` (variant-dependent). The remote item must use a fixed semantic value that remains visually distinct across all 6 possible accent shades.

**`statusBarItem.remoteBackground`**

- Value: `semantic.success_bg` (deep green — `#166534` on all flavors)
- Previously: `accent` (indistinguishable from the bar)

**`statusBarItem.remoteForeground`**

- Value: `semantic.success` (lime — `#bef264` on all flavors)
- Previously: `statusBar.foreground` (same as bar text)

**Variant-independence verification:** The deep green background (`#166534`) is sufficiently dark and desaturated relative to all 6 accent shades (red, orange, yellow, green, blue, purple) at their respective flavor-assigned brightness levels to remain visually distinct in all 24 theme combinations.

---

## Out of scope

- Regex internal differentiation (capture groups, character classes, assertions) — deferred to Approach C if needed by a specific port.
- New flavor or variant additions — unrelated to this audit.
- Workbench colors beyond the status bar remote item — no other gaps identified.
