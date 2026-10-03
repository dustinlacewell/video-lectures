/* Composition root: build the timeline, bind the canvas, wire the page, start the clock. */

import { setContext } from '../engine/canvas';
import { buildTimeline } from '../engine/timeline';
import { SCENES } from '../scenes';
import { SCRIPT } from '../script';
import { onFontsLoaded, wireControls } from './controls';
import { exposeDebug } from './debug';
import { findElements } from './dom';
import { createPlayback } from './playback';
import { buildChapterChips, buildScriptText } from './scriptText';

const tl = buildTimeline(SCRIPT);
const els = findElements();
setContext(els.cv.getContext('2d')!);

const player = createPlayback(tl, SCENES, els);
buildChapterChips(tl, els.chips, player.jumpTo);
buildScriptText(tl, els.script);
wireControls(els, player);
exposeDebug(tl, player);

player.fit();
onFontsLoaded(player.fontsLoaded);
player.start();
