/* Pure: a video plus its measured voice -> its timeline. The voice sets each beat's length, actions may extend it,
   then the timeline lays the beats end to end. With no actions this is exactly the voice-only timeline. */

import { FADE_OUT, beatDuration, buildTimeline, keyOf, voiceDurations, type Durations, type Timeline } from '../timeline';
import type { ChapterScript } from '../script';
import type { VideoData } from '../video';
import { resolveActions, type PlacedActions } from './actions';
import { syncedLength } from './beatLength';
import { NO_MEDIA, type VoiceMedia } from './words';

export function timelineOf(video: VideoData, media: VoiceMedia = NO_MEDIA): Timeline {
  const voiced = voiceDurations(video.script, media.lengths, video.cast);
  const placed = placeActions(video, media);
  return buildTimeline(video.script, { ...voiced, ...actionLengths(video.script, placed, voiced) }, video.cast, placed);
}

/** Every chapter's actions placed in their beats. Throws on an unknown chapter or beat, or a name used twice in a chapter. */
export function placeActions(video: VideoData, media: VoiceMedia): PlacedActions {
  const out: PlacedActions = {};
  Object.entries(video.actions ?? {}).forEach(function ([chId, chapter]) {
    const script = video.script.find(function (c) { return c.id === chId; });
    if (!script) throw new Error('actions for unknown chapter "' + chId + '"');
    const names: Record<string, string> = {};
    out[chId] = {};
    Object.entries(chapter).forEach(function ([key, actions]) {
      const b = script.beats.find(function (x) { return keyOf(chId, x.id) === key; });
      if (!b) throw new Error('chapter "' + chId + '": actions for unknown beat "' + key + '"');
      Object.keys(actions).forEach(function (name) {
        if (names[name]) throw new Error('chapter "' + chId + '": action "' + name + '" is in beats "' + names[name] + '" and "' + key + '"');
        names[name] = key;
      });
      out[chId][key] = resolveActions(b, actions, media);
    });
  });
  return out;
}

/** Lengths of the beats whose actions outlast their voice. The last beat of a chapter that fades out gets FADE_OUT more. */
function actionLengths(script: ChapterScript[], placed: PlacedActions, voiced: Durations): Durations {
  const out: Durations = {};
  script.forEach(function (ch, ci) {
    ch.beats.forEach(function (b, bi) {
      const acts = placed[ch.id]?.[keyOf(ch.id, b.id)];
      if (!acts) return;
      const tail = bi === ch.beats.length - 1 && ci < script.length - 1 ? FADE_OUT : 0;
      const base = beatDuration(b, voiced), len = syncedLength(base, acts, tail);
      if (len > base) out[b.id] = len;
    });
  });
  return out;
}
