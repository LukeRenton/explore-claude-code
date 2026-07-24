# /deep-research

Runs a deep, multi-source research pass on a question: it fans out web searches, fetches and cross-checks sources, verifies claims, and synthesises a cited report.

## Usage

```
/deep-research <question>
```

The question is required. Because the research fans out across many subagents and can run for a while, a specific, well-scoped question produces a far better report than a vague one.

## How It Works

`/deep-research` is a bundled [dynamic workflow](^A script that orchestrates many subagents in parallel and runs in the background), not a single prompt. It:

1. Fans out web searches across subagents, each exploring a different angle
2. Fetches the promising sources and reads them
3. Cross-checks and adversarially verifies claims against those sources
4. Synthesises a single cited report

It runs in the background, so you can keep working while it researches.

## Getting a Good Report

If your question is underspecified, Claude asks a couple of clarifying questions first to narrow the scope. Help it by stating up front:

- What decision or outcome the research feeds
- Any constraints, such as budget, region, or time frame
- How deep you want it to go

## When to Use It

- A decision that hinges on current, multi-source facts you want fact-checked, not a single quick answer
- Comparing options where sources disagree and you want the disagreements surfaced
- Any research where citations matter because you will verify the claims yourself

## Tips

- Scope tightly. "Best car" is weak; "most reliable 7-seat EV under 60k available in my region in 2026" is strong
- It is manual. Invoke it deliberately, for questions that are worth the depth
- Expect citations. The value is a report you can check, not just an answer

## Further Reading

- [Official docs: Commands reference](https://code.claude.com/docs/en/commands)
