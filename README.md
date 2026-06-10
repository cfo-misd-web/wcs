# webdev-components-system

A [shadcn registry](https://ui.shadcn.com/docs/registry/github) hosted directly from this GitHub repository. Any project using the shadcn CLI can install components, hooks, configs, and other files from here — no registry server or build step required.

## Installing items

From any shadcn-initialized project:

```bash
npx shadcn@latest add cfo-misd-web/webdev-components-system/hello-world
```

Install from a specific branch, tag, or commit by appending a ref:

```bash
npx shadcn@latest add cfo-misd-web/webdev-components-system/hello-world#main
npx shadcn@latest add cfo-misd-web/webdev-components-system/hello-world#v1.0.0
```

If no ref is given, the CLI uses the default branch (`main`).

## Browsing the registry

```bash
# List all available items
npx shadcn@latest list cfo-misd-web/webdev-components-system

# Search items
npx shadcn@latest search cfo-misd-web/webdev-components-system --query hello

# View an item's details before installing
npx shadcn@latest view cfo-misd-web/webdev-components-system/hello-world

# Preview an install without writing files
npx shadcn@latest add cfo-misd-web/webdev-components-system/hello-world --dry-run
```

## Repository structure

```text
.
├── registry.json        # Registry manifest — declares all installable items
└── registry/
    └── ui/              # Component source files
        └── hello-world.tsx
```

## Adding a new item

1. Add the source file(s) under `registry/` (components in `registry/ui/`, hooks in `registry/hooks/`, utilities in `registry/lib/`, etc.).
2. Declare the item in [`registry.json`](registry.json):

   ```json
   {
     "name": "my-component",
     "type": "registry:component",
     "title": "My Component",
     "description": "What it does.",
     "registryDependencies": ["button"],
     "dependencies": ["some-npm-package"],
     "files": [
       {
         "path": "registry/ui/my-component.tsx",
         "type": "registry:component",
         "target": "~/components/ui/my-component.tsx"
       }
     ]
   }
   ```

   - `path` — where the file lives in this repo.
   - `target` — where it lands in the consumer's project (`~` = project root).
   - `registryDependencies` — other registry items it needs (shadcn built-ins like `button`, or items from this registry as `cfo-misd-web/webdev-components-system/<name>`).
   - `dependencies` — npm packages to install alongside it.

3. Validate before pushing:

   ```bash
   npx shadcn@latest registry validate cfo-misd-web/webdev-components-system
   ```

4. Commit and push — items are served straight from GitHub, so pushing to `main` publishes them.

## Notes

- The repository must remain **public** — private repos are not supported by GitHub-address registries.
- Registry items aren't limited to React components: configs, styles, docs, agent rules, and scripts can all be distributed the same way using `"type": "registry:file"` with an explicit `target`.
