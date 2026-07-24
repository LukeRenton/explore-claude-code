# Flags

The flags you will actually reach for, grouped by what they do. They work in both interactive and [headless](^Print mode: claude -p. See the Headless entry) runs. For the exhaustive list, see the official reference at the bottom.

## Session

| Flag | What it does |
|---|---|
| `-c`, `--continue` | Resume the most recent conversation in this directory |
| `-r`, `--resume <id>` | Resume a specific session by ID or name, or open the picker |
| `-n`, `--name <name>` | Name the session so you can find and resume it later |
| `--fork-session` | Resume into a new session ID, leaving the original intact |
| `--from-pr <number>` | Filter the resume picker to sessions linked to a pull request |

## Model and Effort

| Flag | What it does |
|---|---|
| `--model <alias>` | Set the model: `sonnet`, `opus`, `haiku`, `fable`, or a full name |
| `--effort <level>` | Set [reasoning effort](^How hard the model thinks: low, medium, high, xhigh, max. See Context and Thinking) |
| `--fallback-model <m>` | Fall back to another model when the first is overloaded |

## Permissions and Access

| Flag | What it does |
|---|---|
| `--permission-mode <mode>` | Start in a [mode](^default, acceptEdits, plan, auto, dontAsk, bypassPermissions. See the Modes section) like `plan` or `acceptEdits` |
| `--allowedTools <list>` | Pre-approve tools so they run without prompting, like `"Bash(git diff *),Read"` |
| `--add-dir <paths>` | Give Claude access to directories outside the current one |
| `--dangerously-skip-permissions` | Skip all permission prompts. Isolated environments only |

## Context and Behaviour

| Flag | What it does |
|---|---|
| `--append-system-prompt <text>` | Add to the default system prompt, keeping Claude Code's behaviour |
| `--system-prompt <text>` | Replace the system prompt entirely |
| `--settings <file-or-json>` | Load settings from a file or inline JSON |
| `--mcp-config <file>` | Load [MCP servers](^External tool connections. See the MCP section) for this run |
| `--agents <json>` | Define [subagents](^Custom agents with their own prompt and tools. See the agents section) inline |

## Output and Diagnostics

| Flag | What it does |
|---|---|
| `-p`, `--print` | Run [headless](^Print the result and exit, with no interactive UI. See the Headless entry) and exit |
| `--output-format <fmt>` | `text`, `json`, or `stream-json`, in headless runs |
| `--verbose` | Full turn-by-turn output |
| `--debug [filter]` | Diagnostic logs, optionally filtered like `"api,mcp"` |
| `-v`, `--version` | Print the version |

## Tips

- Aliases keep it short: `-c` for `--continue`, `-r` for `--resume`, `-p` for `--print`
- `--model` and `--effort` can also be changed mid-session with `/model` and `/effort`
- Reach for `--append-system-prompt` over `--system-prompt`. It adds instructions without discarding Claude Code's built-in behaviour

## Further Reading

- [Official docs: CLI reference](https://code.claude.com/docs/en/cli-reference)
