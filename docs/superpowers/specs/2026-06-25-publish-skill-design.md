# Publish Skill Design

VS Code Marketplace publishing for vivid-life-vs-code via a Claude Code skill
and a tag-triggered GitHub Actions workflow.

## Context

- Publisher ID: `vivid-life-theme` (already in `package.json`)
- Publisher display name on the Marketplace: "Vivid Life Theme"
- Current version: `0.1.0`
- No CHANGELOG.md exists yet
- No publish automation exists yet

## One-Time Manual Prerequisite

Before the first publish, the publisher must be registered:

1. Go to <https://marketplace.visualstudio.com/manage> and create a publisher
   - Publisher ID: `vivid-life-theme`
   - Display name: `Vivid Life Theme`
2. Generate a Personal Access Token in Azure DevOps
   - Organization: All accessible organizations
   - Scope: Marketplace → Manage
3. Add the PAT as a GitHub Actions secret named `VSCE_PAT` in the
   `vivid-life-theme/vivid-life-vs-code` repository

This is a one-time step. After it is done, every future release goes through
the skill + CI path and the PAT never touches the local machine again.

## Deliverables

Three files are created as part of this implementation.

### 1. CHANGELOG.md (repo root)

Keep a Changelog format. Maintained between releases by adding entries under
`[Unreleased]`. The skill moves the unreleased section to a versioned entry on
release day.

Initial content covers the 0.1.0 release:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2026-06-25

### Added

- 24 themes: 4 flavors (Midnight · Twilight · Dawn · Noon) × 6 variants
  (Red · Orange · Yellow · Green · Blue · Purple)
- WCAG AA verified contrast across all theme/variant combinations
- Generated from the Vivid Life design-system foundation — single source of
  truth for all colors and syntax tokens
```

### 2. `.github/workflows/publish.yml`

Triggers on any tag matching `v*`. Checks out the repo, installs dependencies,
and runs `vsce publish` using the `VSCE_PAT` secret. The `prepackage` script
(which runs `npm run build`) fires automatically before publish, so the theme
JSONs are always freshly generated from the foundation.

```yaml
on:
  push:
    tags: ["v*"]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm install -g npm@latest
      - run: npx vsce publish
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

### 3. `.claude/skills/publish/SKILL.md`

Invoked via `/publish`. Runs these steps in order, stopping on any failure:

1. **Pre-flight** — assert on `main` branch, working tree clean, `npm run build`
   succeeds
2. **CHANGELOG check** — read `CHANGELOG.md`; if `[Unreleased]` section is
   empty, stop and prompt the user to document changes before continuing
3. **Version confirmation** — display current version from `package.json` and
   the `[Unreleased]` contents; ask user to confirm the new version number
4. **Bump** — update `"version"` in `package.json`
5. **CHANGELOG update** — rename `[Unreleased]` heading to `[X.Y.Z] - YYYY-MM-DD`;
   insert a new empty `[Unreleased]` section above it
6. **Commit** — stage `package.json` and `CHANGELOG.md`; commit with message
   `🔖 chore(release): bump to vX.Y.Z`
7. **Tag** — create annotated tag `vX.Y.Z` with message `"Version X.Y.Z"`
8. **Push** — `git push && git push --tags`; this fires the GitHub Actions
   publish workflow
9. **Confirm** — print the Actions URL for the user to monitor the publish run

The skill never calls `vsce publish` locally. Every publish goes through CI,
keeping the PAT out of the local environment and every release auditable.

## Release Flow (post-setup)

```
/publish
  └─ Claude runs skill
       └─ git push --tags
            └─ GitHub Actions: vsce publish → Marketplace
```
