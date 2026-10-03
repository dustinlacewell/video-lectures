/* Pure: a clip report -> markdown. */

import { clock, num } from '../shared/format.ts';
import type { CheckRules, ClipReport } from './check.ts';

export function markdown(r: ClipReport, rules: CheckRules, source: string, hasManifest: boolean): string {
  return [
    '# Clip check', '',
    r.spoken + ' spoken beats checked. Clip lengths from ' + source + '.', '',
    '- Missing clips: ' + r.missing.length + ' beats.',
    '- Clip runs past its beat: ' + r.overflow.length + '.',
    '- Dead air (beat over ' + rules.deadAirRatio + 'x its speech): ' + r.deadAir.length + '.',
    '- Script dur longer than clip + ' + rules.pad + ' s pad: ' + r.overrides.length + '.',
    '- Orphan clips (no beat uses them): ' + r.orphans.length + '.',
    ...(hasManifest ? ['- In manifest, not rendered: ' + r.unrendered.length + '.', '- Expected clip not in manifest: ' + r.notInManifest.length + '.'] : []),
    '',
    section('Missing clips', r.missing.map(function (m) { return '- ' + m.beat + ' at ' + clock(m.start) + ': ' + m.clips.join(', ') + '. The beat falls back to its script timing.'; })),
    section('Clip runs past its beat', r.overflow.map(function (o) { return '- ' + o.beat + ' at ' + clock(o.start) + ': ' + o.clip + ' ends ' + num(o.over) + ' s after the beat.'; })),
    section('Dead air', r.deadAir.map(function (d) { return '- ' + d.beat + ' (' + d.kind + ') at ' + clock(d.start) + ': beat ' + num(d.dur, 1) + ' s, speech ' + num(d.speech, 1) + ' s (' + num(d.ratio, 1) + 'x).'; })),
    section('Script dur wins over the clip', r.overrides.map(function (o) { return '- ' + o.beat + ' at ' + clock(o.start) + ': dur ' + num(o.explicit, 1) + ' s, clip + pad ' + num(o.voiced, 1) + ' s, adds ' + num(o.added, 1) + ' s.'; })),
    section('Orphan clips', r.orphans.map(function (id) { return '- ' + id; })),
    ...(hasManifest ? [
      section('In manifest, not rendered', r.unrendered.map(function (id) { return '- ' + id; })),
      section('Expected clip not in manifest', r.notInManifest.map(function (id) { return '- ' + id; }))
    ] : [])
  ].join('\n');
}

function section(title: string, lines: string[]): string {
  return '## ' + title + '\n\n' + (lines.length ? lines.join('\n') : 'None.') + '\n';
}
