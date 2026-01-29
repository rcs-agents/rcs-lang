# Release Process with Changesets

This document explains how to use changesets for releasing packages in the RCL monorepo.

## Overview

We use [changesets](https://github.com/changesets/changesets) to manage versioning and publishing. Changesets automatically:
- Converts `workspace:*` to actual version numbers during publish
- Handles version bumping across the monorepo
- Generates changelogs
- Ensures all interdependent packages are published together

## Daily Development Workflow

### 1. Make Changes

Work on your features/fixes as normal.

### 2. Add a Changeset

After making changes that should be released, add a changeset:

```bash
bun changeset:add
# or
bun changeset add
```

This will prompt you to:
1. Select which packages changed
2. Choose the version bump type (major/minor/patch)
3. Write a summary of the changes

The changeset file will be created in `.changeset/` directory.

### 3. Commit the Changeset

```bash
git add .changeset
git commit -m "feat: add new feature"
```

**Important**: Commit the changeset file with your changes!

## Release Workflow

**Important: Commit your changesets before running release!**

### Option 1: Full Release (Recommended)

Run the complete release process:

```bash
bun run release
```

This will:
1. ✅ Run pre-release checks
2. ✅ Build all packages
3. ✅ Run tests
4. ✅ Update versions based on changesets
5. ✅ **Commit version changes** with message "chore: version packages"
6. ✅ Publish to npm
7. ✅ Create git tags (one per package)
8. ✅ Push commit and tags to remote

### Option 2: Step-by-Step Release

For more control, run steps individually:

```bash
# 1. Prepare release (build, test, version bump)
bun run release:prepare

# 2. Review the version changes
git diff HEAD

# 3. Commit version changes
bun run release:commit

# 4. Publish to npm (also creates git tags)
bun run release:publish

# 5. Push commit and tags to remote
bun run release:push
```

See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for a detailed diagram.

## Common Commands

```bash
# Add a new changeset
bun changeset:add

# Check what will be released
bun changeset:status

# Update package versions (without publishing)
bun version

# View all changesets
ls .changeset
```

## Understanding Changesets

### Fixed Versioning (Important!)

All `@rcs-lang/*` packages are configured to **always release together with the same version**. This is configured in `.changeset/config.json` using the `fixed` option.

**What this means:**
- When you create a changeset, you can select specific packages that changed
- You specify version bumps per package (patch/minor/major)
- All packages in the monorepo will be released with the **highest** version bump
- If one package gets a minor bump, all get a minor bump
- This keeps the entire suite at the same version (simpler for users)

**Example:**
```bash
# You create a changeset:
# - @rcs-lang/parser: minor (new feature)
# - @rcs-lang/compiler: patch (bug fix)
#
# Result: ALL packages bump to minor (0.4.0 → 0.5.0)
```

If you want independent versioning, remove the `fixed` array from `.changeset/config.json`.

### Changeset Files

Each changeset is a markdown file in `.changeset/` that looks like:

```markdown
---
"@rcs-lang/parser": minor
"@rcs-lang/compiler": patch
---

Add support for new syntax feature
```

### Version Bump Types

- **Major** (`1.0.0 → 2.0.0`): Breaking changes
- **Minor** (`1.0.0 → 1.1.0`): New features, backward compatible
- **Patch** (`1.0.0 → 1.0.1`): Bug fixes

### Workspace Dependencies

During development, all internal dependencies use `workspace:*`:

```json
{
  "dependencies": {
    "@rcs-lang/core": "workspace:*"
  }
}
```

When you run `changeset publish`, it automatically converts these to actual versions:

```json
{
  "dependencies": {
    "@rcs-lang/core": "^1.2.3"
  }
}
```

After publishing, it converts them back to `workspace:*`.

## CI/CD Integration

You can automate releases with GitHub Actions:

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run build
      - run: bun run test

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: bun run release:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting

### "No changesets found"

You need to add changesets before releasing:
```bash
bun changeset:add
```

### "workspace:* detected in published package"

This shouldn't happen anymore! Changesets handles this automatically. If you see this, the publish step didn't run correctly.

### Publishing specific packages only

```bash
# Check status to see what will be published
bun changeset:status

# If you want to skip certain packages, add them to .changeset/config.json:
{
  "ignore": ["@rcs-lang/internal-package"]
}
```

## Migration from Old Scripts

The old custom scripts (`scripts/publish.js`, `scripts/version.js`, `scripts/prepare-release.js`) have been archived to `scripts/archive/`.

Old workflow → New workflow:
- `bun run release:patch` → `bun changeset:add` (select patch) + `bun run release`
- `bun run release:minor` → `bun changeset:add` (select minor) + `bun run release`
- `bun run release:major` → `bun changeset:add` (select major) + `bun run release`
- `bun run publish:packages` → `bun run release:publish`
