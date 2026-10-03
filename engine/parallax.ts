/* Draw in world space with a parallax factor f (1 = moves with the world, 0 = fixed to screen). */

import type { Cam } from '../script/types';
import { c } from './canvas';
import { H, W } from './math';

export function withCam(cam: Cam, f: number, fn: () => void): void {
  c.save();
  const z = 1 + (cam.z - 1) * f;
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-(640 + (cam.x - 640) * f), -(360 + (cam.y - 360) * f));
  fn(); c.restore();
}
