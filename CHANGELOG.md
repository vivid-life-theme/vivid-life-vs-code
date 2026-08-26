# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- `terminal.background`/`terminalCursor.background` no longer match `editor.background` — they now use `surface.bg_terminal` (design-system 0.6.0+), the first surface tier verified against all 16 `ansi.*` colors per flavor. Previously left equal to `editor.background` as a deliberate workaround pending a foundation-level fix (see `vivid-life-design-system` issue #5); the terminal pane is now visually distinct on all 4 flavors.

### Changed

- design-system dependency bumped to 0.6.0; all 24 themes regenerated

## [0.2.3] - 2026-07-09

### Fixed

- `statusBarItem.remoteBackground`/`remoteForeground` restored using `ansi.cyan` (fixed per-flavor, outside `variant_hues`) instead of the neutral `bg_sunk`/`text.fg` pairing from 0.2.2 — the remote indicator is highlighted again without colliding with `errorBackground`/`warningBackground` on the Red/Yellow/Orange variants, the issue that caused the 0.2.2 revert

## [0.2.2] - 2026-07-09

### Fixed

- `statusBarItem.remoteBackground`/`remoteForeground` reverted to a neutral `bg_sunk`/`text.fg` pairing — the accent color introduced in 0.2.1 to "highlight" the remote indicator instead made it collide visually with other accent-colored status bar badges (`activityBarBadge`, `badge`, `extensionBadge`)
- `terminalCommandDecoration.defaultBackground`/`successBackground`/`errorBackground` now use theme-aware colors instead of falling back to VS Code's hardcoded blue/red defaults, so the terminal shell-integration gutter dots match the flavor's palette

## [0.2.1] - 2026-07-07

### Fixed

- `statusBarItem.remoteBackground`/`remoteForeground` now use the flavor's accent color instead of the neutral status bar background, so the remote-connection indicator is highlighted like it is in other VS Code themes

## [0.2.0] - 2026-06-28

### Changed

- Theme token rules are now data-driven: scope assignments, extended syntax tokens, and semantic token maps are generated directly from the design-system's `scope_recommendations`, `syntax_tokens.extended`, and `semantic_token_recommendations` — replacing ~500 lines of hand-written mappings and ensuring automatic alignment with the foundation going forward
- design-system dependency bumped to 0.4.0; all 24 themes regenerated with updated tokens including the new `syntax.parameter` slot

## [0.1.1] - 2026-06-26

### Added

- New syntax token scopes across all 24 themes: `doc_keyword`, `doc_type`, `doc_param` (JSDoc/TSDoc comment highlights), `invalid` (semantic danger + italic underline), and `invalid_deprecated`
- Dedicated `parameter` color slot per flavor (previously shared with italic text foreground)
- `lang_var` scope for `this`/`self`/`super` — constant color + italic, split from builtin
- JS/TS `variable.other.constant` override for accurate constant highlighting

### Changed

- `property` now uses a foreground fallback (was `syntax.tag`)
- `decorator` now uses `syntax.function` (was `syntax.type`)
- Markdown bold uses `syntax.number`; italic uses `syntax.type`
- Semantic token mirrors updated for `parameter`, `property`, and `decorator`
- Find match background now uses `semantic.warning` so the active match is distinguishable from accent-tinted selection
- Word highlight backgrounds now use the palette cyan hue at two alphas — the previous white overlays made symbol occurrences nearly invisible
- Bracket highlight foreground 1 is now neutral `text.fg`; variant accent hues shift to levels 2–6 to reduce rainbow-bracket noise
- Activity bar active border softened to accent at 90% alpha

### Fixed

- WCAG AA compliance restored on 18 themes (design-system 0.2.1 bump)
- Remote-indicator chip is now visible against the accent status bar
- Debug status bar color is now picked per variant to avoid collision with the accent color

## [0.1.0] - 2026-06-25

### Added

- 24 themes: 4 flavors (Midnight · Twilight · Dawn · Noon) × 6 variants (Red · Orange · Yellow · Green · Blue · Purple)
- WCAG AA verified contrast across all theme/variant combinations
- Generated from the Vivid Life design-system foundation — single source of truth for all colors and syntax tokens
