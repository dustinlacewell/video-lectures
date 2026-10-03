# Phase: delivery

Export the MP4, verify the file, build the web page, and hand the human
an upload package. The human uploads.

## Entry criteria

- Post gate passed: final cut approved and locked in the bible.
- At least 5 GB free on the output drive. Check before starting; the
  reference production's D: drive filled up.

## Steps

1. **Export.** The [editor](../roles/editor.md) runs `wm export` as
   described in [export](../engine/export.md): step every frame headless
   with `__seek`, render the audio offline, mux with ffmpeg. It writes
   the MP4, `out/chapters.txt` (generated from the timeline, not typed),
   `out/captions.srt` and `.vtt` (from the script), and `out/export.json`.
2. **Verify the file.** [QA](../roles/qa.md) reads the verification
   results in `out/export.json` (duration, spot frames, audio sync,
   loudness, determinism; thresholds in [export](../engine/export.md)).
   Any failure blocks the gate. QA reports pass or the failing check, in
   one line each.
3. **Build the page.** The editor runs the production build of the
   player. The page and the MP4 come from the same commit.
4. **Upload package.** The editor adds, in `out/`:
   - Title options (two) and a description that includes `chapters.txt`.
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

One decision per message: two choices and a recommendation. Keep each
message tiny. Lean and full use the same gate. Export task mode runs
this phase alone.

1. "Play the MP4 at <path> in your normal media player. Is it good to
   ship? I recommend yes; QA found <nothing | these items>."
2. "Title: A '<...>' or B '<...>'? I recommend A, because <reason>."
3. "Thumbnail: A (<path>) or B (<path>)? I recommend <...>."
4. "Upload unlisted first, or public? I recommend unlisted first, so you
   can check it on the site."

On rejection: a file defect goes back to QA and the editor; a content
defect is a post-phase note. Re-export only after the fix is verified.

## Exit criteria

- MP4, captions, chapters, description, and thumbnail are in `out/`.
  `out/export.json` shows every verification passed.
- The page is built from the same commit.
- The checklist is handed to the human.
- Bible "Locks": delivered at <commit>, <date>.

## Common failures

- **Export left to the end.** In the reference production the MP4
  export was still not built when the video was otherwise done. Build
  and test it on the animatic, not after the final cut.
- **Hand-typed chapter times.** They drift from the cut. Generate them
  from `__info()`.
- **License.** The TTS model is non-commercial. Monetizing reopens bible
  B22 before upload, not after.
- **Disk.** Export needs room for the MP4s and the audio mix. Check first.
