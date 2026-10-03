/* Pure: the YouTube chapter list for a video description. */

export interface ChapterMark { start: number; title: string }

/** YouTube ignores a chapter shorter than this. */
export const MIN_CHAPTER = 10;

/** "m:ss Title" lines. The first starts at 0:00. A chapter under 10 s merges into the next one,
    which takes over its start; a short last chapter merges into the one before. Returns the merged titles too. */
export function youtubeChapters(marks: ChapterMark[], total: number): { lines: string[]; merged: string[] } {
  const kept: ChapterMark[] = [], merged: string[] = [];
  let carry: number | undefined;
  marks.forEach(function (m, i) {
    const start = carry ?? m.start, end = i + 1 < marks.length ? marks[i + 1].start : total;
    if (end - start < MIN_CHAPTER && i + 1 < marks.length) { merged.push(m.title); carry = start; return; }
    if (end - start < MIN_CHAPTER && kept.length) { merged.push(m.title); return; }
    kept.push({ start: start, title: m.title });
    carry = undefined;
  });
  if (kept.length) kept[0] = { start: 0, title: kept[0].title };
  return { lines: kept.map(function (m) { return timestamp(m.start) + ' ' + m.title; }), merged: merged };
}

/** Seconds -> "m:ss", or "h:mm:ss" from one hour. Floors. */
export function timestamp(t: number): string {
  const s = Math.floor(t + 1e-9), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const ss = (r < 10 ? '0' : '') + r;
  return h ? h + ':' + (m < 10 ? '0' : '') + m + ':' + ss : m + ':' + ss;
}
