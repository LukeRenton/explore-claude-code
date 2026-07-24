# Shortcuts

The full keyboard reference for a Claude Code session. These ship built-in, and a handful vary by platform, noted inline. Every one of them can be [remapped](^Customise any shortcut in ~/.claude/keybindings.json. See the Keybindings entry) if the defaults do not suit you.

## General Controls

| Key | What it does |
|---|---|
| `Ctrl+C` | Interrupt a running operation. On an idle prompt, the first press clears input and a second press exits |
| `Esc` | Interrupt Claude mid-turn, or close an open dialog |
| `Esc` `Esc` | On an empty prompt, open the [rewind menu](^Restore or summarise code and conversation from an earlier point. See Checkpointing). With text, clear the draft and save it to history |
| `Ctrl+D` | Exit Claude Code. With text in the prompt, deletes the character after the cursor instead |
| `Shift+Tab` | Cycle [permission modes](^Manual, Accept Edits, Plan, and any you have enabled. See the Modes section) |
| `Ctrl+B` | Background the running task. Tmux users press twice |
| `Ctrl+O` | Toggle the transcript viewer |
| `Ctrl+R` | Reverse-search command history |
| `Ctrl+L` | Redraw the screen without losing input or history |
| `Ctrl+T` | Toggle Claude's [task checklist](^Claude's own to-do list for multi-step work. Not the background-task view, which is /tasks) |
| `Ctrl+S` | Stash the current prompt, or restore a stashed one |
| `Ctrl+G` | Open your prompt in your default text editor |
| `Ctrl+V` | Paste an image from the clipboard (`Alt+V` on Windows and WSL) |
| `Ctrl+Z` | Suspend Claude Code to your shell on Unix. Run `fg` to resume |
| `Up` / `Down` | Move the cursor in multiline input, then step through command history at the edges |

### Model, Thinking, and Fast Mode

These use `Option` on macOS and `Alt` on Windows and Linux:

| Key | What it does |
|---|---|
| `Option+P` / `Alt+P` | Switch model without clearing your prompt |
| `Option+T` / `Alt+T` | Toggle [extended thinking](^How deeply Claude reasons before answering. See Context and Thinking) |
| `Option+O` / `Alt+O` | Toggle [fast mode](^The same Opus model with faster output. Toggle with /fast) |

## Text Editing

The prompt supports the standard readline editing keys:

| Key | What it does |
|---|---|
| `Ctrl+A` / `Ctrl+E` | Jump to the start / end of the line |
| `Ctrl+K` | Delete from the cursor to the end of the line |
| `Ctrl+U` | Delete from the cursor to the start of the line |
| `Ctrl+W` | Delete the previous word |
| `Ctrl+Y` | Paste text deleted with `Ctrl+K`, `Ctrl+U`, or `Ctrl+W` |
| `Alt+B` / `Alt+F` | Move back / forward one word |
| `Ctrl+_` | Undo the last input edit |

## Multiline Input

To write a prompt across several lines:

| Method | How |
|---|---|
| Quick escape | `\` then `Enter`. Works in every terminal |
| Control sequence | `Ctrl+J`. Works in every terminal, no setup |
| Shift+Enter | Native in iTerm2, WezTerm, Ghostty, Kitty, Warp, Apple Terminal, and Windows Terminal |
| Option+Enter | On macOS with [Option as Meta](^Configure your terminal to treat Option as the Meta key) enabled |

For VS Code, Cursor, Alacritty, and Zed, run `/terminal-setup` once to install the `Shift+Enter` binding.

## Transcript Viewer

Press `Ctrl+O` to open the transcript viewer, which shows tool calls, timestamps, and the model used on each message:

| Key | What it does |
|---|---|
| `Ctrl+E` | Toggle showing all content |
| `{` / `}` | Jump to the previous / next prompt, in [fullscreen rendering](^The full-window TUI renderer. Run /tui to check which renderer is active) |
| `?` | Show the full shortcut panel, in fullscreen rendering |
| `q`, `Ctrl+C`, `Esc` | Exit the viewer |

## Tips

- On macOS, `Option`-key shortcuts need [Option configured as Meta](^A terminal setting. iTerm2, Apple Terminal, and VS Code each expose it) or they will not register
- `Ctrl+B` is the tmux prefix, so under tmux you press it twice to reach Claude Code's backgrounding
- Type `?` on an empty prompt any time to pop up the shortcut help panel

## Further Reading

- [Official docs: Keyboard shortcuts](https://code.claude.com/docs/en/interactive-mode#keyboard-shortcuts)
