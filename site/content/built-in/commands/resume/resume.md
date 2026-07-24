# /resume

Switches to a different saved conversation from inside your current session. Sessions are saved continuously as you work, so you can always return to one after exiting or running `/clear`.

## Usage

```
/resume            Open the session picker
/resume <name>     Resume a named session directly
```

Its alias is `/continue`. From the command line, the equivalents are:

| Command | What it does |
|---|---|
| `claude --continue` | Resume the most recent session in this directory |
| `claude --resume` | Open the session picker |
| `claude --resume <name>` | Resume a named session |
| `claude --from-pr <number>` | Filter the picker to sessions linked to a PR |

## The Session Picker

`/resume` with no argument opens an interactive picker. Each row shows the session name (or an auto-generated title), time since last activity, git branch, and size.

| Key | Action |
|---|---|
| `↑` `↓` | Move between sessions |
| `Space` | Preview the session |
| `Ctrl+R` | Rename the highlighted session |
| `Ctrl+B` | Filter to the current git branch |
| `Ctrl+W` | Widen to all worktrees of the repo |
| `Ctrl+A` | Widen to every project on this machine |
| `/` | Search, or paste a PR URL to find its session |

## What a Resumed Session Restores

The full conversation history, the model, any [agent](^A session started as a specific subagent keeps its system prompt and tools. See the agents section), and the permission mode all come back. Two exceptions: `plan` and `bypassPermissions` are never restored, and `auto` returns only if your account still qualifies for it.

## Naming Sessions

Name sessions so they are easy to find and resume:

- At startup: `claude -n auth-refactor`
- Mid-session: `/rename auth-refactor`
- Accepting a plan auto-names the session from the plan content

Auto-generated titles are not resume handles. Only names you set with `--name` or `/rename` can be resumed by name.

## Related Commands

- `/branch` copies the conversation and switches into the copy, leaving the original intact
- `/clear` starts fresh but saves the previous conversation, which you can resume with `/resume`
- `/export` writes the current conversation to a file. Transcripts live at `~/.claude/projects/<project>/<session-id>.jsonl`

## Tips

- Name anything you might return to. It is the difference between resumable and merely findable
- `Ctrl+A` in the picker is the fastest way to reach a session from another project
- Paste a PR URL into the picker search to jump straight to the session that created it

## Further Reading

- [Official docs: Manage sessions](https://code.claude.com/docs/en/sessions)
