# Auto Memory

Each Claude Code session starts with a fresh context window. **Auto memory** is how Claude carries knowledge forward on its own: it writes notes to itself as it works, build commands it learned, debugging insights, patterns it noticed, mistakes to avoid, and reads them back at the start of future sessions.

This is the counterpart to [CLAUDE.md](^The file you write to give Claude persistent instructions. See the CLAUDE.md section). You write CLAUDE.md; Claude writes auto memory. Both load at the start of every conversation.

## CLAUDE.md vs Auto Memory

| | CLAUDE.md | Auto memory |
|---|---|---|
| **Who writes it** | You | Claude |
| **What it holds** | Instructions and rules | Learnings and patterns |
| **Scope** | Project, user, or org | Per repository, shared across worktrees |
| **Use for** | Coding standards, workflows, architecture | Build commands, debugging insights, preferences Claude discovers |

Use CLAUDE.md to guide Claude's behaviour deliberately. Auto memory lets Claude learn from your corrections without you writing anything down.

## Where It Lives

Each project gets its own memory directory:

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Concise index, loaded every session
├── debugging.md       # Detailed notes on a topic
├── api-conventions.md # Another topic file
└── ...
```

- The `<project>` path is [derived from the git repository](^So every worktree and subdirectory of the same repo shares one memory directory), or the project root when you are not in a git repo
- `MEMORY.md` is the index. Claude keeps it short and moves detail into topic files
- Auto memory is **machine-local**. It is not shared across machines or with your team, unlike a committed CLAUDE.md

## How It Loads

The first **200 lines or 25KB** of `MEMORY.md`, whichever comes first, load at the start of every conversation. Topic files like `debugging.md` are not loaded upfront. Claude reads them on demand when it needs them.

Because only the top of `MEMORY.md` loads automatically, Claude Code nudges Claude to keep the index lean: one line per entry, detail pushed into topic files, stale entries merged or dropped. This keeps the always-loaded portion small.

When you see **Saved 2 memories** or **Recalled 2 memories** in the interface, Claude is writing to or reading from this directory.

## Managing It with `/memory`

Run `/memory` to:

- List your CLAUDE.md, CLAUDE.local.md, and auto memory locations
- Toggle auto memory on or off
- Open the auto memory folder, or any file, in your editor

Everything is plain markdown you can read, edit, or delete at any time. To confirm what actually loaded into the current session, run [`/context`](^The command that shows what is in your context window right now, including a Memory files section. See the Context and Thinking section).

## Telling Claude What to Remember

You do not have to wait for Claude to decide. Just ask:

- "Remember that the API tests need a local Redis instance" saves to **auto memory**
- "Add this to CLAUDE.md" puts it in **CLAUDE.md** instead

Claude does not save something every session. It decides what is worth keeping based on whether the information would help in a future conversation.

## Turning It On or Off

Auto memory is **on by default**. To change that:

| Goal | How |
|---|---|
| Toggle it | Use the toggle in `/memory` (saves `autoMemoryEnabled` to your user settings) |
| Disable for one project | Set `"autoMemoryEnabled": false` in that project's settings |
| Disable everywhere | Set the `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` environment variable |
| Store it elsewhere | Set `autoMemoryDirectory` to an absolute path in your settings |

## Tips

- Skim `/memory` occasionally to see what Claude has learned. Delete anything stale or wrong so it stops loading
- Keep `MEMORY.md` an index, not a document. Detail belongs in topic files that load only when needed
- Auto memory records what Claude discovered. For rules you want enforced every time, write them in CLAUDE.md or a [hook](^Hooks run as shell commands at fixed points and apply regardless of what Claude decides. See the hooks section) instead

## Further Reading

- [Official docs: How Claude remembers your project](https://code.claude.com/docs/en/memory#auto-memory)
