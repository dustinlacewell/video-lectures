/* Imperative shell: ffmpeg and ffprobe as child processes. */

import { spawn } from 'node:child_process';
import type { Writable } from 'node:stream';

export interface Run { code: number; stdout: Buffer; stderr: string }

/** Run a command to the end. Throws with the stderr tail on a non-zero exit. */
export function run(cmd: string, args: string[]): Promise<Run> {
  return new Promise(function (resolve, reject) {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const out: Buffer[] = [], err: Buffer[] = [];
    p.stdout.on('data', function (d: Buffer) { out.push(d); });
    p.stderr.on('data', function (d: Buffer) { err.push(d); });
    p.on('error', reject);
    p.on('close', function (code) {
      const r = { code: code ?? -1, stdout: Buffer.concat(out), stderr: Buffer.concat(err).toString() };
      if (r.code !== 0) reject(new Error(cmd + ' failed (' + r.code + '):\n' + r.stderr.slice(-2000)));
      else resolve(r);
    });
  });
}

/** An ffmpeg that reads from stdin. `write` waits when the pipe is full. */
export interface Encoder { write(b: Buffer): Promise<void>; end(): Promise<void> }

export function encoder(args: string[]): Encoder {
  const p = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  const err: Buffer[] = [];
  p.stderr.on('data', function (d: Buffer) { err.push(d); });
  const done = new Promise<void>(function (resolve, reject) {
    p.on('error', reject);
    p.on('close', function (code) {
      if (code === 0) resolve(); else reject(new Error('ffmpeg failed (' + code + '):\n' + Buffer.concat(err).toString().slice(-2000)));
    });
  });
  const stdin = p.stdin as Writable;
  return {
    write: function (b) {
      return new Promise(function (resolve, reject) {
        if (stdin.write(b)) resolve();
        else { stdin.once('drain', resolve); done.catch(reject); }
      });
    },
    end: function () { stdin.end(); return done; }
  };
}

/** H.264 from PNG frames on stdin. */
export function videoArgs(fps: number, out: string, crf: number, preset: string): string[] {
  return ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-tune', 'animation',
    '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-movflags', '+faststart', out];
}

/** A sound file decoded to mono 32-bit float at `rate`. */
export async function decodeMono(path: string, rate: number): Promise<Float32Array> {
  const r = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', String(rate), '-']);
  const b = r.stdout;
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength - (b.byteLength % 4)));
}

export interface Loudness { I: number; TP: number; LRA: number; thresh: number; offset: number }

const LOUDNORM = 'loudnorm=I=-14:TP=-1.5:LRA=11';
/** loudnorm falls back to its own dynamic mode when a linear gain would clip, and its output peaks rise again
    through the resample and the AAC encoder. A sample limiter at -3 dBFS keeps the MP4 under -1 dBTP
    (measured: -14.1 LUFS, -1.2 dBTP on the reference video). */
const LIMIT = 'aresample=48000,alimiter=limit=0.71:level=false:attack=1:release=50';

/** loudnorm pass one: measure. */
export async function measureLoudness(wav: string): Promise<Loudness> {
  const r = await run('ffmpeg', ['-hide_banner', '-i', wav, '-af', LOUDNORM + ':print_format=json', '-f', 'null', '-']);
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1)) as Record<string, string>;
  return { I: Number(j.input_i), TP: Number(j.input_tp), LRA: Number(j.input_lra), thresh: Number(j.input_thresh), offset: Number(j.target_offset) };
}

/** loudnorm pass two (linear when it can be), the limiter, then AAC 192k muxed with the video stream (copied). */
export async function muxNormalized(video: string, wav: string, m: Loudness, out: string): Promise<void> {
  const af = LOUDNORM + ':measured_I=' + m.I + ':measured_TP=' + m.TP + ':measured_LRA=' + m.LRA + ':measured_thresh=' + m.thresh +
    ':offset=' + m.offset + ':linear=true,' + LIMIT;
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
}

/** Integrated loudness and true peak of a file's audio (EBU R128). */
export async function ebur128(path: string): Promise<{ I: number; TP: number }> {
  const r = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  return { I: Number(/I:\s+(-?[\d.]+) LUFS/.exec(s)?.[1]), TP: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(s)?.[1]) };
}

export interface Probe { duration: number; frames: number; audio: number | null; width: number; height: number }

export async function probe(path: string): Promise<Probe> {
  const r = await run('ffprobe', ['-v', 'error', '-count_packets', '-show_entries', 'stream=codec_type,duration,nb_read_packets,width,height', '-of', 'json', path]);
  const streams = (JSON.parse(r.stdout.toString()) as { streams: Record<string, string>[] }).streams;
  const v = streams.find(function (s) { return s.codec_type === 'video'; })!, a = streams.find(function (s) { return s.codec_type === 'audio'; });
  return { duration: Number(v.duration), frames: Number(v.nb_read_packets), audio: a ? Number(a.duration) : null, width: Number(v.width), height: Number(v.height) };
}

/** PSNR (dB, average over channels) of frame n (counted in the file) of the MP4 against a PNG. */
export async function framePsnr(mp4: string, n: number, png: string): Promise<number> {
  const r = await run('ffmpeg', ['-hide_banner', '-i', mp4, '-i', png, '-filter_complex',
    '[0:v]select=eq(n\\,' + n + '),format=rgb24[a];[1:v]format=rgb24[b];[a][b]psnr', '-frames:v', '1', '-f', 'null', '-']);
  const m = /average:([\d.]+|inf)/.exec(r.stderr);
  return m ? (m[1] === 'inf' ? Infinity : Number(m[1])) : NaN;
}
