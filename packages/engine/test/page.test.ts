import { describe, expect, it } from 'vitest';
import { SITE_URL, fillPage } from '../src/player/page';

const META = { slug: 'a-video', title: 'A <Video> & "More"', description: 'About it.', poster: 'poster.png' };

describe('player page', () => {
  it('fills title, heading, description, url and image, escaped', () => {
    const html = fillPage('<title>{{title}}</title><h1>{{heading}}</h1><p>{{description}}</p><a href="{{url}}"><img src="{{image}}">', META);
    expect(html).toBe('<title>A &lt;Video&gt; &amp; &quot;More&quot;</title><h1>A &lt;Video&gt; &amp; &quot;More&quot;</h1><p>About it.</p>'
      + `<a href="${SITE_URL}a-video/"><img src="${SITE_URL}a-video/poster.png">`);
  });

  it('uses the heading when the video gives one', () => {
    expect(fillPage('{{heading}}', { ...META, heading: 'A video' })).toBe('A video');
  });

  it('rejects an unknown placeholder', () => {
    expect(() => fillPage('{{titel}}', META)).toThrow(/titel/);
  });
});
