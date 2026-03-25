# Rules

Markdown files that provide [contextual conventions](^Loaded into context only when relevant, based on file patterns you define) Claude loads automatically. Each rule is a `.md` file in `.claude/rules/`. When you work on files matching a rule's [glob pattern](^Standard file matching syntax: * matches files, ** matches directories, {a,b} matches alternatives), Claude loads that rule into context alongside your CLAUDE.md.

## Quick Start

1. Create a file: `.claude/rules/api-patterns.md`
2. Optionally add [frontmatter](^A YAML block at the top of the file between --- markers. Contains metadata like description and globs) with `globs` to scope it to specific files
3. Write your conventions in the body
4. Commit to version control so your team shares the same rules

No registration or configuration needed. Claude discovers rule files automatically at startup.

## How Rules Work

Rules use a simple matching model:

1. **Discovery**: At startup, Claude scans `.claude/rules/` and reads each file's frontmatter
2. **Matching**: When you work on a file, Claude checks which rules have matching `globs` patterns
3. **Loading**: Matched rules are pulled into context alongside CLAUDE.md. Rules with no `globs` are always loaded

## Frontmatter

Rules optionally use YAML frontmatter to control when they activate:

```yaml
---
description: Backend API conventions for controllers and error handling
globs:
  - "src/backend/**/*.cs"
  - "src/api/**/*.ts"
---
```

| Field | Required | Purpose |
|---|---|---|
| `description` | No | Human-readable summary of what the rule covers |
| `globs` | No | File patterns that trigger this rule. Omit to always load |

If you omit frontmatter entirely, the rule is always loaded into context.

## Where Rules Live

| Location | Scope |
|---|---|
| `.claude/rules/` | This project (check into version control) |
| `~/.claude/rules/` | All your projects |

Project rules take precedence when both exist.

## Rules vs CLAUDE.md vs Skills

| | CLAUDE.md | Rules | Skills |
|---|---|---|---|
| When loaded | Every session, always | When working on matching files | When relevant to the current task |
| Purpose | Project-wide context | File-scoped conventions | Reusable instructions and actions |
| Invocable | No | No | Yes (with `/skill-name`) |
| Supporting files | No | No | Yes (scripts/, references/, assets/) |
| Frontmatter | No | Optional (globs, description) | Required (name, description) |

Use **CLAUDE.md** for project-wide context that always applies. Use **rules** for conventions that only matter when working on specific file types. Use **skills** for actions Claude performs on demand.

## Common Patterns

**Language-specific style guides**: one rule per language with globs targeting that file type. Backend conventions load only when editing backend code.

**Testing conventions**: testing patterns that activate only when working in test directories. Keeps test-specific rules out of context during normal development.

**API patterns**: endpoint conventions, error handling, and response format rules scoped to controller files.

**Infrastructure rules**: Docker, CI/CD, and deployment conventions scoped to infrastructure files. Prevents infrastructure noise when editing application code.

**Database patterns**: ORM conventions, migration rules, and query patterns scoped to data access files.

## Tips

- Keep rules focused. One concern per file, not one giant file with everything
- Use descriptive filenames: `backend-api.md`, `testing.md`, `frontend-react.md`
- Rules with no `globs` are always loaded, so use them sparingly to avoid context bloat
- Rules are passive context. If you need Claude to run scripts or follow multi-step workflows, use a [skill](^Skills are reusable instruction packages with optional scripts, references, and invocation via /skill-name) instead
- Rules complement CLAUDE.md. Put universal conventions in CLAUDE.md, file-specific conventions in rules
- Agents can reference rules via the `skills` frontmatter field to inject conventions into their context at startup

## Explore the Scaffolding

Open `my-rule.md` below to see an annotated example rule with frontmatter and convention content.
