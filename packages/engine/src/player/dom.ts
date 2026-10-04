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

/** The stage and control bar, written into the video box. */
const PLAYER_HTML = `
    <div class="stage" id="stage">
      <canvas id="cv" role="img" aria-label="Animated video with captions"></canvas>
      <div class="bigplay" id="bigplay" aria-hidden="true"></div>
    </div>

    <div class="bar" id="bar">
      <button class="ic play" id="play" type="button" aria-label="Play (k)"></button>
      <span class="time"><span id="cur">0:00</span><span class="of"> / <span id="total">0:00</span></span></span>
      <div class="scrub" id="scrub">
        <div class="track" id="track"></div>
        <input id="seek" type="range" value="0" aria-label="Seek">
        <div class="tip" id="tip" hidden><span></span><span></span></div>
      </div>
      <div class="menu-anchor">
        <button class="ic" id="chap" type="button" aria-label="Chapters"></button>
        <div class="menu chapters" id="chapmenu" role="menu" aria-label="Chapters" hidden></div>
      </div>
      <div class="menu-anchor">
        <button class="ic speed" id="spd" type="button" aria-label="Playback speed">1×</button>
        <div class="menu" id="spdmenu" role="menu" aria-label="Playback speed" hidden></div>
      </div>
      <button class="ic" id="snd" type="button" aria-label="Mute (m)"></button>
      <button class="ic" id="full" type="button" aria-label="Full screen (f)"></button>
    </div>
  `;

/** Write the player into `box` (the video box: `.player.paused`) and find its parts. */
export function buildPlayer(box: HTMLElement): PlayerEls {
  box.innerHTML = PLAYER_HTML;
  return findElements(box);
}

function findElements(box: HTMLElement): PlayerEls {
  function el<T extends HTMLElement>(id: string): T { return box.querySelector('#' + id) as T; }
  return {
    player: box, stage: el('stage'), cv: el('cv'), bigPlay: el('bigplay'),
    play: el('play'), cur: el('cur'), total: el('total'),
    scrub: el('scrub'), track: el('track'), seek: el('seek'), tip: el('tip'),
    chap: el('chap'), chapMenu: el('chapmenu'), spd: el('spd'), spdMenu: el('spdmenu'),
    snd: el('snd'), full: el('full')
  };
}
