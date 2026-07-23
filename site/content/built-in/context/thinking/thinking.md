# Extended Thinking

Extended thinking is on by default in Claude Code: before answering, Claude can reason through a problem privately. You control **how hard** it thinks with effort levels, and you can dial it up for a single tricky turn.

## Effort Levels

Effort controls [adaptive reasoning](^The model decides whether and how much to think on each step, based on the task's complexity). Lower effort is faster and cheaper; higher effort reasons more deeply.

| Level | Character |
|---|---|
| `low` | Fastest and cheapest, for straightforward tasks |
| `medium` | A middle ground |
| `high` | Balances tokens and intelligence. The default on most models |
| `xhigh` | Deeper reasoning at higher token spend |
| `max` | Maximum depth for demanding tasks. Can overthink, so test before adopting broadly |

Which levels a model supports, and its default, vary by model:

| Model | Effort levels | Default |
|---|---|---|
| Fable 5, Sonnet 5, Opus 4.8, Opus 4.7 | `low`, `medium`, `high`, `xhigh`, `max` | `high`, or `xhigh` on Opus 4.7 |
| Opus 4.6, Sonnet 4.6 | `low`, `medium`, `high`, `max` | `high` |

If you set a level a model does not support, Claude Code falls back to the highest supported level at or below it. The scale is calibrated per model, so the same name is not the same underlying budget across models.

## Setting Effort

| How | What it does |
|---|---|
| `/effort` | Open a slider, set a level directly with `/effort high`, or reset to the model default with `/effort auto` |
| Inside `/model` | Use the left and right arrow keys to adjust the effort slider |
| At launch | `claude --effort xhigh` |
| Environment | Set `CLAUDE_CODE_EFFORT_LEVEL` to a level name |

## `ultrathink`: One-off Deep Reasoning

Include the word **`ultrathink`** anywhere in a prompt to request deeper reasoning on that turn only, without changing your session effort. Claude Code recognises the keyword and adds an in-context instruction.

Only `ultrathink` is a recognised keyword. Phrases like "think", "think hard", and "think more" are passed through as ordinary prompt text.

## `ultracode`: Thinking Plus Orchestration

`ultracode` is a Claude Code setting rather than a model effort level. It sends `xhigh` to the model and additionally has Claude orchestrate [dynamic workflows](^Script-driven fan-out across many subagents for substantial tasks) for substantive tasks. It applies to the current session only, via `/effort ultracode` or `claude --effort ultracode`.

## Seeing Claude Think

Press `Ctrl+O` to open the transcript viewer, which shows the full session including Claude's reasoning. Higher effort means more of this thinking happens before each answer.

## Tips

- `high` is the right default for most work. Raise to `xhigh` or `max` only for genuinely hard problems, since higher effort costs more tokens and time
- `ultrathink` is the surgical option: one hard turn without paying for deep reasoning on every message
- Match effort to the task. Simple edits run fine, and faster, on `low` or `medium`

## Further Reading

- [Official docs: Adjust effort level](https://code.claude.com/docs/en/model-config#adjust-effort-level)
