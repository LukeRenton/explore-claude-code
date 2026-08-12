# Contributing

Thanks for helping make Explore Claude Code better. The most valuable
contributions are **new or improved content entries** as Claude Code ships
features, but explorer bug fixes and UX improvements are very welcome too.

New here? Check the [issues labeled `good first issue`](https://github.com/LukeRenton/explore-claude-code/labels/good%20first%20issue).
Each one names the file to touch and what "done" looks like.

## How the project works

There is no build step. The site is static HTML, CSS, and vanilla JS in `site/`.

- **`site/data/manifest.json`** is the single source of truth. It defines the
  sidebar tree, feature groupings, and badges, and points each file node at its
  content.
- **`site/content/**`** holds the actual markdown that renders in the main panel.

To add or change content, you edit the manifest (structure) and a content file
(the words). You rarely need to touch the JS.

## Run it locally

Point any static server at the `site/` directory:

```bash
npx serve site
# or
python -m http.server -d site 8080
```

Opening `site/index.html` directly in a browser works too.

## Add or improve a content entry

1. **Find its home in the tree.** Open `site/data/manifest.json` and locate the
   directory node where the entry belongs (for example under `built-in/`).
2. **Add a file node** to that directory's `children`:
   ```json
   {
     "name": "my-thing.md",
     "path": "built-in/my-thing/my-thing.md",
     "type": "file",
     "feature": "my-feature",
     "badge": "builtin",
     "label": "My Thing",
     "description": "One line shown under the title.",
     "contentFile": "built-in/my-thing/my-thing.md"
   }
   ```
   `feature`, `badge`, `label`, and `description` are optional. `label` wins over
   the feature title for the page heading.
3. **Write the content** at `site/content/<contentFile>`. Start with a single
   `# Title`, then normal markdown. Two custom bits are supported:
   - Inline tooltips: `[term](^explanation shown on hover)`
   - Everything else is standard markdown (tables, lists, fenced code, links).
4. **Preview** it in the browser (serve `site/` and click your new entry).

## Conventions

These are enforced by CI (`node scripts/validate-content.js`), so check them
before you push:

- **No em-dashes or en-dashes** in content (`—` `–`). Use commas, colons, or
  periods. This keeps the writing voice consistent.
- **LF line endings.** `.gitattributes` enforces this automatically, so you
  usually do not have to think about it.
- **Escape pipes inside table cells** as `\|`, otherwise they break the table.
- Write content as if it were a real config file in a real repo, self-describing
  and copy-pasteable. Concise up top, depth below.

### Adding a new badge

A badge `id` needs three things in sync or it renders unstyled:

1. an entry in `manifest.badges`,
2. a `--badge-<id>` token in `css/variables.css`, defined in **both** the base
   `:root` (dark) block and the `:root[data-theme="light"]` block,
3. a `.tree-badge--<id>` rule in `css/components.css`.

The validator checks 2 and 3 for you.

## Validate before you push

```bash
node scripts/validate-content.js
```

It checks that the manifest parses, every `contentFile` resolves, badges and
features referenced by nodes exist, badges have their token and class, and
content has no em-dashes. CI runs the same command on your pull request.

## Pull requests

- Keep PRs focused: one feature entry, or one fix, per PR is ideal.
- Fill in the PR checklist.
- Make sure the CI check is green.

Not sure about something? Open an issue and ask. Thanks again.
