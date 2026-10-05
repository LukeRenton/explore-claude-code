# Hooks

Hooks are custom scripts that run automatically at specific points during a Claude Code session. They let you intercept tool calls, validate changes, enforce rules, and wire Claude into your existing development workflow.

## Quick Start

1. Open `.claude/settings.json` (or run `/hooks` in a session)
2. Add a hook entry under the event you want to intercept (e.g. `PreToolUse`, `PostToolUse`)
3. Write a script that reads JSON from stdin, inspects it, and exits with code 0 (allow) or 2 (block)
4. Restart Claude Code. Hooks are snapshotted at startup

## How Hooks Work

Every action Claude takes fires a [hook event](^A named lifecycle point where hooks can run, like PreToolUse or PostToolUse). Your configuration tells Claude Code which events to watch and what to run when they fire.

1. **Event fires**. Claude is about to call a tool, finish responding, start a session, etc.
2. **Matcher checks**. If you defined a matcher (a regex on the tool name or event source), only matching events trigger your hook
3. **Hook handler runs**. Your script (or HTTP endpoint, or LLM prompt) receives JSON context on stdin
4. **Claude acts on the result**. Exit code 0 means allow. Exit code 2 means block (for events that support it). JSON output gives finer control

## Hook Events

Hooks fire at these points in Claude's lifecycle. Events in the agentic loop fire repeatedly as Claude works:

| Event | When it fires | Can block? |
|---|---|---|
| `SessionStart` | Session begins or resumes | No |
| `UserPromptSubmit` | You submit a prompt, before Claude processes it | Yes |
| `PreToolUse` | Before a tool call executes | Yes |
| `PermissionRequest` | When a permission dialog would appear | Yes |
| `PostToolUse` | After a tool call succeeds | Feedback only |
| `PostToolUseFailure` | After a tool call fails | Feedback only |
| `Stop` | When Claude finishes responding | Yes (force continue) |
| `SubagentStart` | When a subagent is spawned | No |
| `SubagentStop` | When a subagent finishes | Yes |
| `Notification` | When Claude sends a notification | No |
| `TeammateIdle` | When an agent team member is about to go idle | Yes |
| `TaskCompleted` | When a task is being marked as completed | Yes |
| `ConfigChange` | When a configuration file changes | Yes |
| `PreCompact` | Before context compaction | No |
| `SessionEnd` | When a session ends | No |

## Configuration

Hooks are defined in settings files. Three levels of nesting:

1. **Hook event**: which lifecycle point to respond to
2. **Matcher group**: a regex filter (e.g. only for the `Bash` tool)
3. **Hook handler**: the script, endpoint, prompt, or agent to run

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh"
          }
        ]
      }
    ]
  }
}
```

### Where to Define Hooks

| Location | Scope | Committed? |
|---|---|---|
| `~/.claude/settings.json` | All your projects | No |
| `.claude/settings.json` | This project, shared | Yes |
| `.claude/settings.local.json` | This project, personal | No |
| Plugin `hooks/hooks.json` | When plugin is enabled | Yes |
| Skill/agent frontmatter | While component is active | Yes |

### Matcher Patterns

The `matcher` is a regex matched against different fields depending on the event:

- **Tool events** (`PreToolUse`, `PostToolUse`, etc.): matches `tool_name` (e.g. `Bash`, `Edit|Write`, `mcp__github__.*`)
- **SessionStart**: matches how the session started (`startup`, `resume`, `clear`, `compact`)
- **SessionEnd**: matches why the session ended (`clear`, `logout`, `other`)
- **Notification**: matches notification type (`permission_prompt`, `idle_prompt`)
- **SubagentStart/Stop**: matches agent type (`Bash`, `Explore`, `Plan`, or custom names)

Omit the matcher or use `"*"` to match everything. Some events like `UserPromptSubmit` and `Stop` don't support matchers and always fire.

### Hook Handler Types

| Type | How it works |
|---|---|
| `command` | Runs a shell command. Receives JSON on stdin. Communicates via exit codes and stdout |
| `http` | Sends JSON as a POST request to a URL. Response body controls the decision |
| `prompt` | Sends input to a Claude model for single-turn yes/no evaluation |
| `agent` | Spawns a subagent with tool access (Read, Grep, Glob) to verify conditions |

Not all events support all types. `SessionStart`, `Notification`, `PreCompact`, and others only support `command` hooks.

## Input and Output

### What Your Hook Receives

All hooks get this JSON on stdin (or as the POST body for HTTP hooks):

```json
{
  "session_id": "abc123",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

The `tool_name` and `tool_input` fields are event-specific. Each event adds its own fields on top of the common ones.

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success. Claude Code parses stdout for optional JSON output |
| `2` | Blocking error. stderr is fed to Claude as an error message. The effect depends on the event |
| Other | Non-blocking error. stderr shown in verbose mode, execution continues |

### JSON Output

For finer control, exit 0 and print JSON to stdout instead of using exit codes alone:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked"
  }
}
```

Universal JSON fields work across all events:

| Field | Effect |
|---|---|
| `continue` | If `false`, Claude stops processing entirely |
| `stopReason` | Message shown to user when `continue` is false |
| `suppressOutput` | If `true`, hides stdout from verbose mode |
| `systemMessage` | Warning message shown to the user |

## Async Hooks

Add `"async": true` to a command hook to run it in the background. Claude continues working immediately while the hook executes. Results are delivered on the next conversation turn.

```json
{
  "type": "command",
  "command": ".claude/hooks/run-tests.sh",
  "async": true,
  "timeout": 120
}
```

Async hooks cannot block tool calls or return decisions. They are useful for running test suites, deployments, or notifications alongside Claude's work.

## Common Patterns

**Block dangerous commands** (PreToolUse on Bash): parse `tool_input.command`, check for `rm -rf` or other destructive patterns, exit 2 to block.

**Auto-format after edits** (PostToolUse on Write|Edit): run your linter or formatter on the changed file, feed output back to Claude.

**Type-check after changes** (PostToolUse on Write|Edit): run `tsc --no-emit` after TypeScript changes, Claude sees errors and fixes call sites.

**Prevent duplicate code** (PostToolUse on Write): launch a secondary Claude instance to review new code against existing patterns.

**Quality gates before stopping** (Stop): check that tests pass or required files exist before allowing Claude to finish.

**Inject environment at startup** (SessionStart): write `export` statements to `$CLAUDE_ENV_FILE` to set environment variables for the session.

## Need More Than a Script?

Shell hooks start a fresh process for every event. If you want state that lasts the whole session, live UI like a band above the prompt or a docked pane, or to call Claude Code features directly, write a [mod](^JavaScript hooks that run inside your session. See the mods section) instead. Mods are function hooks shipped as a plugin.

## Tips

- Hooks are snapshotted at session startup. Restart Claude after changing hook config
- Use `$CLAUDE_PROJECT_DIR` in commands to reference scripts relative to the project root
- Use `/hooks` in a session to view, add, and delete hooks interactively
- Run `claude --debug` to see hook execution details and exit codes
- Set `"disableAllHooks": true` in settings to temporarily disable all hooks
- Keep hooks fast. The default timeout is 600 seconds for commands, 30 for prompts
- Quote shell variables (`"$VAR"` not `$VAR`) and validate inputs. Hook scripts run with your full user permissions
- For MCP tools, match with patterns like `mcp__github__.*` or `mcp__.*__write.*`
- Prompt and agent hooks return `{"ok": true/false, "reason": "..."}` instead of using exit codes

[Hooks reference](https://code.claude.com/docs/en/hooks) |
[Hooks guide](https://code.claude.com/docs/en/hooks-guide)
