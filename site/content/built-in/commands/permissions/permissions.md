# /permissions

Views and manages Claude Code's tool permissions. It lists every permission rule and shows which `settings.json` file each rule comes from.

## Usage

```
/permissions
```

Opens the permissions interface, where you can see what Claude is allowed and denied and add or change rules.

## The Three Rule Types

Permissions are expressed as rules in your settings files:

| Rule | Effect |
|---|---|
| `allow` | Pre-approve a tool or command so it never prompts |
| `ask` | Force a prompt, even when a broader mode would not |
| `deny` | Block outright, in every mode |

Rules are evaluated in order: **deny, then ask, then allow.** The first match wins, and specificity does not change the order. A broad `deny` like `Bash(aws *)` blocks even a call that also matches a narrower `allow`, so a deny rule cannot carry allowlist exceptions.

## Rule Syntax

| Pattern | Matches |
|---|---|
| `Bash(npm run build)` | The exact command |
| `Bash(npm run *)` | Any command starting with `npm run ` |
| `Read(./.env)` | Reading the `.env` file |
| `Edit(src/**)` | Editing anything under `src/` |
| `WebFetch(domain:example.com)` | Fetches to that domain |
| `Agent(isolation:worktree)` | Deny or ask rules can match a tool's input parameter |

## Enforced by Claude Code, Not the Model

Permission rules are a hard boundary. Instructions in your prompt or CLAUDE.md shape what Claude tries to do, but they cannot change what Claude Code allows. To grant or revoke access, use `/permissions`, a [permission mode](^The baseline that decides which actions prompt. See the Modes section), or a PreToolUse hook.

## Recently Denied

When an action is blocked, it appears in the **Recently denied** tab in `/permissions`, where you can retry it with a manual approval.

## Tips

- Reach for a `deny` rule when you need a guarantee. It beats any mode, since a mode cannot loosen it
- Pre-approve your safe, frequent commands, like `Bash(npm test)`, with `allow` rules to cut prompts
- Rules live in settings files, so you can commit a team-wide set or keep personal ones local

## Further Reading

- [Official docs: Configure permissions](https://code.claude.com/docs/en/permissions)
