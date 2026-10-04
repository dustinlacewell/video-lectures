# Starting a new video project

A new video is a new folder, `videos/<slug>/`, in the monorepo `D:\code\ai\video-lectures`. It depends on the shared packages — `@studio/engine` (player, scene and audio runtime), `@studio/library` (characters, backgrounds, props) and `@studio/voice` (the voice pipeline) — instead of carrying a copy of their code. Only the video's own content is new: `video.ts`, `scenes/`, `script/`, `production/`, `voice/refs/` and `voice/clips/`, `video.json`, `poster.png`. Voices carry over only when the human asks for the same voices.

The monorepo also holds this skill (`studio/`) and the series site (`site/`). The site lists every folder under `videos/` that has a `video.json`, and serves each video at `https://lectures.ldlework.com/<slug>/`.

**When:** at the start of development, before the first document is written. Every production document lives in the video's `production/` folder from day one.

**Who:** the [engine owner](../roles/engine-owner.md). A Sonnet agent may do the copy steps (2–4 and 6) under its brief. If the human handed over a single-file prototype, follow [porting](porting.md) instead of steps 3–4: the port supplies the content.

**Not here:** the engine readiness gaps ([contract](contract.md) section 11). They need production files that do not exist yet. [Preproduction](../phases/preproduction.md) step 0 is their only home.

## 1. Name and disk

The human names the video. Ask one question. The slug is the folder name, the URL path, the `package.json` name and the workmark project name. All four MUST match.

The voice stack is shared: one 5 GB venv and 8.7 GB of model weights in `packages/voice/py`, installed once for the whole monorepo ([voice pipeline](voice-pipeline.md)). A new video needs none of that; it only adds clips, small per video. Export needs about 5 GB more per video. The D: drive filled up during the reference project. Check now:

```powershell
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n='FreeGB';e={[int]($_.Free/1GB)}}
```

Under 10 GB free: stop and ask the human.

## 2. Make the folder

```bash
mkdir D:/code/ai/video-lectures/videos/<slug>
```

There is no new repo. The root `.gitattributes` already pins LF line endings.

## 3. Copy what carries over

Copy from the reference video's tracked files (`git -C D:/code/ai/video-lectures ls-files videos/what-a-mind-is-made-of`), not from its working folder. The working folder holds gitignored weights, venvs and vendor code.

Nothing from `@studio/engine` or `@studio/library` is copied. The new video depends on them (step 6) and uses their exports: characters and backgrounds from `@studio/library`, the player and audio runtime from `@studio/engine`. Only these files carry over, as a starting point to edit, not as code the new video must keep:

| Copy | Notes |
|---|---|
| `scenes/types.ts`, `scenes/shared/speech.ts`, `scenes/shared/speechTiming.ts` | Shared scene services. Not `thoughtTag.ts` or `titleArt.ts`: they belong to the old video. |
| `script/types.ts` | Set `SpeakerId = 'narrator'`. Casting declares every other speaker at the start of preproduction. Keep `SfxName`; the sound engineer changes it. The storyboard test checks only sounds the script uses, so the inherited list needs no Sounds rows yet. |
| `test/text.test.ts`, `test/voiceCoverage.test.ts` | Generic. The other tests assert on the old script's chapters; rewrite them against a small fixture script. |
| `wm.ts` | The workmark project. The commands live once, at the repo root (`.wm/`), and take the video as their project argument. |
| `vite.config.ts`, `tsconfig.json`, `package.json`, `.gitignore` | Config. `vite.config.ts` is exactly `export default studioConfig(import.meta.dirname);` from `@studio/engine/vite`. `package.json` declares `@studio/engine` and `@studio/library` as dependencies. |

