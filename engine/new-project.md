# Starting a new video project

A new video starts as a copy of the reference repo, `D:\code\ai\cognition`, with its content removed. The engine, player, voice pipeline and commands carry over. The script and scenes do not. Voices carry over only when the human asks for the same voices.

**When:** at the start of development, before the first document is written. Every production document lives in the repo's `production/` folder from day one.

**Who:** the [engine owner](../roles/engine-owner.md). A Sonnet agent may do the copy steps (2–4 and 6) under its brief. If the human handed over a single-file prototype, follow [porting](porting.md) instead of steps 3–4: the port supplies the content.

**Not here:** the engine readiness gaps ([contract](contract.md) section 11). They need production files that do not exist yet. [Preproduction](../phases/preproduction.md) step 0 is their only home.

## 1. Name, place, disk

The human names the project and its folder. Ask one question; default `D:\code\<area>\<project-slug>`.

The voice stack needs about 15 GB later: a 5 GB venv and 8.7 GB of model weights ([voice pipeline](voice-pipeline.md)). Export needs about 5 GB more. The D: drive filled up during the reference project. Check now:

```powershell
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n='FreeGB';e={[int]($_.Free/1GB)}}
```

Under 25 GB free on the chosen drive: stop and ask the human where to put the project.

## 2. Make the repo, line endings first

```bash
mkdir D:/code/<area>/<project> && cd D:/code/<area>/<project>
git init
printf '* text=auto eol=lf\n' > .gitattributes
git add .gitattributes && git commit -m "Pin line endings to LF"
```

`.gitattributes` MUST be the first commit. Files added before it can land with CRLF, and a later pin rewrites every line in the diff.

## 3. Copy what carries over

Copy from the reference repo's tracked files (`git -C D:/code/ai/cognition ls-files`), not from its working folder. The working folder holds gitignored weights, venvs and clips.

| Copy | Notes |
|---|---|
| `engine/**` | All of it. `palette.ts` is the old look; the art-director specs a new one and the engine owner applies it. |
| `player/**` | All of it. Change the page title in `player/index.html`. |
| `kit/bean.ts`, `kit/hand.ts`, `kit/spark.ts`, `kit/scenery.ts` | Generic primitives. Copy `animals.ts`, `aibot.ts`, `spirits.ts`, `icons.ts` only if the visual vocabulary uses them: they carry the old video's symbols. |
| `scenes/types.ts`, `scenes/shared/speech.ts`, `scenes/shared/speechTiming.ts` | Shared scene services. Not `thoughtTag.ts` or `titleArt.ts`: they belong to the old video. |
| `script/types.ts` | Set `SpeakerId = 'narrator'`. Casting declares every other speaker at the start of preproduction. Keep `SfxName`; the sound engineer changes it. The storyboard test checks only sounds the script uses, so the inherited list needs no Sounds rows yet. |
| `voice/breeze.py`, `render.py`, `verify.py`, `transcribe.py`, `speak.py`, `manifest.ts`, `refs.ts`, `pyproject.toml`, `uv.lock` | The voice pipeline. |
| `test/text.test.ts`, `test/voiceCoverage.test.ts` | Generic. The other tests assert on the old script's chapters; rewrite them against a small fixture script. |
| `.wm/traits/video.ts`, `.wm/commands/**`, `wm.ts` | Workmark commands. |
| `vite.config.ts`, `tsconfig.json`, `package.json`, `.gitignore` | Config. |

## 4. Clear, rename, stub

- `script/`: one stub chapter, `script/00-title.ts`, with one beat. `script/index.ts` lists it. The timeline needs at least one chapter. Its `root` and `scale` are copied from the reference's title chapter; the sound engineer owns them.
- `script/cast.ts`: only `narrator`.
- `scenes/00-title.ts`: a stub `Scene` with `bg`, `accent` and an empty `draw`. `scenes/index.ts` maps `title` to it.
- `production/`: an empty folder with a `.gitkeep`. Add `"production"` to `include` in `tsconfig.json`, so `wm build` type-checks the storyboard files.
- `voice/refs/`: see section 5.
- `voice/clips/`, `voice/samples/`, `voice/manifest.json`: never copy. They are made fresh.
- `package.json`: set `"name"`.
- `wm.ts`: `defineProject({ name: "<project>", has: { video: true } })`.
- `.wm/commands/**`: every command has `for: "cognition"`. Change it to the new name in all five files. This is the same edit in each file, so a scoped `sed -i` is fine; check with `git diff --stat` that each file changes by one line.

