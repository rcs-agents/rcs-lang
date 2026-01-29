# Release FAQ

## Can I release with a dirty working directory?

**Yes!** The release workflow only stages specific files related to versioning:

```bash
# Only these get staged:
git add .changeset packages/*/package.json package.json CHANGELOG.md
```

Your uncommitted changes in `apps/docs/`, test files, or anywhere else **won't be affected**.

### What happens during release?

1. **Pre-release check** runs and shows:
   - ✅ Current branch (warns if not on main)
   - ⚠️  Uncommitted changes in `packages/` (warning only)
   - ℹ️  Other uncommitted changes (informational)

2. **Release proceeds** even with dirty state

3. **Only version-related files** are staged and will be committed by changesets

### Example

```bash
# You have uncommitted docs work
$ git status
modified: apps/docs/src/pages/new-feature.md
modified: apps/docs/src/styles.css

# Release still works fine
$ bun run release

🔍 Pre-release safety checks...
✅ On main branch
✅ No uncommitted changes in packages/

ℹ️  Other uncommitted changes (will not affect release):
   M apps/docs/src/pages/new-feature.md
   M apps/docs/src/styles.css

# Release proceeds, your docs changes are untouched
```

### Should I be worried?

**No worries if:**
- ✅ Dirty files are in `apps/`, `libs/`, or test files
- ✅ You haven't modified source code in `packages/`

**Be careful if:**
- ⚠️  You have uncommitted changes in `packages/` source code
- ⚠️  Those changes should be part of the release

The pre-release check will warn you about uncommitted changes in `packages/` so you don't accidentally release code without the corresponding changes.

## What if I have uncommitted changes in packages/?

You have two options:

### Option 1: Commit them first (recommended)

```bash
git add packages/parser/src/new-feature.ts
git commit -m "feat: add new parser feature"
bun changeset:add  # Create changeset for this change
bun run release
```

### Option 2: Release without them

The release will proceed, but your uncommitted changes **won't be published**. The published package will have the last committed state.

## What files does `changeset version` modify?

When you run `changeset version` (part of `release:prepare`), it:

1. Updates all `packages/*/package.json` with new versions
2. Updates root `package.json` version
3. Generates/updates `CHANGELOG.md` files
4. Deletes consumed changeset files from `.changeset/`

All these changes are automatically staged by the release script.

## Can I review changes before they're committed?

Yes! Use the step-by-step approach:

```bash
# Step 1: Prepare (versions packages, stages files)
bun run release:prepare

# Step 2: Review what's staged
git diff --cached

# Step 3: Publish if satisfied
bun run release:publish

# Step 4: Push tags
bun run release:tag
```

Or just inspect after `changeset version`:

```bash
bun version  # Just version, don't stage
git diff     # See what changed
git add .changeset packages/*/package.json package.json CHANGELOG.md
```

## What if I want to require a clean working directory?

If you prefer a stricter workflow, you can modify `scripts/pre-release-check.js` to fail (exit 1) instead of warn when there are uncommitted changes.

Or add this check to your CI/CD pipeline instead of doing it locally.

## Does changesets commit anything automatically?

By default, **no**. The config has `"commit": false`.

Our workflow:
1. `changeset version` - Modifies files but doesn't commit
2. `git add <specific files>` - Stages only version-related files
3. You commit manually, or your CI commits

If you want automatic commits, set `"commit": true` in `.changeset/config.json` and changesets will commit version changes automatically.
