import type { ChapterScript } from './types';

export const form: ChapterScript = {
  id: 'form', title: 'Form is function', short: 'Form', root: 174.6, scale: [0, 2, 4, 7, 9, 12],
  beats: [
    { id: 'form.lever1', say: 'Now look at what physical things do. Start with a lever.', cam: { x: 420, y: 400, z: 1.3 }, sfx: [[1.5, 'rise'], [3.4, 'fall']] },
    { id: 'form.lever2', say: 'It lifts the rock because of its form: a stiff beam resting on a pivot. That is the whole explanation.' },
    { id: 'form.lever3', say: 'Slide the pivot and it lifts differently. Change the form and you change what it does.', sfx: [[0.7, 'swish'], [2.5, 'rise'], [4.4, 'fall']] },
    { id: 'form.pulley', say: 'A pulley. The rope runs over a wheel, so pulling down on one side lifts the other.', cam: { x: 1500, y: 370, z: 1.25 }, sfx: [[1.6, 'rise'], [3.5, 'fall'], [5.2, 'rise']] },
    { id: 'form.circuit', say: 'A circuit. Wires and switches arranged so that the lamps show the sum of two numbers.', cam: { x: 2700, y: 340, z: 1.3 }, sfx: [[2.2, 'click'], [3.8, 'click'], [5.4, 'click', 1], [5.5, 'ding']] },
    { id: 'form.cut', say: 'Cut one wire and it stops adding. It now does exactly what its new form dictates.', sfx: [[1.0, 'snip'], [1.2, 'fail'], [3.2, 'click'], [4.8, 'click']] },
    { id: 'form.marble', say: 'Marbles and a rocker can add too. The same play, in a different performance.', cam: { x: 3800, y: 340, z: 1.3 }, sfx: [[1.9, 'tick', 2], [3.1, 'pop'], [4.2, 'tick', 3], [5.4, 'ding']] },
    { id: 'form.only', say: 'And each machine can only give the one performance its form allows.' },
    { id: 'form.claim', card: 'What a thing is shaped like is what it does. Form is function.' },
    { id: 'form.back', say: 'It runs backwards too. Catch a thing doing something, and you have learned something about its form.', cam: { x: 2700, y: 340, z: 1.3 }, camT: 0.01, sfx: [[0.3, 'thud'], [5.5, 'whoosh'], [6.2, 'ding']] }
  ]
};
