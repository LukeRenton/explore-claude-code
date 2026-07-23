# The Context Window

Everything Claude knows during a session lives in one **context window**: your instructions, the files it reads, its own responses, and a lot of content that never shows in your terminal. The window is finite, so managing what fills it is part of using Claude Code well.

## What Loads Before You Type

Even before your first prompt, the window is partly full. Startup content includes:

| Loaded at startup | What it is |
|---|---|
| System prompt | Core instructions for behaviour and tool use. You never see it |
| [Auto memory](^The first 200 lines or 25KB of MEMORY.md. See the Auto Memory section) | Claude's notes to itself from past sessions |
| Environment info | Working directory, platform, git status |
| MCP tools | Tool names, with full schemas loaded on demand |
| Skill descriptions | One line per skill so Claude knows what it can invoke |
| CLAUDE.md files | Your user and project instructions |

Then comes your prompt and, as Claude works, the files it reads. **File reads dominate context usage:** a single source file can cost more than all the startup content combined.

## Seeing What Is Loaded: `/context`

Run `/context` to visualise the current window as a coloured grid, broken down by category: system prompt, memory files, tools, MCP, and messages. It is the fastest way to answer "why is my context full?" and to confirm a CLAUDE.md file or rule actually loaded, by checking the **Memory files** list.

## Reclaiming Space

| Command | What it does |
|---|---|
| `/compact` | Replaces the conversation with a structured summary, freeing space while keeping the thread going |
| `/clear` | Starts fresh, dropping the conversation but keeping CLAUDE.md loaded |

Use `/clear` between unrelated tasks. Use `/compact` when a single task has grown long but you still need its history.

## What Survives `/compact`

Compaction summarises the conversation, but most **startup content reloads automatically** afterwards, because it lives outside the message history:

- **Project-root CLAUDE.md** is re-read from disk and re-injected
- **Path-scoped rules and nested CLAUDE.md files** are summarised away, and reload the next time Claude reads a matching file
- **Skill descriptions** are not re-injected. Only skills you actually invoked are preserved

This is why an instruction typed only in chat can vanish after `/compact`, while the same instruction written in CLAUDE.md persists.

## Keeping Reads Out of Your Context

For research-heavy work, a [subagent](^A separate Claude instance with its own context window that reports back a summary. See the agents section) reads the files in its own window and returns only a summary, so the large reads never enter yours. Being specific in prompts, for example "fix the bug in auth.ts," also keeps Claude from reading more files than it needs.

## Tips

- Run `/context` when things feel sluggish or Claude seems to forget. It shows exactly what is consuming the window
- Reach for `/clear` more often than you think. A fresh window per task keeps Claude sharp
- Put durable instructions in CLAUDE.md, not chat. Chat-only instructions are the first thing lost to compaction

## Explore Further

Open the **Extended Thinking** entry below to control how hard Claude reasons within this window.

## Further Reading

- [Official docs: Explore the context window](https://code.claude.com/docs/en/context-window)
