/* Chapter id -> scene. */

import { title } from './00-title';
import { physics } from './01-physics';
import { form } from './02-form';
import { body } from './03-body';
import { words } from './04-words';
import { zombie } from './05-zombie';
import { inventory } from './06-inventory';
import { subtract } from './07-subtract';
import { animals } from './08-animals';
import type { Scene } from './types';

export const SCENES: Record<string, Scene> = { title, physics, form, body, words, zombie, inventory, subtract, animals };
