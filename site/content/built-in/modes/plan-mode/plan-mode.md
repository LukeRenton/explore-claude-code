# Plan Mode

Plan mode tells Claude to research and propose changes without making them. Claude reads files, runs shell commands to explore, and writes a plan, but it does not edit your source until you approve. It is the safest way to point Claude at an unfamiliar codebase or a risky change.

## Entering Plan Mode

Three ways in:

| How | When to use it |
|---|---|
| Press `Shift+Tab` | Cycle into it mid-session |
| Prefix a prompt with `/plan` | Plan for a single prompt, then return to your previous mode |
| Launch with `claude --permission-mode plan` | Start the whole session in plan mode |

Press `Shift+Tab` again to leave plan mode without approving a plan.

## What Claude Can and Cannot Do

- **Can:** read files, search, and run [read-only shell commands](^Inspection commands like ls, grep, and git status. Claude Code keeps a built-in list and runs them freely) to understand the code
- **Cannot:** edit source files. Edits stay blocked until you approve the plan
- **Still prompts:** file-modifying shell commands like `touch` and `rm` prompt for approval, even in plan mode

If [Auto mode](^The mode that uses a background classifier to approve safe actions. See the Auto Mode entry) is available, Claude approves read-only exploration commands without prompting while planning. This is on by default via the `useAutoModeDuringPlan` setting. Edits stay blocked either way.

## Reviewing and Approving a Plan

When the plan is ready, Claude presents it and asks how to proceed. Your choices:

| Option | What happens |
|---|---|
| **Yes, and use auto mode** | Approve and start editing in Auto mode. Reads **Yes, auto-accept edits** when Auto mode is unavailable |
| **Yes, manually approve edits** | Approve and review each edit individually |
| **No, refine with Ultraplan** | Send the plan to [Ultraplan](^A browser-based plan review on Claude Code on the web) for review |
| **No, keep planning** | Stay in plan mode and tell Claude what to change |

Approving a plan exits plan mode and switches the session to the mode the approve option describes, so Claude starts editing. To plan again, cycle back with `Shift+Tab` or prefix your next prompt with `/plan`.

Press `Ctrl+G` to open the proposed plan in your editor and change it directly before Claude proceeds. Approving a plan also names the session from the plan content, unless you already set a name.

## Setting Plan Mode as the Default

To make a project start in plan mode every time, set `defaultMode` in `.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

## When to Use It

- Starting on a codebase you do not know well and want a map before any changes
- Scoping a large or risky change so you can review the approach before Claude commits to it
- Turning a vague idea into a concrete, reviewable set of steps

## Tips

- `/plan` as a one-off prefix is the fastest way to plan a single request without changing your session mode
- Read the plan before approving. Plan mode's value is the review step, so use it
- Pair plan mode with a fresh context: plan the work, approve, and let Claude execute in one clean pass

## Further Reading

- [Official docs: Analyze before you edit with plan mode](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
