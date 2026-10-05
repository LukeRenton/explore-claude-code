# Plugins

Plugins package skills, agents, hooks, and MCP servers into shareable extensions. A plugin is a directory with a `.claude-plugin/plugin.json` manifest and one or more components at the root level.

## Quick Start

1. Create a directory for your plugin: `mkdir my-plugin`
2. Add a manifest: `my-plugin/.claude-plugin/plugin.json`
3. Add components (skills, agents, hooks, MCP servers) at the plugin root
4. Test locally: `claude --plugin-dir ./my-plugin`

## When to Use Plugins

| Approach | Skill names | Best for |
|---|---|---|
| **Standalone** (`.claude/` directory) | `/hello` | Personal workflows, project-specific customisations, quick experiments |
| **Plugins** (`.claude-plugin/plugin.json`) | `/plugin-name:hello` | Sharing with teammates, community distribution, versioned releases |

Start with standalone configuration for quick iteration, then convert to a plugin when you're ready to share.

## Plugin Structure

```
my-plugin/
  .claude-plugin/
    plugin.json          # Manifest (required)
  skills/                # Agent Skills with SKILL.md files
  commands/              # Skills as Markdown files
  agents/                # Custom agent definitions
  hooks/                 # Event handlers in hooks.json
  .mcp.json              # MCP server configurations
  .lsp.json              # LSP server configurations
  settings.json          # Default settings when plugin is enabled
```

Only `plugin.json` goes inside `.claude-plugin/`. All other directories live at the plugin root.

### Mods

A plugin can also carry [mods](^JavaScript or TypeScript hooks that run inside your session and can draw custom UI. See the mods section): `hooks/hooks.json` lists JavaScript modules instead of shell commands. See `.claude/mods/` for the full structure.

## Plugin Manifest

The `plugin.json` file defines your plugin's identity:

```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| Field | Purpose |
|---|---|
| `name` | Unique identifier and skill namespace. Skills are prefixed with this (e.g. `/my-plugin:hello`) |
| `description` | Shown in the plugin manager when browsing or installing |
| `version` | Track releases using [semantic versioning](^Major.minor.patch format like 1.2.3. Major = breaking changes, minor = new features, patch = bug fixes) |
| `author` | Optional. Helpful for attribution |

Additional optional fields: `homepage`, `repository`, `license`, `keywords`.

## Namespacing

Plugin skills are always namespaced to prevent conflicts. A skill called `review` in a plugin called `code-tools` becomes `/code-tools:review`. To change the namespace prefix, update the `name` field in `plugin.json`.

## Adding Components

### Skills

Add a `skills/` directory with skill folders containing `SKILL.md` files. Each skill needs frontmatter with `name` and `description`:

```yaml
---
name: code-review
description: Reviews code for best practices and potential issues
---

When reviewing code, check for:
1. Code organisation and structure
2. Error handling
3. Security concerns
```

### LSP Servers

Add an `.lsp.json` file to give Claude real-time code intelligence for languages not already covered by official plugins:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": { ".go": "go" }
  }
}
```

### Default Settings

Include a `settings.json` to apply configuration when the plugin is enabled. Currently supports the `agent` key to activate a custom agent as the main thread:

```json
{
  "agent": "security-reviewer"
}
```

## Testing Locally

Use the `--plugin-dir` flag during development:

```bash
claude --plugin-dir ./my-plugin
```

Load multiple plugins at once:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

Test each component: run skills with `/plugin-name:skill-name`, check agents with `/agents`, verify hooks trigger correctly.

## Converting from Standalone

If you already have skills or hooks in `.claude/`, convert them to a plugin:

1. Create the plugin directory with `.claude-plugin/plugin.json`
2. Copy your existing `commands/`, `agents/`, `skills/` directories
3. Move hooks from `settings.json` into `hooks/hooks.json`
4. Test with `--plugin-dir`

| Standalone (`.claude/`) | Plugin |
|---|---|
| Only available in one project | Shareable via marketplaces |
| Files in `.claude/commands/` | Files in `plugin-name/commands/` |
| Hooks in `settings.json` | Hooks in `hooks/hooks.json` |
| Must manually copy to share | Install with `/plugin install` |

## Sharing Plugins

When your plugin is ready:

1. Add a `README.md` with installation and usage instructions
2. Version your plugin with semantic versioning
3. Distribute through a [marketplace](^A catalogue that lists plugins and where to fetch them. See MARKETPLACES.md) or share the repository directly
4. Submit to the official Anthropic marketplace via [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)

## Tips

- Use `claude plugin validate .` or `/plugin validate .` to check your plugin for issues
- Use `${CLAUDE_PLUGIN_ROOT}` in hook commands and MCP configs to reference files within the plugin's install directory
- Plugins are copied to a cache when installed. Files outside the plugin directory won't be available - use symlinks if needed
- Restart Claude Code after making changes to pick up updates
- Keep skills under 500 lines. Move detailed material to `references/` or `assets/` subdirectories

## Further reading
- [Plugins docs](https://code.claude.com/docs/en/plugins) 
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)