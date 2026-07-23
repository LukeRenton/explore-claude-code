# Permission Modes

Four of the built-in modes trade oversight for convenience without a safety classifier: **Manual**, **Accept Edits**, **Don't Ask**, and **Bypass Permissions**. This page covers those, plus the permission rules and protected paths that apply on top of every mode. Plan mode and Auto mode have their own entries.

## Manual

The default. Claude reads files freely but pauses for approval before it edits anything, runs a shell command that is not [read-only](^Commands like ls, cat, grep, and git status that only inspect state. Claude Code keeps a built-in list of these and never prompts for them), or makes a network request.

- **Config value:** `default` (the alias `manual` also works)
- **Status bar:** `⏸ manual mode on`
- **Use it for:** getting started, and any work where you want to see each action before it happens

## Accept Edits

Claude creates and edits files in your working directory without prompting. It also auto-approves common filesystem commands: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, and `sed`. Everything else, including other shell commands, still prompts.

- **Config value:** `acceptEdits`
- **Status bar:** `⏵⏵ accept edits on`
- **Scope:** auto-approval applies only to paths inside your working directory or [additional directories](^Extra folders you grant access to with the --add-dir flag or the /add-dir command). Writes outside that scope still prompt
- **Use it for:** iterating on code you plan to review afterwards with `git diff` rather than approving each edit inline

Press `Shift+Tab` once from Manual to enter it.

## Don't Ask

Claude auto-denies anything that would otherwise prompt you. It runs only actions matching your `allow` rules, read-only commands, and calls a [PreToolUse hook](^A script that runs before a tool call and can approve or reject it. See the hooks section) approves. The session never waits for input.

- **Config value:** `dontAsk`
- **Status bar:** `⏵⏵ don't ask on`
- **Not in the cycle:** it never appears in `Shift+Tab`. Set it at startup with `claude --permission-mode dontAsk`
- **Use it for:** CI pipelines and restricted environments where you pre-define exactly what Claude may do

## Bypass Permissions

Disables permission prompts and safety checks entirely. Tool calls execute immediately, including writes to protected paths.

- **Config value:** `bypassPermissions` (the `--dangerously-skip-permissions` flag is equivalent)
- **Status bar:** `⏵⏵ bypass permissions on`
- **Guardrails that still fire:** explicit `ask` rules, and a circuit breaker on `rm -rf /` and `rm -rf ~`
- **Cannot be entered mid-session.** Enable it at launch with a flag or `"defaultMode": "bypassPermissions"`. The first time, Claude Code shows a one-time warning dialog. It also refuses to start as root or under `sudo`

> Only use Bypass Permissions in isolated environments like containers or VMs without internet access, where Claude Code cannot damage your host. For fewer prompts with a safety net, use Auto mode instead.

## Permission Rules Layer on Top

Modes set the baseline for what runs without asking. [Permission rules](^allow, ask, and deny entries in your settings files, scoped to tools and commands) refine it, and they apply across modes:

| Rule | Effect |
|---|---|
| `allow` | Pre-approve a tool or command so it never prompts |
| `ask` | Force a prompt, even in Bypass Permissions |
| `deny` | Block outright, in every mode, including Bypass Permissions |

For a hard guarantee that Claude never does something, a `deny` rule is stronger than any mode, because the mode cannot loosen it.

## Protected Paths

In every mode except Bypass Permissions, writes to a small set of paths are never auto-approved, even under Accept Edits or an `allow` rule. This guards your repository state and Claude's own configuration from accidental corruption. Protected locations include `.git`, `.claude`, `.vscode`, `.idea`, and shell startup files like `.zshrc` and `.bashrc`.

| Mode | Protected-path writes |
|---|---|
| Manual, Accept Edits, Plan | Prompted |
| Auto | Routed to the classifier |
| Don't Ask | Denied |
| Bypass Permissions | Allowed |

## Setting a Default

To start every session in a given mode, set `defaultMode` in a [settings file](^~/.claude/settings.json for all projects, or .claude/settings.json for one project):

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

## Tips

- `Shift+Tab` only cycles Manual, Accept Edits, and Plan. Don't Ask and Bypass Permissions are opt-in via flags or settings
- Reach for a `deny` rule, not a mode, when you need a guarantee. Modes are convenience settings; deny rules are enforcement
- Accept Edits pairs well with `/diff`: let Claude edit freely, then review every change in one place

## Further Reading

- [Official docs: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
- [Official docs: Permissions](https://code.claude.com/docs/en/permissions)