The `.gitignore` to keep:

```
node_modules/
dist/
out/
.venv/
__pycache__/
*.wav
!voice/refs/*.wav
*.mp4
voice/models/
voice/vendor/
.claude/worktrees/
.scratch/
```

`.scratch/` holds each loop's evidence and reports ([maker-critic](../loops/maker-critic.md), "Scratch and resume"). It is not in the reference repo's `.gitignore`; add it.

Reference clips are tracked. Rendered clips are not. `voice/clips/durations.json` is tracked, so a fresh checkout or a worktree has correct timing without audio.

## 5. Reuse from an earlier production

### "Same style as X"

Copy X's tracked `production/style-guide/*`: the writing guide, the terminology table and the visual vocabulary (with its Sounds table). Copy X's `voice/refs/**` too, by the voice rule below.

If X has no tracked `production/style-guide/`, there is nothing to copy. Tell the human in one line. The reference repo (`D:\code\ai\cognition`) tracks one.

### Voice references: reuse or fresh

The human says which. [Casting](../roles/casting.md) owns `voice/refs/**` and `script/cast.ts` in both cases.

- **Same voices as an earlier production.** For each reused speaker, casting copies that project's `voice/refs/<speaker>.wav` and `voice/refs/<speaker>.txt` byte for byte and checks that the sha256 of each copy equals its source. The copy may take a new speaker id (`friend.wav` → `host.wav`); the hash is on the content. It copies the speaker's cast entry (`style`, `pad`), adds the speaker id to `SpeakerId`, and records the hashes and each clip's length in the bible's Locks. The voices are not auditioned again. The hash check is the whole check: no voice stack, no Whisper, no length rule ([voice pipeline](voice-pipeline.md) section 1). So it can run at repo creation.
- **New voices.** Leave `voice/refs/` empty. Casting makes each reference fresh ([voice pipeline](voice-pipeline.md) section 1).

A production can mix the two: reused speakers copied, new speakers cast.

## 6. Install

```bash
pnpm install
pnpm add -D @ldlework/workmark zod
```

Add `zod` explicitly. Under pnpm it is otherwise only a transitive dependency. The `wm` CLI still works, but the VS Code extension's bundled CLI fails to load `.wm/traits/*.ts` with `Cannot find module 'zod'`. Plain `wm` passes either way, so check with the extension's own CLI:

```bash
node "<vscode extensions>/ldlework.workmark-vsc-<ver>/dist/wm/node_modules/@ldlework/workmark/dist/cli.js" --introspect
```

The voice stack is not installed here. The sound engineer installs it before casting needs it ([voice pipeline](voice-pipeline.md), "Install").

## 7. Verify

```bash
wm --help        # lists build, dev, test, voice:manifest, voice:render
wm test
wm build
```

All three MUST succeed before the first commit of copied code. Report the real output. Then commit, staging by path.

`wm voice:manifest` throws until every speaker has a reference clip and transcript. Run it after casting, not here.

The human opens `wm dev` and checks the stub page loads. Agents do not drive the window.

## Worktrees on Windows

Parallel agents each work in a git worktree under `.claude/worktrees/`. Known friction:

- **Locked while the agent lives.** A worktree cannot be removed while the agent process that made it is still running. Wait for the agent to finish. Then `git worktree remove <path>` and `git worktree prune`.
- **Servers hold folders.** A Vite dev or preview server started in a worktree holds its folder open. Stop it before removing the worktree. Find it:
  ```powershell
  Get-CimInstance Win32_Process -Filter "name='node.exe'" | Select-Object ProcessId, CommandLine
  ```
  Agents SHOULD NOT start background servers in worktrees. Headless tools start and stop their own.
- **No audio in a worktree.** Clips are gitignored. Timing is correct (`durations.json` is tracked), but nothing plays. Copy `voice/clips/*.wav` in if the agent needs sound.
- **No voice stack in a worktree.** `voice/.venv`, `voice/models` and `voice/vendor` are gitignored. Render voice only in the main checkout.
- **Merge order.** Merge the kit owner's worktree first, then the chapter worktrees. Disjoint ownership ([contract](contract.md) section 10) keeps merges clean.
- **Clean up after each round.** `git worktree list` MUST show only the main checkout before the next round starts.
