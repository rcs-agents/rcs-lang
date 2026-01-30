# Storybook Configuration

This package contains three separate Storybook instances for different rendering frameworks.

## Quick Start

```bash
# Start React Storybook (port 6006)
bun run storybook:react

# Start Lit (Web Components) Storybook (port 6007)
bun run storybook:lit

# Start Solid.js Storybook (port 6008)
bun run storybook:solid
```

## Overview

This package contains three separate Storybook instances:

## React Storybook

Located in `src/react/.storybook/`

**Start dev server:**
```bash
bun run storybook:react
```
Runs on http://localhost:6006

**Build static:**
```bash
bun run build-storybook:react
```
Output: `storybook-static/react/`

## Lit (Web Components) Storybook

Located in `src/lit/.storybook/`

**Start dev server:**
```bash
bun run storybook:lit
```
Runs on http://localhost:6007

**Build static:**
```bash
bun run build-storybook:lit
```
Output: `storybook-static/lit/`

## Solid.js Storybook

Located in `src/solid/.storybook/`

**Start dev server:**
```bash
bun run storybook:solid
```
Runs on http://localhost:6008

**Build static:**
```bash
bun run build-storybook:solid
```
Output: `storybook-static/solid/`

## Configuration Notes

All Storybook configurations use Vite and include a `viteFinal` hook to resolve workspace dependencies (`@rcs-lang/csm` and `@rcs-lang/types`) to their source files. This is necessary because Vite in Storybook doesn't automatically resolve `workspace:*` dependencies.

The alias configuration points to:
- `@rcs-lang/csm` → `../../../csm/src`
- `@rcs-lang/types` → `../../../types/src`

**Note:** The Solid.js Storybook uses `@storybook/react-vite` framework but adds the `vite-plugin-solid` plugin via `viteFinal` to handle Solid JSX transformation. This is a workaround since there's no official Solid Storybook framework yet.

All instances include the following addons:
- `@chromatic-com/storybook` - Visual testing
- `@storybook/addon-a11y` - Accessibility testing
- `@storybook/addon-docs` - Documentation generation
