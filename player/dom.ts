/* The page elements the player drives. */

export interface PlayerEls {
  cv: HTMLCanvasElement;
  stage: HTMLElement;
  seek: HTMLInputElement;
  time: HTMLElement;
  play: HTMLButtonElement;
  snd: HTMLButtonElement;
  spd: HTMLButtonElement;
  full: HTMLButtonElement;
  chips: HTMLElement;
  script: HTMLElement;
}

export function findElements(): PlayerEls {
  function el<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
  return {
    cv: el('cv'), stage: el('stage'), seek: el('seek'), time: el('time'), play: el('play'),
    snd: el('snd'), spd: el('spd'), full: el('full'), chips: el('chips'), script: el('script')
  };
}
