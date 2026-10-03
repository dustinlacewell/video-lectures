/* export: render the video to an MP4 with its own voice, music and sound effects, plus chapters and captions. */

import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { callerPath, EXIT, parseCli, UsageError, type Common } from '../shared/args.ts';
import { chaptersOf, timedBeats, type Beat } from '../shared/beats.ts';
import type { ClipLengths, ScriptChapter } from '../shared/contract.ts';
import { writeOut } from '../shared/output.ts';
import type { Session } from '../shared/session.ts';
import { loadClipLengths, loadScript } from '../shared/sources.ts';
import { captionCues, srt, vtt } from './captions.ts';
import { captureFrames, closeAll, openPages } from './capture.ts';
import { youtubeChapters } from './chapters.ts';
import { decodeMono, ebur128, encoder, framePsnr, measureLoudness, muxNormalized, probe, videoArgs } from './ffmpeg.ts';
import { framePlan, frameTime, spotFrames, type FramePlan } from './plan.ts';
import { renderSynth } from './synth.ts';
import { duckWindows, mixAt, placements, sampleAt, type Placement } from './voice.ts';
import { floatWav } from './wav.ts';

const USAGE = `export: render the video to <out>/<name>.mp4 (H.264 + AAC, -14 LUFS), chapters.txt, captions.srt/.vtt, export.json.
  --fps <n>            frames per second (default 30)
  --width <px>         canvas width, at most the player's cap of 1920 (default 1920)
  --from <s> --to <s>  render only this slice (for quick checks)
  --no-music           voice only: skip the offline music and sound effect render
  --workers <n>        parallel browser pages drawing frames (default 4)
  --crf <n>            x264 quality (default 18); --preset <name> x264 preset (default medium)
  --name <name>        output file name (default: the project folder of --script)
  --cast <file.ts>     module exporting CAST (speaker names for captions; default: cast.ts next to --script)
  --reuse-video        keep the frames already rendered in <out>/work and redo only the audio and mux`;

const RATE = 48000;
const SEED = 1;
const SYNTH_TICK = 0.001;

const { common, own } = parseCli(USAGE, {
  fps: { type: 'string' }, width: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' },
  'no-music': { type: 'boolean' }, workers: { type: 'string' }, crf: { type: 'string' }, preset: { type: 'string' },
  name: { type: 'string' }, cast: { type: 'string' }, 'reuse-video': { type: 'boolean' }
});

const opts = {
  fps: Number(own.fps ?? 30), width: Number(own.width ?? 1920), workers: Math.max(1, Number(own.workers ?? 4)),
  from: own.from === undefined ? undefined : Number(own.from), to: own.to === undefined ? undefined : Number(own.to),
  music: !own['no-music'], crf: Number(own.crf ?? 18), preset: String(own.preset ?? 'medium'),
  name: (own.name as string | undefined) ?? (common.script ? basename(dirname(dirname(common.script))) : 'video'),
  cast: callerPath(own.cast as string | undefined) ?? (common.script ? join(dirname(common.script), 'cast.ts') : undefined),
  reuseVideo: !!own['reuse-video']
};

let pages: Session[] = [];
try {
  pages = await openPages(common, opts.width, opts.workers);
  await exportVideo(pages, common);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = e instanceof UsageError ? EXIT.USAGE : EXIT.RUN_FAILED;
} finally {
  await closeAll(pages);
}

async function exportVideo(pages: Session[], common: Common): Promise<void> {
  const page = pages[0], t0 = Date.now();
  const info = await page.page.evaluate(function () { return (window as any).__info(); }) as Session['info'] & { cues: { t: number; type: string; arg?: number }[] };
  const script = await loadScript(page, common), lengths = await loadClipLengths(page, common);
  const beats = timedBeats(info, script), ps = placements(beats, lengths);
  const plan = framePlan(info.total, opts.fps, opts.from, opts.to);
  const slice = opts.from !== undefined || opts.to !== undefined;
  const stem = opts.name + (slice ? '.' + plan.start.toFixed(1) + '-' + (plan.start + plan.dur).toFixed(1) : '');
  const work = join(common.out, 'work');
  mkdirSync(work, { recursive: true });
  console.log(opts.name + ': ' + info.total.toFixed(3) + ' s, ' + plan.count + ' frames at ' + opts.fps + ' fps, ' + pages[0].canvas.width + 'x' + pages[0].canvas.height +
    (slice ? ', slice ' + plan.start.toFixed(2) + '-' + (plan.start + plan.dur).toFixed(2) + ' s' : '') + ', ' + ps.length + ' voice clips');

  await writeSideFiles(common.out, info, script, beats, ps, lengths);

  const t1 = Date.now();
  const audio = await buildAudio(pages[0], info.cues, ps, lengths, plan);
  const mixPath = writeOut(work, stem + '.mix.wav', floatWav(audio.channels, RATE));
  const audioSecs = (Date.now() - t1) / 1000;
  console.log('audio: ' + (audio.music ? 'voice + music + sfx' : 'voice only') + ' in ' + audioSecs.toFixed(1) + ' s' + (audio.warning ? ' (' + audio.warning + ')' : ''));

  const videoPath = join(work, stem + '.video.mp4'), t2 = Date.now();
  if (!(opts.reuseVideo && existsSync(videoPath))) await renderVideo(pages, plan, videoPath);
  const videoSecs = (Date.now() - t2) / 1000;

  const loud = await measureLoudness(mixPath), mp4 = join(common.out, stem + '.mp4');
  await muxNormalized(videoPath, mixPath, loud, mp4);
  const report = await verify(pages[0], mp4, plan, info.total, beats, work);
  writeOut(common.out, 'export.json', JSON.stringify({
    file: mp4, settings: { ...opts, cast: undefined }, frames: plan.count, firstFrame: plan.first, total: info.total,
    music: audio.music, musicWarning: audio.warning, measuredBefore: loud, seconds: { audio: audioSecs, video: videoSecs, all: (Date.now() - t0) / 1000 },
    framesPerSecond: videoSecs ? plan.count / videoSecs : null, verify: report,
    voice: inSlice(ps, lengths, plan).map(function (p) { return { clip: p.clip, t: Number(p.t.toFixed(4)), len: lengths[p.clip] }; })
  }, null, 2) + '\n');
  console.log('wrote ' + mp4 + '\n' + JSON.stringify(report));
}

