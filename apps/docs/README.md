# RCL Documentation Site

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This is the documentation site for RCL (Rich Communication Language), built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   ├── docs/
│   └── content.config.ts
├── astro.config.mjs
├── markdoc.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md`, `.mdx` or `.mdoc` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 📚 Documentation Structure

The documentation is organized as follows:

- **Getting Started** - Introduction, installation, and examples
- **Language Reference** - Formal specification and API documentation
- **Package Documentation** - Detailed documentation for each package
- **Development** - Guides for contributors and maintainers

## 🚀 Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow is defined in `.github/workflows/deploy-docs.yml`.

## 📝 Adding Documentation

To add new documentation:

1. Create a new `.mdoc` file in `src/content/docs/`
2. Update the sidebar configuration in `astro.config.mjs` if needed
3. Use Markdoc syntax for advanced formatting features

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
