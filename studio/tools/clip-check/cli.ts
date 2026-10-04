/* clip-check: every spoken beat has its clips, clips fit their beats, no dead air, no orphans. */

import { readFileSync } from 'node:fs';
import { callerPath, parseCli } from '../shared/args.ts';
import { writeOut } from '../shared/output.ts';
import { loadClipLengths } from '../shared/sources.ts';
import { withVideo } from '../shared/video.ts';
import { checkClips, DEFAULT_RULES, noVoiceYetMessage, type CheckRules } from './check.ts';
import { markdown } from './report.ts';

const USAGE = `clip-check: compare timeline beats with voice clip lengths.
  --manifest <file>     voice manifest JSON (array of { id }) to cross-check
  --dead-air <x>        flag beats longer than x times their speech (default 2)
  --pad <s>             quiet the engine adds after a line (default 0.6)
  --require-clips       fail (exit 1) when no clip lengths exist yet, instead of reporting "no voice yet"`;

const { common, own } = parseCli(USAGE, { manifest: { type: 'string' }, 'dead-air': { type: 'string' }, pad: { type: 'string' }, 'require-clips': { type: 'boolean' } });
const rules: CheckRules = { ...DEFAULT_RULES, deadAirRatio: Number(own['dead-air'] ?? DEFAULT_RULES.deadAirRatio), pad: Number(own.pad ?? DEFAULT_RULES.pad) };
const manifestPath = callerPath(own.manifest as string | undefined);
const requireClips = !!own['require-clips'];

await withVideo(common, {}, async function (v) {
  const clips = await loadClipLengths(v.session, common);
  if (!Object.keys(clips).length) {
    if (requireClips) throw new Error('no clip lengths found (durations.json next to the page, or --durations)');
    console.log(noVoiceYetMessage(v.beats));
    return;
  }
  const ids = manifestPath ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as { id: string }[]).map(function (e) { return e.id; }) : undefined;
  const report = checkClips(v.beats, v.allBeats, clips, ids, rules);
  const source = common.durations ? common.durations : 'durations.json next to the page';
  writeOut(common.out, 'clips.json', JSON.stringify(report, null, 2) + '\n');
  const md = writeOut(common.out, 'clips.md', markdown(report, rules, source, !!ids));
  console.log(report.spoken + ' spoken beats; missing ' + report.missing.length + ', overflow ' + report.overflow.length + ', dead air ' + report.deadAir.length +
    ', dur overrides ' + report.overrides.length + ', orphans ' + report.orphans.length + '. ' + md);
});
