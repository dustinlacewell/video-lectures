# video-lectures

Short animated video lectures, the tools that make them, and the site that shows them.

The site is live at https://lectures.ldlework.com. A push to `main` builds and deploys it through GitHub Pages.

## Layout

- `videos/<slug>/` — one video per folder: script, scenes, engine, player, voice pipeline and production documents. `video.json` and `poster.png` describe it to the site. The site serves it at `/<slug>/`.
- `studio/` — the `video-studio` Claude Code skill: how a video gets made, plus headless QA tools in `studio/tools/`. `~/.claude/skills/video-studio` is a junction to this folder.
- `site/` — the series index page. It reads every `videos/*/video.json` at build time.

## Commands

Run `pnpm install` once. Then, from anywhere in the repo:

- `wm dev <slug>` — run one video with live reload.
- `wm build <slug>` — type-check and build one video.
- `wm test <slug>` — run one video's tests.
- `wm voice:manifest <slug>` and `wm voice:render <slug>` — make the voice clips. Rendering needs the video's local voice stack (`voice/.venv`, `voice/models`, `voice/vendor`), which git does not track.
- `wm site:build` — build every video and the index into `dist/`.
- `wm site:dev` and `wm site:preview` — serve the index, or the built `dist/`.

`wm --help` lists them all.
