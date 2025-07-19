# Branch Protection Rules

This document outlines the recommended branch protection rules for the RCL repository.

## Branches

### `main` (Default Branch)
The main development branch where all features and fixes are merged.

**Protection Rules:**
- ✅ **Require pull request reviews before merging**
  - Required approving reviews: 1
  - Dismiss stale pull request approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - Required status checks: `test` (from CI workflow)
  - Require branches to be up to date before merging
- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, enforces rebasing)
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**

### `release`
The release branch that triggers automatic releases when pushed to.

**Protection Rules:**
- ✅ **Restrict who can push to matching branches**
  - Only maintainers/admins can push
  - Alternatively, specific users/teams responsible for releases
- ✅ **Require status checks to pass before merging**
  - Required status checks: `test` (from CI workflow)
- ❌ **Do not require pull request reviews** (direct pushes allowed for release process)
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**

## GitHub Settings

To configure these rules:

1. Go to **Settings** → **Branches** in your GitHub repository
2. Click **Add rule** for each branch

### For `main` branch:
```
Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals (1)
  ✅ Dismiss stale pull request approvals when new commits are pushed
  
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Status checks: test
  
✅ Require conversation resolution before merging
✅ Require linear history
✅ Include administrators
✅ Restrict who can push to matching branches (optional)
```

### For `release` branch:
```
Branch name pattern: release

✅ Restrict who can push to matching branches
  - Add maintainers team or specific users
  
✅ Require status checks to pass before merging
  Status checks: test
  
❌ Do NOT require pull request reviews
✅ Include administrators
```

## Workflow Summary

1. **Development**: All work happens on feature branches
2. **Review**: PRs to `main` require review and passing tests
3. **Release**: Authorized users push to `release` branch to trigger releases
4. **Tags**: Automatically synced back to `main` after successful release

## Security Considerations

- Limit who can push to `release` branch to prevent accidental releases
- Use GitHub Teams to manage permissions at scale
- Consider requiring 2FA for all contributors
- Audit push access to `release` branch regularly

## Bypass Rules

Administrators can bypass protection rules if needed for:
- Emergency hotfixes
- Fixing broken CI/CD
- Repository maintenance

Use bypass sparingly and document why it was necessary.