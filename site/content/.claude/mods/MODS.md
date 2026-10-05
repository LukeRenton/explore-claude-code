# Mods

A mod is a small JavaScript or TypeScript file that runs inside your Claude Code session. Mods can watch what Claude does, change it before it happens, or draw custom UI in the terminal or the desktop app's Code tab: a band above the prompt, a docked pane, a status line, or a toast.

Mods need Claude Code **2.1.287 or later**, where they are on by default.

## Quick Start

The fastest way to get a mod is to describe it:

```
> make a mod that shows how full my context window is, above the prompt
```

Claude Code uses the bundled [/plugin-authoring](^A built-in skill that writes mods as hot-reloading plugins. See built-in/bundled-skills) skill to write it, including the type declarations, and loads it straight into your session. To build one by hand:

1. Create a plugin folder with `.claude-plugin/plugin.json`
2. Add `hooks/hooks.json` listing your module files
3. Write the module: export a `register(on)` function
4. Load it: `claude --plugin-dir ./my-mod`

Edit the file and the running session picks up the change. No restart needed.

## Mods vs. Hooks

Mods sit next to [shell hooks](^Scripts in settings.json that run per event and talk JSON over stdin/stdout. See the hooks section), and the difference matters:

| | Shell hooks | Mods |
|---|---|---|
| Written in | Any language, run as a process | JavaScript or TypeScript |
| Lifetime | A fresh process per event | Loaded once, lives for the whole session |
| Talks to Claude Code via | JSON on stdin/stdout, exit codes | The `$` API, directly |
| Keeps state | No (write it to disk yourself) | Yes, with `$.state` |
| Can draw UI | No | Yes: bands, panes, status line, toasts |
| Configured in | `settings.json` | A plugin's `hooks/hooks.json` |

Use a shell hook for a quick gate or formatter. Reach for a mod when you want memory between events, live UI, or tighter control.

## How a Mod Works

Each module exports `register(on)`. Inside it, you call `on(event, matcher?, hook)` to attach a hook:

```javascript
export function register(on) {
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    return next(e);
  });
}
```

| Argument | What it is |
|---|---|
| `$` | The mods API: session, state, UI, files, processes, HTTP, and more |
| `e` | The event: the tool call, the prompt, the component being rendered |
| `next` | Hands the event on down the chain |

Hooks form a chain, like [middleware](^Code that sits between a request and its handler, and can inspect, change, or short-circuit it). Your hook runs, `next(e)` passes the event to the next plugin, and at the bottom Claude Code does what it would have done anyway. That gives you three moves:

| Move | Code | Effect |
|---|---|---|
| **Observe** | `const r = await next(e); return r` | Watch without changing anything |
| **Rewrite** | `return next({ ...e, command: safer })` | Change what everything downstream sees |
| **Answer** | `return { deny: "reason" }` | Skip `next` and respond yourself |

## Hook Events

| Event | When it fires |
|---|---|
| `session.start` / `session.end` | The session begins or ends |
| `prompt.submit` | You submit a prompt |
| `turn.start` / `turn.complete` | Claude starts or finishes a turn |
| `tool.call` | Claude calls a tool (match with `{ tool: "Bash" }`) |
| `command.run` | A slash command runs (match with `{ command: "name" }`) |
| `ui.render` | A UI component draws (match with `{ component: "AbovePrompt" }`) |

## The `$` API

| Namespace | Use it for |
|---|---|
| `$.session` | `usage()` for context and token counts, `cwd()` |
| `$.state` | `get` / `set` named values that survive hot reloads |
| `$.ui` | `resolve(e)` for UI elements, `open()` a pane, `status()`, `toast()` |
| `$.command` | `register()` your own slash commands, `list()` existing ones |
| `$.process` | `run(argv)` a program, always as an argument array |
| `$.fs`, `$.http`, `$.tool`, `$.clock` | Files, web requests, tools, and timers |

Mods run in a [sandbox](^An isolated runtime with no DOM and no Node.js. Every outside effect goes through $, so Claude Code can see and control it). There is no Node.js and no DOM. Everything that touches the outside world goes through `$`.

## UI Surfaces

| Surface | Where it shows |
|---|---|
| **AbovePrompt** | A band directly above the input box |
| **Pane** | A docked side panel that adapts to terminal width |
| **Status line** | The bottom status display |
| **Toast** | A short-lived notification |

Call `$.ui.resolve(e)` inside a `ui.render` hook to get the elements that surface supports, like `Box` and `Text`. The event's `e.props` tells you about the space you have: `bodyColumns` (available width), `isWorking` (Claude is busy), and `hasSurvey` (a survey already owns this spot, so step aside).

## State and Hot Reload

While you develop, the mod folder is watched and changes reload into the running session. Module-level variables **reset** on every reload. Anything that should survive goes in `$.state`:

```javascript
const counter = { plugin: "my-mod", key: "blocked" };
const { value: count = 0 } = await $.state.get(counter);
await $.state.set(counter, count + 1);
```

Reading state inside a `ui.render` hook subscribes that render to it, so the UI redraws whenever the value changes. Declare each state key in `types/index.d.ts` so the types line up.

## Mod Structure

```
my-mod/
  .claude-plugin/
    plugin.json          # Manifest, points at your types
  hooks/
    hooks.json           # Lists the module files to load
    my-mod.mjs           # The mod itself
  types/
    index.d.ts           # Declares your $.state keys
  tests/
    my-mod.test.ts       # Tests, run with claude plugin test
```

A mod is a [plugin](^A directory with a .claude-plugin/plugin.json manifest. See the plugins section) with function hooks, so it ships the same way plugins do.

## Validate, Test, Share

```bash
claude plugin validate ./my-mod    # manifest, type contract, declared hooks
claude plugin test ./my-mod        # runs tests/*.test.ts
```

To share, list the mod in a [marketplace](^A catalogue that lists plugins and where to fetch them. See MARKETPLACES.md) and push it to GitHub. Others install it like any plugin:

```
/plugin marketplace add your-org/my-mods
/plugin install my-mod@my-mods
/reload-plugins
```

For wider reach, submit it to the official directory at [claude.ai/directory/manage](https://claude.ai/directory/manage).

## Tips

- Each hook gets **10 seconds of its own time per dispatch**. Time spent waiting inside a `$` call does not count
- Pass process arguments as arrays: `$.process.run(["git", "status"])`. No shell string means no injection
- When you open a pane, check `opened.isPlaced`. A narrow terminal may not fit it, so draw a fallback in the band
- Your mod sees every event, but other mods see it too. You can answer or deny an event, not hide it from the rest of the chain
- Keep heavy work out of `ui.render`. Compute in an event hook, store the result in `$.state`, and just read it when drawing

## Further Reading

- [Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/)
- [Plugins docs](https://code.claude.com/docs/en/plugins)
