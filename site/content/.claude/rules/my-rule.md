---
description: Example conventions for backend API endpoints
globs:
  - "src/backend/**/*.cs"
  - "src/api/**/*.ts"
---

# API Conventions

Extends CLAUDE.md with patterns specific to API endpoint files.

## Error Handling
- Use the project's error factory for all error responses, never raw status codes
- Client-facing messages come from constants only, never interpolated runtime values
- Log detailed errors server-side, return generic messages to clients

## Controllers
- Authenticated endpoints extend the base API controller
- Always include summary docs and response type annotations
- Accept a cancellation token as the last parameter

## Response Format
- Wrap all responses in the standard envelope: `{ data, errors, meta }`
- Use pagination metadata for list endpoints
- Include request IDs in error responses for traceability

---

This is a starter rule file. The filename `my-rule.md` is just an example. Name your rules descriptively: `backend-api.md`, `testing.md`, `frontend-react.md`.

## Anatomy of This File

The **frontmatter** (between the `---` markers at the top) is optional but recommended. It controls when this rule loads:

- `description`: explains what the rule covers. Useful for documentation and for Claude to understand the rule's purpose
- `globs`: file patterns that trigger this rule. When you edit a file matching any of these patterns, Claude loads this rule into context

If you omit the frontmatter entirely (or omit `globs`), the rule is always loaded, behaving like an extension of CLAUDE.md.

The **body** contains your actual conventions. Write them as direct instructions. Bullet lists and short headers work best because Claude scans structure the same way a developer does.

## Glob Pattern Examples

| Pattern | Matches |
|---|---|
| `"src/**/*.ts"` | All TypeScript files under src/ |
| `"*.test.{ts,js}"` | Test files at any depth |
| `"src/backend/**/*.cs"` | C# files in the backend directory |
| `"docker-compose*.yml"` | Docker Compose files in the project |
| `"**/*.sql"` | All SQL files anywhere in the project |

## What Goes in a Rule vs CLAUDE.md

Put conventions in a **rule file** when they:
- Apply only to specific file types or directories
- Would add noise for developers working on other parts of the codebase
- Are detailed enough to bloat CLAUDE.md if included inline

Keep conventions in **CLAUDE.md** when they:
- Apply universally (naming, git workflow, PR process)
- Are short enough that splitting them out adds more overhead than it saves
- Need to be visible at all times regardless of what files Claude is editing

## Rules vs Skills

Rules and [skills](^Skills are reusable instruction packages with SKILL.md, optional scripts, references, and invocation via /skill-name) both provide instructions, but they solve different problems:

| | Rules | Skills |
|---|--------|--------|
| Format | Markdown with optional globs frontmatter | SKILL.md with required name/description frontmatter |
| Purpose | Passive conventions loaded into context | Active instructions, optionally invocable |
| Activation | Automatic, based on file patterns | Automatic or via `/skill-name` |
| Supporting files | None (just the .md file) | scripts/, references/, assets/ |
| Side effects | Never | Can run commands and modify files |

Use rules for "always follow these patterns when editing these files." Use skills for "here is how to perform this specific task."

## Real-World Examples

Teams commonly create rules like:

- `backend-api.md` with globs for controller files: error handling, auth patterns, response formats
- `testing.md` with globs for test directories: test structure, mock patterns, assertion conventions
- `database.md` with globs for data access code: ORM patterns, migration rules, query conventions
- `frontend-react.md` with globs for component files: state management, styling, accessibility patterns
- `infrastructure.md` with globs for Docker/CI files: security settings, deployment checklists
