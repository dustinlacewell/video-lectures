# Tools: setup and shared options

Headless QA tools for any video project that honors the engine contract (the skill's `engine/` folder). Each tool has its own doc beside its folder. They open the player in headless Chromium and talk to it only through the contract globals. No window opens.

## Install once

```
cd ~/.claude/skills/video-studio/tools
pnpm install
pnpm exec playwright install chromium   # skip if Playwright's Chromium is already in %LOCALAPPDATA%\ms-playwright
```

Run a tool from this folder with `pnpm <tool> <options>`, e.g. `pnpm clip-check --build <dir> --script <file> --out <dir>`. `pnpm test` runs the unit tests; `pnpm typecheck` checks types.

## What the tools read

| Need | Source |
| --- | --- |
| Beat timing | `window.__info()`: chapters, beats `[key, start, dur, id]`, total |
| A frame at T | `window.__seek(T)`, then the video canvas pixels |
| Beat words, speakers, cards, `dur` | `window.__script()` if the page has it, else `--script <module>` |
| Clip lengths | `durations.json` next to the page, else `--durations <file>` |

`__info()` carries no words. The tools need the script as data, so either:

- the page has `__script()` ([engine contract](../engine/contract.md) section 8); the tools use it when present, or
- you pass `--script <path>/script/index.ts`. The tools import it with tsx. It must export the chapter array as `SCRIPT` or `default`, and must import nothing that needs a browser. The reference repo has no `__script()` yet, so it needs `--script`.

Clip ids follow the contract rule: `<beatId>` for one speaker, `<beatId>.<speaker>` when several speak together; speaker k starts `k * stagger` in (default 0.15 s). The default speaker is `narrator`.

## Shared options

```
--url <url>          a running player page, or
--build <dir>        a built player folder; the tool serves it on a free port and stops it after
--out <dir>          where results go (required)
--script <file.ts>   the script module, when the page has no __script()
--durations <file>   durations.json on disk
--canvas <selector>  the video canvas (default: the largest canvas on the page)
--chapter <id>       only this chapter; repeat for more
```

Build without touching the project's tracked files: `pnpm vite build --outDir <scratch>/build` from the project, then `--build <scratch>/build`. Web fonts load from the network; offline runs fall back to system fonts and text measures differ.

## Layout

`shared/` holds the contract shapes, the beat join (pure), and the browser session, server and file I/O (shell). Each tool folder holds `cli.ts` (the shell: open, capture, write) and pure modules for the logic. `test/` unit-tests every pure module with a small fixture video.
