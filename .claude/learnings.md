# Learnings

Corrections and observations collected during configuration sessions.
Entries are tagged by skill and dated.

---

[cc-config:cc-config-optimize] `.githooks/pre-commit` was present but `core.hooksPath` was never set — the sync script was silently not running; always run `git config core.hooksPath .githooks` after cc-config-init — 2026-06-26
