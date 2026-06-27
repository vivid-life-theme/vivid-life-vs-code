# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
