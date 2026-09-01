# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.6] - 2026-09-01

### Changed

- design-system dependency bumped to 0.7.0; all 24 themes regenerated. Twilight and Dawn now have their own ANSI shade rungs instead of sharing them with other flavors — `twilight.bg_terminal` becomes a dedicated literal (`#333333`), and `dawn.bg_terminal` now equals `bg` (`#d4d4d4`). Midnight and Noon are unaffected.

### Fixed

- `terminal.background` no longer bit-identical to `editor.background` on Twilight, closing the remaining flavor from the terminal-panel distinction fix in 0.2.4. Dawn keeps the equality deliberately — its ANSI normal set can't go lighter than `#d2d2d2` without dropping below AA — with the terminal panel still reading as a distinct region via its border and `panel.background` chrome.

## [0.2.5] - 2026-08-27

### Added

- Chat panel color coverage (`chat.*`, `chatManagement.sashBorder`) — previously unset, so the built-in Chat view fell back to VS Code's default colors instead of the flavor's palette. Bubble/code surfaces use `surface.bg_soft` (the only tier that reads as raised whether chat renders in the sidebar/panel on `bg_sunk` or as an editor tab on `bg`); avatar and slash-command chips use `ansi.cyan` rather than accent to avoid the badge-collision issue from 0.2.1–0.2.3.

### Fixed

- `statusBarItem.prominentBackground`/`prominentForeground` (used by VS Code's Workspace Trust "Restricted Mode" badge) now use the warning colors instead of a near-invisible translucent black/white overlay, so the badge visually stands out as the soft-warning indicator it is.
- `statusBarItem.offlineBackground`/`offlineForeground` (Remote Development's disconnected indicator) were previously unset; now use the danger colors, matching VS Code's own default treatment of this token.

### Changed

- design-system dependency reinstalled at the already-pinned 0.6.0 (node_modules had drifted to a stale 0.4.0 install); all 24 themes regenerated with correct `terminal.background`/`terminalCursor.background` and `ansi.bright_black` values.

## [0.2.4] - 2026-08-26

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
