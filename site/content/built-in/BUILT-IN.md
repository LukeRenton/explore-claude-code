# Built-in Features

Everything above the line is the **`.claude/` ecosystem**: configuration files, skills, agents, hooks, and plugins that you create and customise for your projects. That is the stuff you build.

This section is different. These are features that **ship with Claude Code** and require no setup. They exist whether or not you have a `.claude/` directory. You do not configure them, you do not create files for them, and you do not commit them to version control. They are just there, ready to use.

## What You'll Find Here

### Modes

How much Claude does on its own before checking with you. Cycle them with `Shift+Tab`.

- **Manual** - review every action before it runs
- **Accept Edits** - let Claude edit files, review afterwards
- **Plan** - research and propose before touching code
- **Auto** - run freely with a background safety classifier

### Auto Memory

Notes Claude writes to itself across sessions, build commands, debugging insights, and preferences it discovers. The counterpart to the CLAUDE.md files you write. Managed with `/memory`.

### Context & Thinking

What fills Claude's context window, how to inspect it with `/context`, and how to reclaim space with `/compact`. Plus effort levels and `ultrathink` for controlling how deeply Claude reasons.

### Bundled Skills

Prompt-based workflows available in every Claude Code session. Unlike the custom skills you create in `.claude/skills/`, these are maintained by Anthropic and work out of the box.

- `/simplify` - Review and clean up your recent changes
- `/batch` - Orchestrate large-scale parallel changes
- `/debug` - Troubleshoot your current session
- `/loop` - Run prompts on a recurring interval
- `/claude-api` - Load API and SDK reference for your language

### Built-in Commands

Slash commands baked into Claude Code that run fixed logic directly. Session management, configuration, diagnostics, integrations, and more. Over 50 commands organised by category.

- `/compact` - Compress conversation to reclaim context
- `/btw` - Ask a side question without cluttering history
- `/diff` - Interactive viewer for uncommitted changes
- `/init` - Generate a starter CLAUDE.md from your codebase
- `/rewind` - Restore conversation and code to a previous point

### More Coming Soon

This section will grow to cover other built-in capabilities like CLI flags and keyboard shortcuts.

## Explore

Open the folders below to see detailed breakdowns of each category.
