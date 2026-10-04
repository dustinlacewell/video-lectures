/* Pure: render a guard run's findings as text. */

import { clock } from '../shared/format.ts';
import type { Mismatch } from './compare.ts';

export interface RunReport {
  slug: string;
  sampleCount: number;
  mismatches: Mismatch[];
  infoChanged: boolean;
  control: { ran: boolean; distinct: boolean };
  seconds: number;
}

export function summaryLine(r: RunReport): string {
  const parts = [r.slug, r.sampleCount + ' samples', r.mismatches.length + ' differ', r.seconds.toFixed(1) + 's'];
  if (r.infoChanged) parts.push('__info() changed');
  if (r.control.ran) parts.push('control ' + (r.control.distinct ? 'ok' : 'FAILED (t == t+0.5)'));
  return parts.join(', ');
}

export function mismatchLines(mismatches: Mismatch[]): string[] {
  return mismatches.map(function (m) { return '  t=' + m.t.toFixed(3) + ' (' + clock(m.t) + ') ' + m.why + ': frame hash differs'; });
}
