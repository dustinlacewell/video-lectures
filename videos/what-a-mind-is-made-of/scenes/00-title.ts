import { C } from '../engine/palette';
import type { Scene } from './types';
import { TITLE_BG, titleBack, titleScene } from './shared/titleArt';

export const title: Scene = {
  bg: TITLE_BG, accent: C.yellow,
  back: function (S, cam, T) { titleBack(cam, T); },
  draw: function (S, cam, T) { titleScene(T, 'An argument, from physics up'); }
};
