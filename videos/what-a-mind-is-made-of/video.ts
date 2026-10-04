/* The video as data: script and cast. No drawing; the scenes are scenes/index.ts. */

import { defineVideo } from '@studio/engine/video';
import { SCRIPT } from './script';
import { CAST } from './script/cast';

export default defineVideo({ script: SCRIPT, cast: CAST });
