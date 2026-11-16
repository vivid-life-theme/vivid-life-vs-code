# vivid-life-vs-code

VS Code color-theme port of the [Vivid Life design system](https://github.com/vivid-life-theme/vivid-life-design-system). Node.js + ESM. Reads tokens from `@vivid-life-theme/design-system`; emits 24 themes (4 flavors × 6 variants) to `themes/`.

## Key Config Files

| File                                                         | Purpose                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `build.mjs`                                                  | Reads foundation tokens, emits 24 theme JSONs to `themes/`              |
| `.claudeignore`                                              | Paths Claude Code should skip when indexing (`node_modules/`, `*.vsix`) |
| `.claude/settings.json`                                      | Permissions, PostToolUse Prettier hook, env defaults                    |
| `.claude/skills/release/SKILL.md`                            | `/release` skill: version bump → CHANGELOG → tag → push                 |
| `.claude/skills/vivid-life-theme/SKILL.md`                   | Port-side skill: how to read foundation tokens for theme generation     |
| `.githooks/pre-commit`                                       | Runs sync-config-table.sh on every commit                               |
| `.github/workflows/claude-code-review.yml`                   | Auto-reviews PRs with Claude on open/synchronize                        |
| `.github/workflows/claude.yml`                               | Responds to `@claude` mentions in issues, PRs, and review comments      |
| `.github/workflows/publish-to-visual-studio-marketplace.yml` | Publishes to VS Code Marketplace on `v*` tag push                       |
| `.gitignore`                                                 | Git ignore patterns                                                     |
| `package.json`                                               | VS Code extension manifest + 24 `contributes.themes` entries            |
| `.prettierignore`                                            | Paths Prettier must skip — generated `themes/`, fonts, assets           |
| `scripts/sync-config-table.sh`                               | Keeps this table in sync with the filesystem (called by pre-commit)     |
| `.vscodeignore`                                              | Paths `vsce package` should not bundle into the `.vsix`                 |

## Commands

- `npm install` — fetch deps (foundation tokens, vsce, prettier)
- `npm run build` — read tokens, emit 24 theme JSONs to `themes/`
- `npm run format` — run Prettier on the project
- `npm run package` — produce a `.vsix` (runs `build` first via `prepackage`)
- F5 in VS Code — launch Extension Development Host to preview themes live

## Structure

- `build.mjs` — top-level build script
- `src/theme-template.mjs` — pure `(flavor, variant, tokens) → theme JSON`
- `themes/` — **generated**, committed (so `git clone` + install works without rebuild)
- `package.json` — manifest with 24 `contributes.themes` entries (hand-maintained to match `themes/`)
- `icon.png` — copied from the foundation's `assets/icon-256.png`

## Conventions

- **Read tokens from the foundation.** Never hardcode hex values in `src/theme-template.mjs` — they belong in `tokens.json5` upstream.
- **Foundation gaps go upstream.** If a value is missing or a contrast pair fails AA, file an issue on `vivid-life-theme/vivid-life-design-system` rather than patching port-side.
- **Hand-maintained `contributes.themes` stays in sync with `themes/`.** Add/rename in both places; CI doesn't enforce yet.
- **Determinism matters.** `build.mjs` cleans `themes/*.json` before writing so renames don't leave orphans. Keep it deterministic — same tokens in, byte-identical files out.
- **Accent / accent-on follow the foundation's rules.** Dark flavors → light accent → dark text (`gray-900`); light flavors → dark accent → light text (`gray-100`). Don't bypass the `accent_shade` table.
- **Workbench colors in accent regions require all-24 contrast verification.** Dawn/Noon accents are dark (700–900 range) — dark workbench items will blend with them. Use `bg_sunk` (achromatic extreme) for items that must stand out from any accent. Cross-check values against `tokens.json`, not mockup screenshots.
- **Content surfaces vs. the frame (design-system 0.14.0+).** Panes the user edits/reads content in (editor, active tab, terminal, peek view, notebook) use `surface.bg`. The chrome that frames them (title bar, activity bar, tab strip and inactive tabs, sidebar, status bar, **and the panel container**) uses `flavors.<flavor>.frame.<variant>.bg`, the variant-coloured frame. Mapping a framing pane to `surface.bg` — matching the content it's supposed to visually separate from — is the recurring bug this system is prone to; check for it in every new port. On the frame, text is `fg` / `fg_muted` only (never `fg_subtle`), and accent-hued text (`list.highlightForeground` and friends) is `frame.<variant>.accent_text`, not the accent. The "Frame chrome and the text on it…" test checks this for all 24 themes.
- **No port-side alpha table.** Every translucent colour is a foundation overlay recipe (`flavors.<flavor>.overlay.<variant>.<role>.hexa`, or `.flat` for the solid `button_hover` / `warning_hover`). The design-system README's "Port-side washes and gate classes" table maps each VS Code key to its role. Behind code, use a code overlay (`highlight`, `line_highlight`), never `hover`. A test fails on any translucent value that isn't a recipe.
- **Terminal-emulator backgrounds use `surface.bg_terminal`, not `surface.bg`/`bg_sunk`/`bg_soft`/`bg_overlay`.** It's the surface every `ansi.*` colour is gated against at 4.5:1, except the one or two slots every real terminal scheme leaves near-invisible by convention (`ansi.black` on dark flavors; `ansi.bright_white`, and on `dawn` also `ansi.white`, on light flavors — not a defect). A test (`terminal.background AA-contrast exception set...` in `theme-template.test.mjs`) pins this exact set per flavor. Since design-system 0.14.0 `bg_terminal` equals `bg` on every flavor, so `terminal.background` == `editor.background`. That's deliberate: the panel's tab row, drawn in `panel.background` (the frame), is what separates them. Keep reading `bg_terminal` — the name is the contract and the value may diverge again. If a foundation bump touches `ansi.*` or `bg_terminal`, re-verify contrast against every `ansi.*` value per flavor.

## Don't

- Don't draw the brand mark by hand — copy `node_modules/@vivid-life-theme/design-system/assets/icon-*.png` or `logo.svg`.
- Don't introduce a serif face (Atkinson Hyperlegible has none).
- Don't use cyan as a 7th variant (reserved for ANSI cyan / diff hunk headers).
- Don't commit `*.vsix` — they're build output. `.gitignore` already covers it.

<!-- headroom:learn:start -->

## Headroom Learned Patterns

_Auto-generated by `headroom learn` on 2026-06-26 — do not edit manually_

### Git Workflow

_~150 tokens/session saved_

- After rebasing any branch that touches `src/theme-template.mjs`, run `npm run build` before pushing — the compiled files in `themes/` must be regenerated from source or the push will include stale output.

<!-- headroom:learn:end -->
