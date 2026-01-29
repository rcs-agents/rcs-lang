# Release Process

## Overview

We use [changesets](https://github.com/changesets/changesets) for versioning and `bun publish` for publishing. This ensures:

1. **All packages stay in sync** - The `fixed` config in `.changeset/config.json` ensures all `@rcs-lang/*` packages are released together with the same version
2. **No `workspace:*` in published packages** - `bun publish` automatically converts `workspace:*` to actual version numbers

## Quick Reference

```bash
# During development - add a changeset after making changes
bun changeset:add

# Check what will be released
bun changeset:status

# Release (build, test, version, publish, push)
bun run release
```

## Daily Workflow

### 1. Make Changes

Work on your features/fixes as normal.

### 2. Add a Changeset

```bash
bun changeset:add
```

Select packages, choose version bump (patch/minor/major), write a summary.

### 3. Commit Everything

```bash
git add .
git commit -m "feat: your feature"
git push
```

## Release Workflow

When ready to release:

```bash
bun run release
```

This runs:
1. `release:prepare` - Pre-checks, build, test, version bump, lockfile update
2. `release:commit` - Commit version changes
3. `release:publish` - Publish each package with `bun publish`
4. `release:push` - Push commits and tags

### Step-by-Step (for more control)

```bash
bun run release:prepare    # Build, test, bump versions
git diff                   # Review changes
bun run release:commit     # Commit
bun run release:publish    # Publish to npm
bun run release:push       # Push to git
```

## How It Works

### Version Sync

All packages in `.changeset/config.json`'s `fixed` array release together:
- If you bump `parser` as minor and `compiler` as patch, **all packages** get a minor bump
- This keeps the entire suite at the same version

### workspace:* Conversion

During development, packages use `workspace:*`:
```json
{ "dependencies": { "@rcs-lang/core": "workspace:*" } }
```

When `bun publish` runs, it automatically converts to real versions:
```json
{ "dependencies": { "@rcs-lang/core": "^0.6.0" } }
```

The source files remain unchanged (still `workspace:*`).

## Version Bump Types

- **Patch** (0.0.X): Bug fixes, docs
- **Minor** (0.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Troubleshooting

### "No changesets found"
```bash
bun changeset:add
```

### Verify workspace deps are correct
```bash
bun run check:workspace
```

### Preview what will be released
```bash
bun changeset:status --verbose
```

## CI/CD

```yaml
- name: Release
  run: |
    bun install
    bun run release
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
