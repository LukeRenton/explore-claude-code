// hooks/my-mod.mjs
//
// A mod that does two things:
//   1. Holds risky Bash commands (rm -rf, force pushes) before they run
//   2. Shows a band above the prompt counting how many it has held
//
// Compare it with .claude/hooks/my-hook/my-hook.sh. Same guard, but
// this one remembers what it did and draws it on screen.
//
// Every hook has the same shape:
//   on(event, matcher?, async ($, e, next) => { ... })
//
//   $     the mods API (session, state, ui, process, fs, http, ...)
//   e     the event (here: the tool call, or the component drawing)
//   next  hands the event down the chain to Claude Code

const RISKY = [
  { pattern: /\brm\s+-rf\b/, reason: "'rm -rf' deletes without asking" },
  { pattern: /\bgit\s+push\b.*--force\b/, reason: "force-pushing rewrites shared history" },
];

// State lives in the host, not in this file. Module-level variables
// reset every time you save (hot reload). $.state survives.
const held = { plugin: "my-mod", key: "held" };

export function register(on) {
  // ── Answer: deny risky commands ─────────────────────────────────
  // The matcher means this hook only sees Bash calls.
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const command = String(e.command ?? "");
    const hit = RISKY.find((r) => r.pattern.test(command));

    // Not risky: pass it on untouched.
    if (!hit) return next(e);

    // Risky: record it, then answer without calling next().
    // Claude Code never runs the command, and Claude sees the reason.
    const { value: list = [] } = await $.state.get(held);
    await $.state.set(held, [...list, { command, reason: hit.reason }]);

    return { deny: `Held by my-mod: ${hit.reason}` };
  });

  // ── Draw: a band above the prompt ───────────────────────────────
  // Reading $.state here subscribes this render to it, so the band
  // redraws by itself whenever the tool.call hook adds an entry.
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    const { value: list = [] } = await $.state.get(held);

    // Step aside if there is nothing to show, or a survey owns the spot.
    if (list.length === 0 || e.props.hasSurvey) return next(e);

    const { Box, Text } = $.ui.resolve(e);
    const last = list[list.length - 1];

    return Box({
      paddingX: 1,
      children: [
        Text({ children: `my-mod held ${list.length} command(s). Last: ${last.reason}` }),
      ],
    });
  });

  // ── Observe vs. rewrite ─────────────────────────────────────────
  // The other two moves look like this:
  //
  //   Observe: let it through, then look at the result
  //     const result = await next(e);
  //     return result;
  //
  //   Rewrite: change what downstream hooks and Claude Code see
  //     return next({ ...e, command: saferVersion(e.command) });
}