If the video needs its own symbols (an old video's `kit/animals.ts`-style primitives, not generic enough for `@studio/library`), those live under the new video's own `kit/` folder and are written fresh, not copied from the reference video.

The voice pipeline is never copied either. The video's `voice/` folder holds only its own data: `refs/` (reference clips and transcripts) and `clips/` (rendered output). The pipeline code itself is `@studio/voice`, used through the root `.wm/commands/voice/*` commands.

The player is served by `@studio/engine`'s Vite config at `/<slug>/`. Every runtime URL (clips, `durations.json`, anything fetched) MUST start with `import.meta.env.BASE_URL`, as the player does.

## 4. Clear, rename, stub

- `script/`: one stub chapter, `script/00-title.ts`, with one beat. `script/index.ts` lists it. The timeline needs at least one chapter. Its `root` and `scale` are copied from the reference's title chapter; the sound engineer owns them.
- `script/cast.ts`: only `narrator`.
- `scenes/00-title.ts`: a stub `Scene` with `bg`, `accent` and an empty `draw`. `scenes/index.ts` maps `title` to it.
- `production/`: an empty folder with a `.gitkeep`. Add `"production"` to `include` in `tsconfig.json`, so `wm build <slug>` type-checks the storyboard files.
- `voice/refs/`: see section 5.
- `voice/clips/`, `voice/samples/`, `voice/manifest.json`: never copy. They are made fresh.
- `package.json`: set `"name"` to the slug.
- `wm.ts`: `defineProject({ name: "<slug>", has: { video: true } })`.
- `video.json`: the site's record of the video. Set `runtime` from `__info().total` once clips exist.

  ```json
  { "slug": "<slug>", "title": "<Title>", "description": "<one sentence>", "runtime": 0, "poster": "poster.png", "published": "YYYY-MM-DD" }
  ```

- `poster.png`: a 1280x720 frame of the video, usually the title card. Capture it headlessly: build, then `__seek(t)` and copy the canvas. Shrink it with `ffmpeg -i in.png -vf "split[a][b];[a]palettegen[p];[b][p]paletteuse" poster.png`; the reference poster is about 0.5 MB. Until the title card exists, use a placeholder; the site build fails without a poster.

The `.gitignore` to keep:

```
node_modules/
dist/
out/
.venv/
__pycache__/
*.wav
!voice/refs/*.wav
!voice/clips/*.wav
*.mp4
voice/models/
voice/vendor/
.claude/worktrees/
.scratch/
```

`.scratch/` holds each loop's evidence and reports ([maker-critic](../loops/maker-critic.md), "Scratch and resume").

Reference clips and rendered clips are both tracked: the Pages workflow builds the player from them. `voice/clips/durations.json` sets the timing.

## 5. Reuse from an earlier production

### "Same style as X"

Copy X's tracked `production/style-guide/*`: the writing guide, the terminology table and the visual vocabulary (with its Sounds table). Copy X's `voice/refs/**` too, by the voice rule below.

If X has no tracked `production/style-guide/`, there is nothing to copy. Tell the human in one line. The reference video (`D:\code\ai\video-lectures\videos\what-a-mind-is-made-of`) tracks one.

### Voice references: reuse or fresh

The human says which. [Casting](../roles/casting.md) owns `voice/refs/**` and `script/cast.ts` in both cases.

- **Same voices as an earlier production.** For each reused speaker, casting copies that project's `voice/refs/<speaker>.wav` and `voice/refs/<speaker>.txt` byte for byte and checks that the sha256 of each copy equals its source. The copy may take a new speaker id (`friend.wav` → `host.wav`); the hash is on the content. It copies the speaker's cast entry (`style`, `pad`), adds the speaker id to `SpeakerId`, and records the hashes and each clip's length in the bible's Locks. The voices are not auditioned again. The hash check is the whole check: no voice stack, no Whisper, no length rule ([voice pipeline](voice-pipeline.md) section 1). So it can run at folder creation.
- **New voices.** Leave `voice/refs/` empty. Casting makes each reference fresh ([voice pipeline](voice-pipeline.md) section 1).

A production can mix the two: reused speakers copied, new speakers cast.

## 6. Install

From the repo root:

```bash
pnpm install
```

The new folder joins the pnpm workspace by itself (`videos/*`). Workmark and `zod` are root dev dependencies; do not add them to the video.

The voice stack is not installed here. The sound engineer installs it before casting needs it ([voice pipeline](voice-pipeline.md), "Install").

## 7. Verify

From the repo root:

```bash
wm --help            # the new slug appears in each command's project list
wm test <slug>
wm build <slug>
wm site:build        # every video plus the index into dist/
```

All four MUST succeed before the first commit of copied code. Report the real output. Then commit, staging by path.

`wm voice:manifest <slug>` throws until every speaker has a reference clip and transcript. Run it after casting, not here.

The human opens `wm dev <slug>` and checks the stub page loads. Agents do not drive the window.

## Worktrees on Windows

Parallel agents each work in a git worktree under `.claude/worktrees/`. Known friction:

- **Locked while the agent lives.** A worktree cannot be removed while the agent process that made it is still running. Wait for the agent to finish. Then `git worktree remove <path>` and `git worktree prune`.
- **Servers hold folders.** A Vite dev or preview server started in a worktree holds its folder open. Stop it before removing the worktree. Find it:
  ```powershell
  Get-CimInstance Win32_Process -Filter "name='node.exe'" | Select-Object ProcessId, CommandLine
  ```
  Agents SHOULD NOT start background servers in worktrees. Headless tools start and stop their own.
- **No voice stack in a worktree.** `voice/.venv`, `voice/models` and `voice/vendor` are gitignored. Render voice only in the main checkout. Clips are tracked, so a worktree plays sound.
- **Merge order.** Merge the kit owner's worktree first, then the chapter worktrees. Disjoint ownership ([contract](contract.md) section 10) keeps merges clean.
- **Clean up after each round.** `git worktree list` MUST show only the main checkout before the next round starts.
