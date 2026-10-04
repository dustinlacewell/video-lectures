/* What a video gives the engine: data only. No drawing, no DOM, so Node can import it (workmark, Vite config, tests).
   The drawing is the other half of the seam: the video's scenes/index.ts exports SCENES, a SceneMap. */

import type { Cast, ChapterScript } from './script';

export interface VideoData<S extends string = string> {
  script: ChapterScript<S>[];
  cast: Cast<S>;
}

/** A video's video.ts default-exports this. Identity; it types the data against the video's speakers. */
export function defineVideo<S extends string>(video: VideoData<S>): VideoData<S> {
  return video;
}
