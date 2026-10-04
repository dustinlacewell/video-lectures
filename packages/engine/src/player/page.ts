/* Pure: fill the player page template (index.html) from a video's video.json. */

/** The fields of video.json the page reads. */
export interface VideoMeta {
  slug: string;
  title: string;
  description: string;
  /** Poster file name, published beside the page. */
  poster: string;
  /** The page heading. Default: the title. */
  heading?: string;
}

/** Where the series is published. */
export const SITE_URL = 'https://lectures.ldlework.com/';

/** Replace every {{name}} in `html`. An unknown name throws, so a template typo cannot ship. */
export function fillPage(html: string, v: VideoMeta): string {
  const url = SITE_URL + v.slug + '/';
  const values: Record<string, string> = {
    title: v.title, heading: v.heading ?? v.title, description: v.description, url: url, image: url + v.poster
  };
  return html.replace(/\{\{(\w+)\}\}/g, function (_, name: string) {
    if (!(name in values)) throw new Error('player page: unknown placeholder {{' + name + '}}');
    return esc(values[name]);
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!; });
}
