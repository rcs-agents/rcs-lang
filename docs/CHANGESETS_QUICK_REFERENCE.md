# Changesets Quick Reference

## 🔒 Fixed Versioning

All `@rcs-lang/*` packages are **locked to the same version**. When you create a changeset:
- You can select which packages changed
- You specify the version bump type (patch/minor/major)
- **All packages will be released together with the highest version bump**

Example: If you bump `parser` as minor and `compiler` as patch, **all packages** will get a minor bump.

## Common Commands

```bash
# Add a changeset (do this after making changes)
bun changeset:add

# Check what will be released
bun changeset:status

# Full release (build, test, version, commit, publish, push)
bun run release

# Step-by-step release
bun run release:prepare    # Build, test, and version
bun run release:commit     # Commit version changes
bun run release:publish    # Publish to npm and create git tags
bun run release:push       # Push commits and tags to remote

# Verify workspace dependencies are correct
bun run check:workspace
```

## Typical Workflow

### 1. During Development

```bash
# Make your changes
vim packages/parser/src/index.ts

# Add a changeset
bun changeset:add
# - Select affected packages
# - Choose version bump (patch/minor/major)
# - Write a summary

# Commit everything including the changeset
git add .
git commit -m "feat: add new feature"
git push
```

### 2. Ready to Release

**Commit your changesets first!** Then:

```bash
# Option A: One command (recommended)
bun run release
```

This will:
1. ✅ Build and test
2. ✅ Update versions in package.json files
3. ✅ Commit version changes with message "chore: version packages"
4. ✅ Publish to npm
5. ✅ Create git tags (e.g., @rcs-lang/parser@0.5.0)
6. ✅ Push commit and tags to remote

```bash
# Option B: Step by step (for more control)
bun run release:prepare    # Build, test, version
bun run release:commit     # Commit version changes
bun run release:publish    # Publish + create tags
bun run release:push       # Push to remote
```

## Version Bump Types

- **Patch** (0.0.X): Bug fixes, documentation, minor changes
- **Minor** (0.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Working with Dirty Repo

**Yes, you can release with uncommitted changes!**

The release script only stages:
- `.changeset/` directory
- `packages/*/package.json` (version bumps)
- Root `package.json`
- `CHANGELOG.md`

Your dirty files in `apps/docs/` or elsewhere **won't be affected**.

The pre-release check will **warn** you about uncommitted changes in `packages/` but won't block the release.

## Tips

✅ **Do:**
- Add changesets with your feature branches
- Commit changesets with your code
- Use descriptive summaries in changesets
- Run `bun changeset:status` to preview releases

❌ **Don't:**
- Manually edit package.json versions
- Publish without changesets
- Hard-code `@rcs-lang/*` versions (use `workspace:*`)
- Skip the verification step

## Troubleshooting

### Error: "No changesets found"
```bash
bun changeset:add
```

### Error: "workspace:* detected"
```bash
bun run check:workspace
```

### See what changed since last release
```bash
bun changeset:status --verbose
```

### Skip a package from releasing
Add to `.changeset/config.json`:
```json
{
  "ignore": ["package-name"]
}
```

## More Help

- Full guide: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
- Migration info: [../MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md)
- Official docs: https://github.com/changesets/changesets
