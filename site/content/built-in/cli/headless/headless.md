# Headless Mode

Add `-p` (or `--print`) to any `claude` command to run it non-interactively. Claude runs your prompt, prints the result, and exits. This is how you use Claude Code in scripts, build steps, and CI.

```bash
claude -p "What does the auth module do?"
```

Every [CLI flag](^See the Flags entry) works with `-p`, including `--allowedTools`, `--continue`, and `--output-format`.

## Output Formats

`--output-format` controls what you get back:

| Format | Returns |
|---|---|
| `text` | Plain text, the default |
| `json` | Structured JSON: the result, session ID, cost, and usage metadata |
| `stream-json` | Newline-delimited JSON events, for streaming as Claude works |

With `json`, the payload includes `total_cost_usd` and a per-model cost breakdown, so a script can track spend per call:

```bash
claude -p "Summarize this project" --output-format json | jq -r '.result'
```

## Structured Output

Pair `--output-format json` with `--json-schema` to force the result into a shape you define. The structured value lands in the `structured_output` field:

```bash
claude -p "Extract the function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

## Piping In and Out

Headless mode reads standard input, so you can pipe data in and redirect the result out like any command-line tool:

```bash
cat build-error.txt | claude -p "explain the root cause of this build error" > output.txt
```

Piping a diff is a common CI pattern, since Claude does not need permission to read what you feed it:

```bash
git diff main | claude -p "you are a typo linter. report filename:line for each typo."
```

## Bare Mode for CI

Add [`--bare`](^Skips auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md. Only flags you pass explicitly take effect) to skip auto-discovery and start faster. Without it, `claude -p` loads the same context an interactive session would, including whatever hooks or MCP servers happen to be configured locally. Bare mode gives you the same result on every machine, which is what you want in CI:

```bash
claude --bare -p "Summarize this file" --allowedTools "Read"
```

## Continuing a Conversation

Headless runs can chain. Use `--continue` for the most recent, or capture the session ID to resume a specific one:

```bash
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
claude -p "Now focus on the database queries" --resume "$session_id"
```

## Tips

- Set a ceiling: `--max-budget-usd 5.00` caps spend and `--max-turns 3` caps agentic turns
- Pre-approve tools with `--allowedTools`, or set a locked-down baseline with `--permission-mode dontAsk`
- `--bare` is the recommended mode for scripted calls and will become the default for `-p` in a future release

## Further Reading

- [Official docs: Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
