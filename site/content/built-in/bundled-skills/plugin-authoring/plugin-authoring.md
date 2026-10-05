# /plugin-authoring

Builds a [mod](^A small JavaScript or TypeScript file that runs inside your session. See .claude/mods) for you: a live pane, a band above the prompt, a status line, a toast, or a hook. It writes the mod as a plugin of function hooks that hot-reloads into the session you are already in.

## Usage

You rarely type it. Describe the mod you want and Claude loads the skill on its own:

```
> make a mod that shows how full my context window is, above the prompt
> add a pane that lists every file Claude edited this turn
> hold any git reset --hard and show me what it would throw away
```

You can also invoke it directly with `/plugin-authoring`.

## What It Does

| Step | What happens |
|---|---|
| Scaffold | Creates `.claude-plugin/plugin.json`, `hooks/hooks.json`, and the module |
| Types | Writes `types/index.d.ts` declaring every `$.state` key the mod uses |
| Load | Loads the mod into the current session with hot reload on |
| Iterate | Edits the module as you give feedback. Each save reloads in place |
| Debug | Reads the mod's errors and fixes the hook that threw |

## When to Use It

- You want custom UI in the terminal or the desktop app's Code tab
- A shell hook is not enough because you need state between events or live updates
- You want to try an idea quickly before deciding whether to share it

## Tips

- Say which surface you want (band, pane, status line, toast). It changes the code a lot
- Ask for tests too. The skill can write `tests/*.test.ts` for `claude plugin test`
- When you are happy with it, run `claude plugin validate` and add it to a marketplace to share it

## Further Reading

- [Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/)
