# Auto Mode

Auto mode lets Claude execute without routine permission prompts, while a separate classifier model reviews each action before it runs. It is the middle ground between approving everything by hand and turning off checks entirely with Bypass Permissions.

Claude Code users approve around 93% of the permission prompts they see. Auto mode automates the safe majority and reserves your attention for the actions that actually warrant a look.

## How It Works

Auto mode runs two layers of defence:

1. **An input probe** scans incoming tool results (file reads, web fetches, shell output) for content that looks like it is trying to hijack Claude's behaviour, and flags it before Claude reads it.
2. **A transcript classifier** evaluates each action Claude wants to take, before it runs, acting as a stand-in for a human approver.

The classifier sees your messages, Claude's tool calls, and your CLAUDE.md. [Tool results are stripped out](^So hostile content inside a file or web page cannot manipulate the classifier directly. The input probe handles that content separately), so a poisoned file cannot talk the classifier into approving something.

Actions resolve in a fixed order: your `allow`, `ask`, and `deny` rules first; then read-only actions and working-directory edits are auto-approved; everything else goes to the classifier.

## What Runs, What Blocks

**Approved without asking:**

- Reading and editing files in your working directory
- Installing dependencies declared in your lock files or manifests
- Reading `.env` and sending credentials to their matching API
- Read-only network requests
- Pushing to branches of the repository you are working in

**Blocked by default** (a sample, the full list is long):

- Downloading and running code, like `curl | bash`
- Force pushes, and production deploys or migrations
- Mass deletion on cloud storage, or `terraform destroy`
- Sending secrets or sensitive data to external endpoints
- Granting IAM or repository permissions

Explicit `ask` rules always force a prompt, and `rm -rf /` or `rm -rf ~` always prompt as a circuit breaker rather than going to the classifier.

Run `claude auto-mode defaults` to print the full block and allow lists as JSON.

## Boundaries You State in Conversation

If you tell Claude "don't push" or "wait until I review before deploying," the classifier treats that as a block signal and refuses matching actions, even when the default rules would allow them. The boundary holds until you lift it in a later message.

These boundaries are [not stored as rules](^The classifier re-reads them from the transcript on each check, so a boundary can be lost if context compaction removes the message that stated it). For a hard guarantee, add a `deny` rule instead.

## When Auto Mode Falls Back

Each denied action shows a notification and appears in `/permissions` under **Recently denied**, where you can press `r` to retry it with a manual approval.

If the classifier blocks an action three times in a row, or twenty times total, auto mode pauses and Claude Code resumes prompting you. Approving the prompted action resumes auto mode. Repeated blocks usually mean the classifier is missing context about your infrastructure.

## Requirements

Auto mode is available only when your account meets all of these:

- **Plan:** all plans. On Team and Enterprise, an Owner must enable it in admin settings first
- **Model:** a recent model. On the Anthropic API, Opus 4.6 or later, Sonnet 4.6 or later, or Fable 5. On other providers, Sonnet 5, Opus 4.7, Opus 4.8, or Fable 5
- **Provider:** available by default on the major providers

When eligible, Auto mode appears in the `Shift+Tab` cycle. If Claude Code reports it as unavailable, one of these requirements is unmet. To make it the default, set it in your **user** settings:

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

Claude Code [ignores `defaultMode: "auto"` in project and local settings](^So a repository you clone cannot grant itself auto mode. Move the setting to ~/.claude/settings.json), so a repository cannot grant itself auto mode.

> Auto mode reduces permission prompts but does not guarantee safety. Use it for tasks where you trust the general direction, not as a replacement for review on sensitive operations.

## Auto Mode vs Bypass Permissions

Both cut down on prompts, but they are not the same. Bypass Permissions turns checks off and offers no protection against prompt injection or mistakes. Auto mode keeps a classifier watching every action. When you want fewer interruptions without giving up the safety net, Auto mode is the one to reach for.

## Further Reading

- [Official docs: Eliminate prompts with auto mode](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode)
- [Anthropic Engineering: How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)
