# Vim Mode

Prefer to edit your prompt the way you edit code? Claude Code has a vim-style editor for the input line. Enable it in `/config` under **Editor mode**, then edit with the motions and operators you already know. It changes only how you type your prompt, not what Claude does.

## The Three Modes

| Mode | You are | Enter it with |
|---|---|---|
| INSERT | Typing text normally | `i`, `a`, `o`, and you start here |
| NORMAL | Navigating and running operators | `Esc` |
| VISUAL | Selecting text | `v` for characters, `V` for lines |

In NORMAL mode, `Esc` does not interrupt Claude. It just [stays in NORMAL mode](^Vim's Escape is handled at the input level, so it will not trigger the usual interrupt action). Most `Ctrl+key` shortcuts still pass through to Claude Code as normal.

## Navigation (NORMAL mode)

| Keys | Motion |
|---|---|
| `h` `j` `k` `l` | Left, down, up, right |
| `w` / `e` / `b` | Next word / end of word / previous word |
| `0` / `$` / `^` | Line start / line end / first non-blank |
| `gg` / `G` | Start / end of the input |
| `f{char}` / `t{char}` | Jump to / just before the next occurrence of a character |

## Editing (NORMAL mode)

| Keys | Action |
|---|---|
| `x` | Delete the character under the cursor |
| `dd` / `D` | Delete the line / to the end of the line |
| `dw` `de` `db` | Delete word, to end, back |
| `cc` / `C` | Change the line / to the end of the line |
| `yy` / `p` | Yank (copy) the line / paste |
| `u` / `.` | Undo / repeat the last change |
| `>>` / `<<` | Indent / dedent the line |

Operators combine with [text objects](^A span like a word or a quoted string. Combine with an operator, so diw deletes the inner word): `diw` deletes the inner word, `ci"` changes the text inside double quotes, `ya(` yanks around parentheses.

## Faster Escape

Reaching for `Esc` gets old. The `vimInsertModeRemaps` setting maps a two-key INSERT-mode sequence to Escape. The classic is `jj`:

```json
{
  "editorMode": "vim",
  "vimInsertModeRemaps": { "jj": "<Esc>" }
}
```

Type `j`, and a second `j` within one second removes the first and drops you into NORMAL mode. Pause between them and both stay as literal text, so words with a double `j` still work. `"<Esc>"` is the only supported target.

## Tips

- Enable vim mode in `/config` under Editor mode. It affects the prompt input only
- Vim motions are not remappable through [keybindings.json](^The keybinding system sits above the text input. See the Keybindings entry). Use `vimInsertModeRemaps` for INSERT-mode shortcuts
- In NORMAL mode, `/` opens history search like `Ctrl+R`, and `?` shows the help menu
- At the edge of the input, `j` and `k` step through command history instead of moving the cursor

## Further Reading

- [Official docs: Vim editor mode](https://code.claude.com/docs/en/interactive-mode#vim-editor-mode)
