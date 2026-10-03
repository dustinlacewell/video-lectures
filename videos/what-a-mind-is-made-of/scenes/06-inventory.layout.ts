/* The inventory of a self: layout shared by the inventory and subtraction chapters. */

import type { IconKind } from '../kit/icons';

export const GY = 650;
/** X of the zombie (second figure) in world space. */
export const ZC = 1920;

/** Icon, label, colour. */
export const INV: [IconKind, string, string][] = [
  ['memory', 'memories', '#FF5C8A'], ['habit', 'habits', '#12A99A'], ['belief', 'beliefs', '#3E7BFA'], ['talent', 'talents', '#7A55D6'],
  ['love', 'loves', '#F0435E'], ['fear', 'fears', '#9B5BD6'], ['humor', 'humor', '#2FA85A'], ['plan', 'plans', '#E8742A']
];

/** Position of inventory item k on the arc above a figure at cx. */
export function invPos(cx: number, k: number): number[] {
  const th = (205 - k * 32.86) * Math.PI / 180;
  return [cx + 470 * Math.cos(th), 410 - 270 * Math.sin(th)];
}
