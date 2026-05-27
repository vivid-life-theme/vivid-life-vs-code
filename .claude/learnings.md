# Learnings

Corrections and observations collected during configuration sessions.
Entries are tagged by skill and dated.

---

[cc-config:cc-config-init] User chose project-level Prettier hook over inheriting from `~/.claude/settings.json` so formatting is reproducible on other clones — 2026-05-26
[cc-config:cc-config-init] Workspace CLAUDE.md at `~/Git-Repositorys/CLAUDE.md` already provides learnings + compact instructions, so this project's CLAUDE.md stays lean and project-specific — 2026-05-26
[cc-config:cc-config-init] sync-config-table.sh bug: `find -name '*.json'` matches hidden files like `.prettierrc.json`, causing duplicates with the explicit dotfile loop — add `sort -u` to dedupe, not just `sort` — 2026-05-26
[cc-config:cc-config-init] sync-config-table.sh bug: greedy `(.+)` in the table-row regex captures trailing whitespace from column-aligned tables, producing unbounded whitespace growth — strip trailing whitespace from captured descriptions — 2026-05-26
[cc-config:cc-config-init] sync-config-table.sh: when Prettier formats CLAUDE.md (column-aligned tables), the script needs to normalize its tmpfile through Prettier before diffing — otherwise the diff always shows changes and reformats on every commit — 2026-05-26
[cc-config:cc-config-init] Foundation gap discovered while building this port (vivid-life-design-system #1): `semantic.{danger,warning,success}` shade 700 fails WCAG AA against light-flavor `bg_sunk` (#bdbdbd/#d4d4d4). Filed upstream — don't paper over port-side — 2026-05-26
[brainstorming] Workbench color choices that sit inside accent-colored regions must be contrast-verified against ALL 24 flavor×variant combinations, not just the mockup flavor (Midnight+Purple). Semantic green for the status bar remote item failed all 12 Dawn/Noon combinations — Dawn/Noon accents are dark (700–900 range) and any dark-green bg blends with them. Magic numbers from mockups (like #166534) may not be palette tokens — always cross-check against tokens.json. Use bg_sunk (achromatic extreme) for workbench items that must stand out from any accent — 2026-05-27
