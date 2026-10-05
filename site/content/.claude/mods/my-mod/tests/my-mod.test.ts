// tests/my-mod.test.ts
//
// Mods ship with a test harness. Each test gets a fake session ($)
// and an `on` you can use to stub what Claude Code would return.
// No real terminal, no real shell.
//
// Run every test in tests/ with:
//   claude plugin test ./my-mod

import { describe, expect, test } from "claude-code/testing";

describe("my-mod", () => {
  test("band stays hidden until something is held", async ($) => {
    await $.session.start({ surface: "terminal", cwd: "/work" });

    // Mount the component the way Claude Code would draw it.
    const ui = await $.ui.mount({
      plugin: "my-mod",
      component: "AbovePrompt",
      props: { hasSurvey: false, bodyColumns: 120 },
    });

    expect(await ui.find({ type: "Text", text: /my-mod held/ })).toBeUndefined();
  });

  test("band shows the count once a command is held", async ($) => {
    await $.session.start({ surface: "terminal", cwd: "/work" });

    // Seed state as if the tool.call hook had already denied one.
    await $.state.set({ plugin: "my-mod", key: "held" }, [
      { command: "rm -rf build", reason: "'rm -rf' deletes without asking" },
    ]);

    const ui = await $.ui.mount({
      plugin: "my-mod",
      component: "AbovePrompt",
      props: { hasSurvey: false, bodyColumns: 120 },
    });

    expect(await ui.find({ type: "Text", text: /held 1 command/ })).toBeDefined();
  });
});
