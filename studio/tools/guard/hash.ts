/* Pure function of bytes in, hex out. No I/O. */

import { createHash } from 'node:crypto';

export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}
