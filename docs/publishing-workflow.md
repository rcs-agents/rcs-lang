# Publishing Workflow

This document explains how to publish RCL packages to npm.

## Overview

The RCL monorepo uses Bun workspaces with the `workspace:*` protocol for internal dependencies. However, npm doesn't understand this protocol, so we need to replace these references with actual version numbers before publishing.

## Publishing Process

### 1. Set NPM Token

Bun respects the `NPM_CONFIG_TOKEN` environment variable for authentication:

```bash
export NPM_CONFIG_TOKEN=your-npm-token
```

Or add it to your `.env` file:

```
NPM_CONFIG_TOKEN=your-npm-token
```

Note: This project uses Infisical for secret management, so the token is automatically available in the environment.

### 2. Run the Publish Script

To publish all packages:

```bash
bun scripts/publish.js
```

To do a dry run (recommended first):

```bash
bun scripts/publish.js --dry-run
```

### 3. What the Script Does

1. **Authentication**: Sets up npm authentication using the NPM_CONFIG_TOKEN
2. **Prepare**: For each package:
   - Replaces `workspace:*` dependencies with actual version numbers
   - Removes the `private: true` field if present
   - Creates a backup of the original package.json
3. **Publish**: Uses `npm publish` to publish each package in dependency order
4. **Cleanup**: Restores the original package.json files from backups

### 4. Package Discovery and Order

The script automatically discovers all packages in the `packages/` directory that are not marked as `private: true`. It then sorts them by dependency order using a topological sort to ensure dependencies are published before packages that depend on them.

The script will:
1. Scan the `packages/` directory for subdirectories containing `package.json` files
2. Filter out packages with `"private": true`
3. Build a dependency graph based on `@rcs-lang/*` dependencies
4. Sort packages topologically to respect dependency order
5. Display the publish order before starting

This means new packages are automatically included without needing to update the publish script.

### 5. Version Management

Before publishing, make sure to bump versions appropriately:

```bash
# In each package directory
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

## Troubleshooting

### "Cannot publish over previously published version"

This means the version in package.json has already been published. Bump the version number and try again.

### "Skipping workspace marked as private"

This happens when a package has `"private": true` in its package.json. The publish script should remove this automatically, but if it doesn't, remove it manually.

### Authentication Issues

If you get authentication errors:

1. Make sure NPM_CONFIG_TOKEN is set correctly
2. Check that the token has publish permissions
3. Verify you're a member of the @rcs-lang organization on npm

## GitHub Actions

The publish workflow can also be triggered from GitHub Actions using the NPM_CONFIG_TOKEN secret configured in the repository settings.