# Keyboard & Shortcuts

Claude Code is built to be driven from the keyboard. A set of shortcuts ships with every session for interrupting Claude, switching modes, editing your prompt, backgrounding tasks, and searching history, no mouse required.

You do not set these up. They are part of the terminal interface. A few vary by platform and terminal, which the entries below call out, and every one of them can be remapped if the defaults do not suit you.

## The Essentials

If you learn six shortcuts, learn these:

| Key | What it does |
|---|---|
| `Esc` | Interrupt Claude mid-turn. It keeps the work done so far, so you can redirect |
| `Esc` `Esc` | On an empty prompt, open the [rewind menu](^Restore or summarise your code and conversation from an earlier point. See Checkpointing). With text, clear the draft and save it to history |
| `Shift+Tab` | Cycle [permission modes](^Manual, Accept Edits, Plan, and any you have enabled. See the Modes section) |
| `Ctrl+B` | Background the running task so you can keep working while it runs |
| `Ctrl+O` | Toggle the transcript viewer to see tool calls, timestamps, and the model used |
| `Ctrl+R` | Reverse-search your command history |

`Ctrl+C` interrupts a running operation, and on an idle prompt clears your input before a second press exits. `Ctrl+D` exits Claude Code.

## Prefixes That Change the Input

Some keys change what the prompt does when you type them at the start:

| Prefix | Mode |
|---|---|
| `/` | [Command or skill](^Built-in commands, bundled and custom skills, plus plugin and MCP commands. See the commands section) picker |
| `!` | [Shell mode](^Run a shell command directly, add its output to the session, and have Claude respond to it): run a command without Claude interpreting it |
| `@` | File-path mention with autocomplete |
| `?` | Toggle the shortcut help panel, on an empty prompt |

## Platform Notes

Shortcuts vary a little by platform and terminal. On macOS, the `Option`-key shortcuts (switch model, toggle thinking, word navigation) need [Option configured as Meta](^A terminal setting. iTerm2, Apple Terminal, and VS Code each expose it) in your terminal. On Windows and Linux the same shortcuts use `Alt`.

## Explore

Open the entries below:

- **Shortcuts** is the full reference: general controls, text editing, multiline input, and the transcript viewer
- **Keybindings** covers customising any shortcut in `~/.claude/keybindings.json`
- **Vim Mode** covers the vim-style editor for your prompt input

## Further Reading

- [Official docs: Interactive mode](https://code.claude.com/docs/en/interactive-mode)
