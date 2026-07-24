# Bundled Skills

Bundled skills ship with Claude Code and are available in every session. Unlike [custom skills](^Skills you create in .claude/skills/ - see the skills section above) you build in `.claude/skills/`, bundled skills are **prompt-based playbooks** maintained by Anthropic. They give Claude a detailed set of instructions and let it orchestrate the work using its tools, spawning parallel agents, reading files, and adapting to your codebase.

You invoke bundled skills the same way as any other skill: type `/` followed by the skill name.

## Available Skills

| Skill | What It Does |
|---|---|
| `/simplify` | Spawns 3 review agents in parallel to check reuse, quality, and efficiency |
| `/batch <instruction>` | Decomposes large changes into independent units, executes each in a worktree |
| `/debug [description]` | Reads your session's debug log to troubleshoot issues |
| `/loop [interval] <prompt>` | Schedules a recurring cron task to re-run a prompt on an interval |
| `/claude-api` | Loads API and SDK reference material for your project's language |
| `/code-review` | Reviews your current diff for correctness bugs, with an `ultra` cloud escalation |
| `/security-review` | Checks your pending changes for security vulnerabilities |
| `/deep-research <question>` | Fans out web searches, cross-checks sources, and synthesises a cited report |
| `/dataviz [request]` | Design guidance for charts and dashboards, with colourblind-safe palettes |
| `/run` | Launches and drives your app so you can see a change working |

## How They Differ from Custom Skills

| | Custom Skills | Bundled Skills |
|---|---|---|
| Location | `.claude/skills/` in your project | Ships with Claude Code |
| Created by | You | Anthropic |
| Editable | Yes | No |
| Committed to git | Yes | N/A |
| Invocation | `/skill-name` or auto-loaded | `/skill-name` only |
| Can spawn agents | Via `context: fork` | Built-in parallelism |

## How They Work

Bundled skills are different from [built-in commands](^Commands like /help, /compact, /model, /cost that execute fixed logic directly. Bundled skills are prompt-based and can use tools) like `/help` or `/compact`. Built-in commands execute fixed logic directly. Bundled skills are **prompt-driven**: Claude receives a detailed playbook and orchestrates the work using its tools. This means they can:

- Spawn parallel [subagents](^Isolated Claude instances that work on a focused task and report back. See the agents section for details) for concurrent work
- Read and analyse your codebase to adapt their behaviour
- Run commands, create files, and make commits
- Chain other skills and tools together

## Passing Arguments

Most bundled skills accept arguments after the skill name:

```
/simplify focus on memory efficiency
/batch migrate all components from class to functional
/debug why did the MCP server disconnect
/loop 5m check if CI passed
```

## Explore Each Skill

Open the folders below to see how each bundled skill works in detail.
