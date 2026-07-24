# /model

Selects or switches the model Claude Code uses. You can pick by a convenient alias instead of remembering exact version numbers.

## Usage

```
/model             Open the model picker
/model <alias>     Switch immediately, e.g. /model opus
```

Running `/model` with no argument opens a picker. It asks for confirmation when the conversation already has output, since switching re-reads the full history without cached context.

## Model Aliases

| Alias | Resolves to |
|---|---|
| `default` | Clears any override, back to the recommended model for your account |
| `best` | Fable 5 where available, otherwise the latest Opus |
| `opus` | The latest Opus, for complex reasoning |
| `sonnet` | The latest Sonnet, for daily coding |
| `haiku` | The fast, efficient Haiku, for simple tasks |
| `opusplan` | Opus during plan mode, then Sonnet for execution |
| `sonnet[1m]`, `opus[1m]` | The 1 million token context window, for long sessions |

`opusplan` is the one to know: it pairs Opus's reasoning for planning with Sonnet's efficiency for the actual code changes, switching automatically when you leave plan mode.

## Model vs Effort

The model decides *which* Claude answers. [Effort](^How hard the model thinks, from low to max. See Extended Thinking) decides *how hard* it thinks. In the `/model` picker, use the left and right arrow keys to adjust the effort slider while choosing a model.

## Tips

- `opusplan` is a strong default: deep thinking while planning, fast execution while editing
- Match the model to the task. Use `haiku` or `sonnet` for routine work, `opus` or `best` for genuinely hard problems
- Switching mid-conversation re-reads history uncached, which costs a slower turn. Pick early when you can

## Further Reading

- [Official docs: Model configuration](https://code.claude.com/docs/en/model-config)
