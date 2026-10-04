import { describe, expect, it } from 'vitest';
import { formatRuntime, hasRuntime, parseVideo, renderCards, sortVideos, type Video } from '../src/catalog.ts';

const v = (over: Partial<Video> = {}): Video => ({
  slug: 'a', title: 'A', description: 'd', runtime: 426, poster: 'poster.png', published: '2026-10-03', ...over
});

describe('catalog', () => {
  it('formats runtime as m:ss', () => {
    expect(formatRuntime(426.2)).toBe('7:06');
    expect(formatRuntime(59.6)).toBe('1:00');
  });

  it('rejects a video.json with a missing field', () => {
    expect(() => parseVideo({ ...v(), title: '' }, 'x/video.json')).toThrow('x/video.json: "title"');
    expect(() => parseVideo({ ...v(), runtime: '426' }, 'x')).toThrow('"runtime"');
  });

  it('accepts a video.json with no runtime, or runtime 0', () => {
    const { runtime, ...noRuntime } = v();
    expect(() => parseVideo(noRuntime, 'x')).not.toThrow();
    expect(() => parseVideo({ ...v(), runtime: 0 }, 'x')).not.toThrow();
    expect(hasRuntime(parseVideo(noRuntime, 'x'))).toBe(false);
    expect(hasRuntime(parseVideo({ ...v(), runtime: 0 }, 'x'))).toBe(false);
    expect(hasRuntime(parseVideo(v(), 'x'))).toBe(true);
  });

  it('omits the runtime badge when there is no runtime', () => {
    const { runtime, ...noRuntime } = v();
    const html = renderCards([noRuntime as Video]);
    expect(html).not.toContain('class="runtime"');
  });

  it('sorts newest first', () => {
    const out = sortVideos([v({ slug: 'old', published: '2026-01-01' }), v({ slug: 'new' })]);
    expect(out.map(x => x.slug)).toEqual(['new', 'old']);
  });

  it('links each card to /<slug>/ and escapes text', () => {
    const html = renderCards([v({ slug: 'mind', title: 'Minds & <machines>' })]);
    expect(html).toContain('href="/mind/"');
    expect(html).toContain('src="/mind/poster.png"');
    expect(html).toContain('Minds &amp; &lt;machines&gt;');
  });
});
