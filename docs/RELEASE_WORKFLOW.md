# Release Workflow - Step by Step

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEVELOPMENT PHASE                                        │
└─────────────────────────────────────────────────────────────┘
  │
  ├─> Make code changes
  ├─> bun changeset:add       # Create changeset
  ├─> git add .
  ├─> git commit -m "feat: ..."
  └─> git push
      │
      │
┌─────┴───────────────────────────────────────────────────────┐
│ 2. RELEASE PHASE (run: bun run release)                     │
└─────────────────────────────────────────────────────────────┘
      │
      ├─> release:prepare
      │   ├─> check:pre-release    # Warn about dirty files
      │   ├─> check:workspace      # Verify workspace:*
      │   ├─> build                # Build all packages
      │   ├─> test                 # Run all tests
      │   └─> changeset version    # Update package.json versions
      │       └─> Creates: packages/*/package.json (new versions)
      │       └─> Creates: CHANGELOG.md files
      │       └─> Deletes: .changeset/*.md (consumed changesets)
      │
      ├─> release:commit
      │   └─> git commit -m "chore: version packages"
      │       └─> Commits the version changes
      │
      ├─> release:publish
      │   └─> changeset publish
      │       ├─> Converts workspace:* → ^X.Y.Z
      │       ├─> Publishes to npm
      │       ├─> Creates git tags (@rcs-lang/parser@0.5.0)
      │       └─> Reverts ^X.Y.Z → workspace:*
      │
      └─> release:push
          └─> git push --follow-tags
              └─> Pushes commit + tags to remote
```

## What You Need to Do

### Before Release

```bash
# 1. Make sure all your changesets are committed
git status
# Should show: nothing to commit (or only non-package changes)

# 2. Check what will be released
bun changeset:status
```

### During Release

```bash
# Just run one command
bun run release
```

**That's it!** The script handles everything:
- ✅ Building
- ✅ Testing
- ✅ Versioning
- ✅ Committing
- ✅ Publishing
- ✅ Tagging
- ✅ Pushing

## What Gets Committed When

### Commit 1: Your Feature (You do this)
```bash
git commit -m "feat: add new parser feature"
```
**Contains:**
- Your code changes
- `.changeset/funny-cats-jump.md` (the changeset)

### Commit 2: Version Bump (Script does this)
```bash
git commit -m "chore: version packages"
```
**Contains:**
- `packages/*/package.json` (updated versions)
- `CHANGELOG.md` files (generated changelogs)
- `.changeset/` (consumed changesets deleted)

## What Tags Are Created

For each package, `changeset publish` creates a git tag:

```
@rcs-lang/parser@0.5.0
@rcs-lang/compiler@0.5.0
@rcs-lang/ast@0.5.0
... (one tag per package)
```

These tags are automatically pushed by `git push --follow-tags`.

## Important Notes

### ✅ DO commit before running release
Your changesets must be committed first. If you forget:
```bash
git status
# Shows: .changeset/some-changeset.md (untracked)

# Fix:
git add .changeset
git commit -m "chore: add changeset"
git push

# Then release:
bun run release
```

### ✅ DO NOT manually edit package versions
Never edit `"version": "0.4.0"` in package.json manually. Always use changesets.

### ✅ Your dirty files are safe
The release only commits version-related files. Your WIP stays uncommitted.

## Troubleshooting

### "No changesets present"
```bash
# You forgot to create a changeset
bun changeset:add
git add .changeset
git commit -m "chore: add changeset"
```

### "Nothing to commit" but changeset exists
```bash
# Your changeset isn't committed
git status
git add .changeset
git commit -m "chore: add changeset"
```

### Want to review before publishing?
```bash
# Step by step approach
bun run release:prepare    # Stops after versioning
git diff HEAD               # Review the version changes
bun run release:commit     # Commit if satisfied
bun run release:publish    # Publish to npm
bun run release:push       # Push to git
```

## What If Something Goes Wrong?

### Before `release:publish` runs
```bash
# Just reset the commit
git reset HEAD~1
# Your changesets are back, try again
```

### After `release:publish` runs
- Packages are published to npm (can't undo easily)
- You have 72 hours to unpublish if needed: `npm unpublish @rcs-lang/package@version`
- Git tags are created locally but not pushed yet
- If you haven't run `release:push`, you can still clean up

### After `release:push` runs
- Everything is live (npm + git)
- To fix: create a new changeset and release a patch version
