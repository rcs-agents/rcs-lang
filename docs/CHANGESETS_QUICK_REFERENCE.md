# Changesets Quick Reference

## Commands

```bash
bun changeset:add      # Add a changeset after making changes
bun changeset:status   # Check what will be released
bun run release        # Full release (build, test, version, publish, push)
bun run check:workspace # Verify all deps use workspace:*
```

## Workflow

```bash
# 1. Make changes
# 2. Add changeset
bun changeset:add

# 3. Commit with your code
git add . && git commit -m "feat: ..." && git push

# 4. When ready to release
bun run release
```

## Version Bumps

- **Patch** (0.0.X): Bug fixes
- **Minor** (0.X.0): New features
- **Major** (X.0.0): Breaking changes

All packages release together with the highest bump selected.

## More Info

See [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