/** chapters.txt, captions.srt, captions.vtt for the whole video. */
async function writeSideFiles(out: string, info: Session['info'], script: ScriptChapter[], beats: Beat[], ps: Placement[], lengths: ClipLengths): Promise<void> {
  const shorts = new Map(script.map(function (c) { return [c.id, c.title ?? c.short ?? c.id]; }));
  const ch = youtubeChapters(chaptersOf(info, script).map(function (c) { return { start: c.start, title: shorts.get(c.id)! }; }), info.total);
  writeOut(out, 'chapters.txt', ch.lines.join('\n') + '\n');
  if (ch.merged.length) console.log('chapters under 10 s merged into the next: ' + ch.merged.join(', '));
  const cues = captionCues(beats, ps, lengths, await castNames(opts.cast));
  writeOut(out, 'captions.srt', srt(cues));
  writeOut(out, 'captions.vtt', vtt(cues));
}

/** Speaker id -> display name from the cast module, if any. Empty when there is none. */
async function castNames(path: string | undefined): Promise<Record<string, string>> {
  if (!path || !existsSync(path)) return {};
  const mod = await import(pathToFileURL(path).href) as Record<string, unknown>;
  const cast = (mod.CAST ?? mod.default ?? {}) as Record<string, { name?: string }>;
  return Object.fromEntries(Object.entries(cast).map(function ([id, m]) { return [id, m.name ?? id]; }));
}

interface Audio { channels: Float32Array[]; music: boolean; warning?: string }

/** Voice clips at their placement, plus the page's music and sfx rendered offline, cut to the slice. */
async function buildAudio(page: Session, cues: { t: number; type: string; arg?: number }[], ps: Placement[], lengths: ClipLengths, plan: FramePlan): Promise<Audio> {
  const n = Math.round(plan.dur * RATE), channels = [new Float32Array(n), new Float32Array(n)];
  let music = false, warning: string | undefined;
  if (opts.music) {
    try {
      const synth = await renderSynth(page.page, { rate: RATE, end: plan.start + plan.dur, cues: cues, duck: duckWindows(ps, lengths), tick: SYNTH_TICK, seed: SEED });
      const at = sampleAt(plan.start, 0, RATE);
      channels.forEach(function (c, k) { c.set(synth[k].subarray(at, at + n)); });
      music = true;
    } catch (e) {
      warning = 'music render failed, voice only: ' + (e instanceof Error ? e.message : String(e));
    }
  }
  for (const p of inSlice(ps, lengths, plan)) {
    const samples = await decodeMono(new URL(encodeURIComponent(p.clip) + '.wav', page.url).href, RATE);
    const at = sampleAt(p.t, plan.start, RATE);
    channels.forEach(function (c) { mixAt(c, samples, at); });
  }
  return { channels: channels, music: music, warning: warning };
}

/** Clips that sound inside the slice. */
function inSlice(ps: Placement[], lengths: ClipLengths, plan: FramePlan): Placement[] {
  return ps.filter(function (p) { return p.t < plan.start + plan.dur && p.t + lengths[p.clip] > plan.start; });
}

/** Frames from the pages straight into x264. Prints progress. */
async function renderVideo(pages: Session[], plan: FramePlan, path: string): Promise<void> {
  const enc = encoder(videoArgs(plan.fps, path, opts.crf, opts.preset));
  const times = Array.from({ length: plan.count }, function (_, i) { return frameTime(plan.first + i, plan.fps); });
  const t0 = Date.now();
  let shown = 0;
  await captureFrames(pages, times, async function (png, i) {
    await enc.write(png);
    const now = Date.now();
    if (now - shown > 2000 || i === times.length - 1) {
      shown = now;
      const fps = (i + 1) / ((now - t0) / 1000), eta = (times.length - i - 1) / fps;
      process.stdout.write('\rframe ' + (i + 1) + '/' + times.length + '  ' + fps.toFixed(1) + ' fps  eta ' + Math.round(eta) + ' s   ');
    }
  });
  await enc.end();
  process.stdout.write('\n');
}

/** Duration and frame count, loudness, and a few frames compared with the page. */
async function verify(page: Session, mp4: string, plan: FramePlan, total: number, beats: Beat[], work: string): Promise<Record<string, unknown>> {
  const p = await probe(mp4), loud = await ebur128(mp4);
  const spots = spotFrames(plan, beats.map(function (b) { return b.start + b.dur / 2; }));
  const psnr: { t: number; db: number }[] = [];
  for (const n of spots) {
    const png = writeOut(work, 'spot.png', Buffer.from((await page.frame(frameTime(n, plan.fps), 99999)).split(',')[1], 'base64'));
    psnr.push({ t: Number(frameTime(n, plan.fps).toFixed(3)), db: Number((await framePsnr(mp4, n - plan.first, png)).toFixed(2)) });
  }
  return {
    duration: p.duration, frames: p.frames, audioDuration: p.audio, size: [p.width, p.height],
    wholeMinusTotal: plan.first === 0 && plan.count === plan.whole ? Number((p.duration - total).toFixed(4)) : undefined,
    loudnessI: loud.I, truePeak: loud.TP, psnr: psnr
  };
}
