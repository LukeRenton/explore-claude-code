# /code-review

Reviews your current diff for correctness bugs and cleanup opportunities, then reports what it found. A local, terminal-based review that needs no GitHub App.

## Usage

```
/code-review [effort] [--fix] [--comment] [target]
```

By default it reviews your branch's commits ahead of upstream plus any uncommitted changes, so there needs to be work on the branch or in the working tree to review.

| Argument | Effect |
|---|---|
| `low` .. `max` | Effort level. Lower reports only high-confidence findings; higher casts a wider net |
| `ultra` | Escalate to a deep cloud review |
| `--fix` | Apply the findings to your working tree after the review |
| `--comment` | Post the findings as inline GitHub PR comments |
| `target` | What to review: a file path, PR number, branch name, or ref range like `main...my-feature` |

## How It Works

A fleet of subagents examine the diff in parallel, each looking for a different class of issue. A verification step then checks each candidate against the actual code to filter out false positives. Findings are deduplicated, ranked by severity, and returned to your conversation.

The review runs as a [background subagent](^A separate Claude instance with its own context window. Its findings arrive in your conversation when it finishes) so it does not fill your session.

## Effort Trades Coverage for Confidence

- `low` and `medium`: only the findings it is most confident in, so fewer false positives
- `high` through `max`: a wider net, including findings it is less sure about
- No effort argument: uses your session's current effort

## Escalating to the Cloud: `ultra`

`/code-review ultra` runs a deeper multi-agent review on Anthropic infrastructure. Its scope is your current branch against the repository's default branch, plus any uncommitted and staged changes. Pass a base branch, as in `/code-review ultra develop`, to compare against something else. This cloud review needs a claude.ai account and is not available on every provider.

## /code-review vs /simplify

`/code-review` hunts for correctness bugs, and also flags reuse, simplification, and efficiency cleanups. [`/simplify`](^The cleanup-only review: reuse, quality, and efficiency, with no bug hunting. See its entry) does the cleanups only. The command was named `/simplify` in older versions, so if you scripted the old bug-finding `/simplify`, switch to `/code-review --fix`.

## Tips

- It is manual only. Claude will not run it on its own, and it cannot be used as a scheduled task's prompt
- Background `--fix` edits are applied outside checkpoints, so `/rewind` will not undo them. Use git to revert
- It follows your CLAUDE.md, so your project conventions shape what it flags

## Further Reading

- [Official docs: Review a diff locally](https://code.claude.com/docs/en/code-review#review-a-diff-locally)
