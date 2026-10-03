import type { ChapterScript } from './types';

export const form: ChapterScript = {
  id: 'form', title: 'Form is function', short: 'Form', root: 174.6, scale: [0, 2, 4, 7, 9, 12],
  beats: [
    { id: 'form.thesis', say: 'In a physical world, form and function are the same thing.', cam: { x: -600, y: 470, z: 1.3 }, sfx: [[0.3, 'pop'], [1.0, 'pop', 2]] },
    { id: 'form.betray', say: 'The shape a thing has decides what it can do. And what it does betrays its shape.', sfx: [[0.3, 'swish'], [1.1, 'whoosh']] },
    { id: 'form.lever1', say: 'Take a lever.', dur: 3.2, cam: { x: 420, y: 400, z: 1.3 }, sfx: [[1.5, 'rise'], [3.4, 'fall']] },
    { id: 'form.lever2', say: 'It lifts the rock because of its form: a stiff beam resting on a pivot. That is the whole explanation.' },
    { id: 'form.lever3', say: 'Slide the pivot and it lifts differently. Change the form and you change what it does.', sfx: [[0.7, 'swish'], [2.5, 'rise'], [4.4, 'fall']] },
    { id: 'form.pulley', say: 'A pulley. The rope runs over a wheel, so pulling down on one side lifts the other.', cam: { x: 1500, y: 370, z: 1.25 }, sfx: [[1.6, 'rise'], [3.5, 'fall'], [5.2, 'rise']] },
    { id: 'form.circuit', say: 'A circuit. Wires and switches arranged so that the lamps show the sum of two numbers.', cam: { x: 2700, y: 340, z: 1.3 }, sfx: [[2.2, 'click'], [3.8, 'click'], [5.4, 'click', 1], [5.5, 'ding']] },
    { id: 'form.cut', say: 'Cut one wire and it stops adding. It now does exactly what its new form dictates.', sfx: [[1.0, 'snip'], [1.2, 'fail'], [3.2, 'click'], [4.8, 'click']] },
    { id: 'form.claim', card: 'What a thing is shaped like is what it does. Form *is* function.' }
  ]
};
