# /run

Launches and drives your project's app so you can see a change actually working, not just passing tests.

## Usage

```
/run
```

Ask it to run, start, or screenshot the app, or to confirm a change works in the real thing.

## How It Works

`/run` first looks for a [project skill](^A skill in .claude/skills/ that already knows how to launch this app. See the skills section) that already knows how to launch your app. If none exists, it falls back to built-in patterns for your project type:

| Project type | What it does |
|---|---|
| CLI | Runs the command and captures output |
| Server | Starts the server and exercises an endpoint |
| TUI | Launches and drives the terminal UI |
| Electron or desktop | Starts the app |
| Browser-driven | Opens and interacts with the page |
| Library | Runs an example or a smoke test |

## When to Use It

- Confirming a change works in the running app, beyond what the test suite covers
- Reproducing a bug in the real thing before fixing it
- Getting a screenshot of the current state of the UI

## Tips

- If your app has a nonstandard launch, teach `/run` once with a project skill and it reuses it
- Pair it with tests, do not replace them. `/run` verifies the real experience; tests verify the logic
- It is a fast way to close the loop: make a change, then watch it actually run

## Further Reading

- [Official docs: Bundled skills](https://code.claude.com/docs/en/skills#bundled-skills)
