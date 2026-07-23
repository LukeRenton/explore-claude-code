# Modes

Modes control how much Claude does on its own before it checks with you. They set the [baseline for permission prompts](^Whether Claude pauses to ask before it edits a file, runs a shell command, or makes a network request): review every action, auto-accept edits, plan before touching anything, or hand off with background safety checks.

You do not create these. They ship with Claude Code. Every mode here is technically a **permission mode**. Plan mode and Auto mode are powerful enough to earn their own pages; the rest are covered under Permission Modes.

## The Modes at a Glance

| Mode | Runs without asking | Best for |
|---|---|---|
| **Manual** | Reads only | Getting started, sensitive work |
| **Accept Edits** | Reads, file edits, common file commands | Iterating on code you review afterwards |
| **Plan** | Reads only, no edits | Exploring before you change anything |
| **Auto** | Everything, with background safety checks | Long tasks, fewer interruptions |
| **Don't Ask** | Only pre-approved tools | Locked-down CI and scripts |
| **Bypass Permissions** | Everything, no checks | Isolated containers and VMs only |

The mode that reviews every action is named **Manual** in the interface. Its config value is `default`, which is what [settings files](^~/.claude/settings.json and .claude/settings.json. The value you write there is "default", not "manual"), hooks, and the SDK use. `manual` works as an alias wherever you type the value.

## Switching Modes

During a session, press `Shift+Tab` to cycle through the modes:

```
Manual  →  Accept Edits  →  Plan
```

Optional modes slot in after Plan once your account or launch flags enable them: `Bypass Permissions` first, then `Auto`. The status bar shows the active mode, for example `⏸ plan mode on` or `⏵⏵ auto mode on`.

You can also set a mode three other ways:

| How | Example |
|---|---|
| At startup | `claude --permission-mode plan` |
| As a session default | `"permissions": { "defaultMode": "acceptEdits" }` in a settings file |
| In an editor or app | The mode selector in VS Code, JetBrains, the desktop app, and claude.ai |

The mode is set through these controls, [not by asking Claude in chat](^Claude cannot change its own permission mode. That is deliberate: the mode is your safety boundary, so it lives outside the conversation).

## Choosing a Mode

- **Reviewing carefully or touching sensitive code?** Stay in **Manual**. You approve every action.
- **Iterating fast on code you will read afterwards?** **Accept Edits** stops the per-edit prompts but still reviews shell commands.
- **Unsure what a change will involve?** **Plan** first. Claude researches and proposes, and edits nothing until you approve the plan.
- **Trust the direction and want fewer interruptions?** **Auto** runs the whole task with a background classifier watching for dangerous actions.
- **Running unattended in CI or a throwaway container?** **Don't Ask** or **Bypass Permissions**, and nothing else.

## Layering Permission Rules

Modes set the baseline. On top of any mode you can pre-approve or block specific tools with [allow, ask, and deny rules](^Rules in your settings files that grant or refuse specific tools and commands, for example allowing `Bash(npm test)` or denying `Bash(git push:*)`). Deny and ask rules apply in every mode, including Bypass Permissions. See the **Permission Modes** entry below for how these fit together.

## Explore Each Mode

Open the entries below for the full behaviour of each:

- **Permission Modes** covers Manual, Accept Edits, Don't Ask, and Bypass Permissions, plus permission rules and protected paths
- **Plan Mode** covers researching and approving a plan before any edits
- **Auto Mode** covers the safety classifier that lets Claude run without routine prompts

## Further Reading

- [Official docs: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
