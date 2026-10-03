# Phase: delivery

Export the MP4, verify the file, build the web page, and hand the human
an upload package. The human uploads.

## Entry criteria

- Post gate passed: final cut approved and locked in the bible.
- The exporter exists and passed [export](../engine/export.md)'s §6
  verification on the animatic ([animation](animation.md) step 4).
- At least 5 GB free on the output drive. The reference production's D:
  drive filled up.

## Steps

One [editor](../roles/editor.md) run does steps 1, 3 and 4.

1. **Export.** Run `wm export` per [export](../engine/export.md). It
   writes the MP4, `out/chapters.txt` (from the timeline, not typed),
   `out/captions.srt` and `.vtt` (from the script), and `out/export.json`.
2. **Verify the file.** Read the verification results in
   `out/export.json`: duration, spot frames, audio sync, loudness,
   determinism. Any failure blocks the gate. Lean: the producer reads
   them. Full: [QA](../roles/qa.md) reports pass or the failing check,
   one line each.
3. **Build the page.** The production build of the player. The page and
   the MP4 come from the same commit.
4. **Upload package**, in `out/`:
   - Two title options, and a description that includes `chapters.txt`.
   - Two thumbnail candidates: frames at chosen times, or title art.
   - A license line: Breeze TTS 2 is non-commercial, so the channel stays
     unmonetized (bible B22).
   - The upload checklist below.

## Upload checklist

- [ ] MP4 plays in a normal media player, start to end.
- [ ] Title chosen.
- [ ] Description pasted, chapter timestamps included.
- [ ] Captions file attached.
- [ ] Thumbnail chosen.
- [ ] Monetization off (license).
- [ ] Visibility chosen.

## Gate: release

One decision per message: two choices and a recommendation. The export
task mode runs this phase alone.

1. "Play the MP4 at <path> in your normal media player. Good to ship? I
   recommend yes; the checks found <nothing | these items>."
2. "Title: A '<...>' or B '<...>'? I recommend A, because <reason>."
3. "Thumbnail: A (<path>) or B (<path>)? I recommend <...>."
4. "Upload unlisted first, or public? I recommend unlisted first, so you
   can check it on the site."

On rejection: a file defect goes back to the editor (and the engine
owner if the exporter is at fault); a content defect is a post-phase
note. Re-export only after the fix is verified.

## Exit criteria

- MP4, captions, chapters, description and thumbnail are in `out/`.
  `out/export.json` shows every verification passed.
- The page is built from the same commit.
- The checklist is handed to the human.
- Bible "Locks": delivered at <commit>, <date>.

## Common failures

- **Hand-typed chapter times.** They drift from the cut. Generate them
  from `__info()`.
- **License.** The TTS model is non-commercial. Monetizing reopens bible
  B22 before upload, not after.
- **Disk.** Export needs room for the MP4s and the audio mix. Check
  first.
