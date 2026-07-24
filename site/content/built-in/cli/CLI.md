# CLI & Headless

Claude Code is a command-line tool first. How you launch `claude` decides what kind of session you get: an interactive terminal session, or a one-shot [headless run](^Runs your prompt, prints the result, and exits with no interactive UI. Also called print mode) that prints a result and exits, for scripts and CI.

## Two Ways to Run

| Command | What you get |
|---|---|
| `claude` | An interactive session |
| `claude "explain this project"` | Interactive, with an opening prompt |
| `claude -p "explain this function"` | Headless: prints the answer and exits |
| `cat log.txt \| claude -p "explain"` | Headless, reading piped input |

The [`-p`](^Short for --print. Runs non-interactively and exits. See the Headless entry) flag is the switch between the two. Every other flag works with either.

## Subcommands

Beyond starting a session, `claude` has subcommands for housekeeping:

| Command | What it does |
|---|---|
| `claude update` | Update to the latest version |
| `claude doctor` | Print installation and settings diagnostics |
| `claude mcp` | Configure [MCP servers](^Model Context Protocol servers that connect Claude to external tools. See the MCP section) |
| `claude auth login` | Sign in to your Anthropic account |
| `claude agents` | Open the [agent view](^A dashboard for background sessions running detached from your terminal) for background sessions |
| `claude setup-token` | Generate a long-lived token for CI |

## Explore

Open the entries below:

- **Flags** covers the options that matter: choosing a model, setting a permission mode, adding directories, and shaping the system prompt
- **Headless Mode** covers `claude -p` for scripts and CI: structured output, piping, and bare mode

## Further Reading

- [Official docs: CLI reference](https://code.claude.com/docs/en/cli-reference)
