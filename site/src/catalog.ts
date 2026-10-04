/* The series catalog: pure functions from video.json records to page HTML. No I/O here. */

export interface Video {
  slug: string;
  title: string;
  description: string;
  /** Runtime in seconds, from the video's built meta.json. Absent before that merge: no badge. */
  runtime?: number;
  /** Poster file name inside the video folder. */
  poster: string;
  /** ISO date, YYYY-MM-DD. */
  published: string;
}

/** The fields of a video's built meta.json the site reads. */
export interface Meta {
  runtime: number;
}

/** Check one parsed video.json. `where` names the file in the error. video.json itself carries no runtime. */
export function parseVideo(raw: unknown, where: string): Video {
  const r = raw as Record<string, unknown>;
  for (const k of ['slug', 'title', 'description', 'poster', 'published'] as const) {
    if (typeof r?.[k] !== 'string' || !r[k]) throw new Error(`${where}: "${k}" must be a non-empty string`);
  }
  return r as unknown as Video;
}

/** Merge a video's built meta.json runtime in. `meta` is undefined when the video has not been built yet. */
export function withRuntime(v: Video, meta: Meta | undefined): Video {
  return meta ? { ...v, runtime: meta.runtime } : v;
}

/** Whether a video has a runtime worth showing. */
export function hasRuntime(v: Video): boolean {
  return typeof v.runtime === 'number' && v.runtime > 0;
}

/** Newest first. */
export function sortVideos(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => b.published.localeCompare(a.published));
}

/** 426 -> "7:06". */
export function formatRuntime(seconds: number): string {
  const s = Math.round(seconds);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/** The published path of a video's poster, relative to the site root. */
export const posterPath = (v: Video) => `${v.slug}/poster.png`;

export function renderCards(videos: Video[]): string {
  return videos.map(renderCard).join('\n');
}

function renderCard(v: Video): string {
  const href = `/${v.slug}/`;
  const runtime = hasRuntime(v) ? `<span class="runtime">${formatRuntime(v.runtime!)}</span>` : '';
  return `<li class="card">
  <a href="${href}">
    <img src="/${posterPath(v)}" alt="" width="1280" height="720" loading="lazy">
    <div class="meta">
      <h2>${esc(v.title)}</h2>
      ${runtime}
    </div>
    <p>${esc(v.description)}</p>
  </a>
</li>`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
