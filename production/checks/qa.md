# Project checks: QA

Pasted verbatim into every QA brief. Measurable items only.

1. **Empty hold.** clip-check lists a non-card beat under "Script dur wins", and the beat's last sfx or cue in script/NN-*.ts fires before clip length + pad. The extra time then has no event in it. Evidence: the clips.md line, the beat's last sfx time, clip + pad. Threshold until the bible sets pacing targets: clip-check default `--dead-air 2`. (R3-26)
