/* The video as data: script, cast and actions. No drawing; the scenes are scenes/index.ts. */

import { defineVideo } from '@studio/engine/video';
import { SCRIPT } from './script';
import { CAST } from './script/cast';
import { physicsActions } from './scenes/01-physics.actions';
import { formActions } from './scenes/02-form.actions';
import { bodyActions } from './scenes/03-body.actions';
import { wordsActions } from './scenes/04-words.actions';
import { zombieActions } from './scenes/05-zombie.actions';
import { inventoryActions } from './scenes/06-inventory.actions';
import { subtractActions } from './scenes/07-subtract.actions';
import { animalsActions } from './scenes/08-animals.actions';

export default defineVideo({
  script: SCRIPT,
  cast: CAST,
  actions: {
    physics: physicsActions,
    form: formActions,
    body: bodyActions,
    words: wordsActions,
    zombie: zombieActions,
    inventory: inventoryActions,
    subtract: subtractActions,
    animals: animalsActions,
  },
});
