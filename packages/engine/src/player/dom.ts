/* The page elements the player drives. */

export interface PlayerEls {
  /** The video box: stage plus control bar. Goes full screen as one. */
  player: HTMLElement;
  stage: HTMLElement;
  cv: HTMLCanvasElement;
  bigPlay: HTMLElement;
  play: HTMLButtonElement;
  cur: HTMLElement;
  total: HTMLElement;
  scrub: HTMLElement;
  track: HTMLElement;
  seek: HTMLInputElement;
  tip: HTMLElement;
  chap: HTMLButtonElement;
  chapMenu: HTMLElement;
  spd: HTMLButtonElement;
  spdMenu: HTMLElement;
  snd: HTMLButtonElement;
  full: HTMLButtonElement;
}

export function findElements(): PlayerEls {
  function el<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
  return {
    player: el('player'), stage: el('stage'), cv: el('cv'), bigPlay: el('bigplay'),
    play: el('play'), cur: el('cur'), total: el('total'),
    scrub: el('scrub'), track: el('track'), seek: el('seek'), tip: el('tip'),
    chap: el('chap'), chapMenu: el('chapmenu'), spd: el('spd'), spdMenu: el('spdmenu'),
    snd: el('snd'), full: el('full')
  };
}
