/* Pure: page URL flags. */

/** The URL with the flag `name` removed (bare or with a value), then added back bare (`?name`) when `on`.
    Other parameters stay exactly as written. */
export function withFlag(url: string, name: string, on: boolean): string {
  const u = new URL(url);
  const kept = u.search.replace(/^\?/, '').split('&').filter(function (p) { return p !== '' && keyOf(p) !== name; });
  const parts = kept.concat(on ? [name] : []);
  u.search = parts.length ? '?' + parts.join('&') : '';
  return u.toString();
}

function keyOf(param: string): string {
  const i = param.indexOf('=');
  return decodeURIComponent(i < 0 ? param : param.slice(0, i));
}
