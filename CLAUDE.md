# vivid-life-vs-code

VS Code color-theme port of the [Vivid Life design system](https://github.com/vivid-life-theme/vivid-life-design-system).
Node.js + ESM. Reads tokens from `@vivid-life-theme/design-system`; emits 24 themes
(4 flavors × 6 variants) to `themes/`.

## Key Config Files

| File                                       | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `.claude/learnings.md`                     | Accumulated corrections and observations; promoted during optimize runs |
| `.claude/settings.json`                    | Permissions, PostToolUse Prettier hook, env defaults                    |
| `.claude/skills/publish/SKILL.md`          | `/publish` skill: version bump → CHANGELOG → tag → push                 |
| `.claude/skills/vivid-life-theme/SKILL.md` | Port-side skill: how to read foundation tokens for theme generation     |
| `.claudeignore`                            | Paths Claude Code should skip when indexing (`node_modules/`, `*.vsix`) |
| `.githooks/pre-commit`                     | Runs sync-config-table.sh on every commit                               |
| `.github/workflows/claude-code-review.yml` | TODO: add description                                                   |
| `.github/workflows/claude.yml`             | TODO: add description                                                   |
| `.github/workflows/publish.yml`            | Publishes to VS Code Marketplace on `v*` tag push                       |
| `.gitignore`                               | Git ignore patterns                                                     |
| `.prettierignore`                          | Paths Prettier must skip — generated `themes/`, fonts, assets           |
| `.vscodeignore`                            | Paths `vsce package` should not bundle into the `.vsix`                 |
| `build.mjs`                                | Reads foundation tokens, emits 24 theme JSONs to `themes/`              |
| `package.json`                             | VS Code extension manifest + 24 `contributes.themes` entries            |
| `scripts/sync-config-table.sh`             | Keeps this table in sync with the filesystem (called by pre-commit)     |

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

## Don't

- Don't draw the brand mark by hand — copy `node_modules/@vivid-life-theme/design-system/assets/icon-*.png` or `logo.svg`.
- Don't introduce a serif face (Atkinson Hyperlegible has none).
- Don't use cyan as a 7th variant (reserved for ANSI cyan / diff hunk headers).
- Don't commit `*.vsix` — they're build output. `.gitignore` already covers it.
