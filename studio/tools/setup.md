# Tools: setup and shared options

Headless QA tools for any video project that honors the engine contract (the skill's `engine/` folder). Each tool has its own doc beside its folder. They open the player in headless Chromium and talk to it only through the contract globals. No window opens.

## Install once

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools install
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools exec playwright install chromium
```

Skip the second line if Playwright's Chromium is already in `%LOCALAPPDATA%\ms-playwright`.

## The one way to run a tool

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools <tool> (--url <url> | --build <dist>) [--script <path>] --out <dir> [options]
```

- `<tool>` is `contact-sheet`, `pacing-curve`, `frame-sweep` or `clip-check`.
- Run it from any folder. Relative paths count from the folder you run it in, not the tools folder.
- It works the same in PowerShell and Git Bash. Lists such as `--at 0.1,0.5,0.9` work quoted or not: PowerShell turns an unquoted list into spaces, and the tools read commas or spaces.
- pnpm first prints a `>` line with the command. The tool's own output follows.
- `pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools test` runs the unit tests. `... typecheck` checks types.

## Exit codes

Every tool:

- `0`: the run finished. Findings are in the report files; a finding does not change the exit code.
- `1`: the run failed: the page did not load, a global is missing, or a file could not be read or written.
- `2`: bad options: an unknown option, no `--url`/`--build`, no `--out`, no script source, or an unknown chapter.
- `3`: the tool's own pass/fail check failed. Only `contact-sheet --twice` has one.

## Build the player first

Build into a scratch folder, so the project's tracked files stay untouched. From the project folder:

```
pnpm vite build --outDir <scratch>\build
```

Then pass `--build <scratch>\build`. The tool serves it on a free local port and stops the server when it ends. `--url <url>` uses a page that is already running instead.

Web fonts load from the network. Offline runs fall back to system fonts, and text measures differ.

## The script: `__script()` or `--script`

`__info()` carries no words. The tools need the script as data. They take it from one of two places:

1. `window.__script()` on the page ([engine contract](../engine/contract.md) section 8). The tools use it when the page has it.
2. `--script <project>\script\index.ts`. The tools import it with tsx. It must export the chapter array as `SCRIPT` or `default`, and import nothing that needs a browser.

With neither, the tool stops with exit 2 and a message naming both. A project made before `__script()` existed (the cognition reference is one) needs `--script`.

## What the tools read

| Need | Source |
| --- | --- |
| Beat timing | `window.__info()`: chapters, beats `[key, start, dur, id]`, total |
| A frame at T | `window.__seek(T)`, then the video canvas pixels |
| Beat words, speakers, cards, `dur` | `window.__script()`, else `--script` |
| Clip lengths | `durations.json` next to the page, else `--durations <file>` |

Clip ids follow the contract rule: `<beatId>` for one speaker, `<beatId>.<speaker>` when several speak together; speaker k starts `k * stagger` in (default 0.15 s). The default speaker is `narrator`.

## Shared options

```
--url <url>          a running player page, or
--build <dist>       a built player folder; the tool serves it on a free port and stops it after
--out <dir>          where results go (required)
--script <path>      the script module, when the page has no __script()
--durations <file>   durations.json on disk
--canvas <selector>  the video canvas (default: the largest canvas on the page)
--chapter <id>       only this chapter; repeat for more
--help               the tool's options
```

## Layout

`shared/` holds the contract shapes, the beat join and the URL flags (pure), and the browser session, server, options and file I/O (shell). Each tool folder holds `cli.ts` (the shell: open, capture, write) and pure modules for the logic. `test/` unit-tests every pure module with a small fixture video.
