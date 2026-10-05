// types/index.d.ts: The mod's type contract
//
// Declares every $.state key this mod reads or writes, so editors
// can type-check $.state.get / $.state.set calls and
// `claude plugin validate` can confirm the mod uses what it declares.
//
// plugin.json points here with: "types": "./types/index.d.ts"
//
// Claude Code also generates its own API types into
// .claude-plugin/types/. Don't edit those; edit this file.

declare module "claude-code" {
  interface PluginState {
    "my-mod": {
      // Commands the tool.call hook refused to run, oldest first.
      held: { command: string; reason: string }[];
    };
  }
}

export {};
