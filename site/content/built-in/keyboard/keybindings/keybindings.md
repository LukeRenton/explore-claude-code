# Keybindings

Every keyboard shortcut in Claude Code can be remapped. Run `/keybindings` to create or open your configuration file at `~/.claude/keybindings.json`. Changes are detected and applied [without restarting](^Save the file and the new bindings take effect immediately in the running session).

## The File

The file is an object with a `bindings` array. Each block names a [context](^Where the binding applies: the chat input, a confirmation dialog, the transcript viewer, and so on) and maps keystrokes to actions:

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

This binds `Ctrl+E` to open an external editor in the chat input, and unbinds `Ctrl+U`. The optional `$schema` line gives your editor autocompletion for context and action names.

## Contexts and Actions

A binding only fires in its context, so the same key can do different things in the chat input versus a dialog. Common contexts:

| Context | Where it applies |
|---|---|
| `Global` | Everywhere in the app |
| `Chat` | The main prompt input |
| `Transcript` | The transcript viewer |
| `Confirmation` | Permission and confirmation dialogs |
| `HistorySearch` | History search mode (`Ctrl+R`) |

Actions use a `namespace:action` format, like `chat:submit` to send a message, `app:toggleTodos` to show the task list, or `voice:pushToTalk` to dictate. Each context exposes its own set.

## Keystroke Syntax

| Piece | Rule |
|---|---|
| Modifiers | Join with `+`: `ctrl+k`, `shift+tab`, `ctrl+shift+c` |
| `meta` | `Alt` on Windows and Linux, `Option` on macOS |
| Uppercase letter | A bare `K` means `shift+k`. With a modifier, `ctrl+K` is just `ctrl+k` |
| Chords | Sequences separated by spaces: `ctrl+k ctrl+s` means press one, release, then the other |
| Special keys | `escape`, `enter`, `tab`, `space`, arrows, `backspace`, `delete` |

## Unbinding

Set an action to `null` to remove a default shortcut. To reclaim a [chord prefix](^A key like Ctrl+X that only starts multi-key sequences) as a single key, unbind every chord that uses it, in each context that defines it.

## What You Cannot Remap

| Reserved key | Reason |
|---|---|
| `Ctrl+C` | Hardcoded interrupt |
| `Ctrl+D` | Hardcoded exit |
| `Ctrl+M` | Identical to Enter in terminals |
| Caps Lock | Never delivered to terminal apps |

[Vim keys](^Cursor motions and operators inside vim editor mode. See the Vim Mode entry) are also fixed. They live at the text-input level, below the keybinding system, so remap them with the `vimInsertModeRemaps` setting instead.

## Where It Loads From

Keybindings load from `~/.claude/keybindings.json` only. Entries in a project's `.claude/settings.json` are ignored, so [a repository you clone cannot remap your keys](^A deliberate safety boundary: checked-out project files never change your local shortcuts).

## Tips

- Run `/keybindings` to scaffold the file with the schema line already in place
- Claude Code warns about duplicate or conflicting bindings when the file loads. Start with [`--debug`](^A launch flag that surfaces diagnostic logs, including keybinding warnings) to see the details
- Some keys clash with terminal multiplexers: `Ctrl+B` is the tmux prefix and `Ctrl+A` is GNU screen's. Press twice, or rebind

## Further Reading

- [Official docs: Customize keyboard shortcuts](https://code.claude.com/docs/en/keybindings)
