/* Marks the player idle after a spell of no pointer or key input while playing. CSS hides the bar when idle. */

const IDLE_MS = 2500;

export interface AutoHide {
  /** Tell it whether the video plays. Paused: never idle. */
  setPlaying(playing: boolean): void;
}

export function createAutoHide(root: HTMLElement): AutoHide {
  let playing = false, timer = 0;
  root.addEventListener('pointermove', wake);
  root.addEventListener('pointerdown', wake);
  root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && playing) sleep(); });
  document.addEventListener('keydown', wake);
  return {
    setPlaying: function (v) {
      if (v === playing) return;
      playing = v;
      wake();
    }
  };

  function wake(): void {
    root.classList.remove('idle');
    clearTimeout(timer);
    if (playing) timer = window.setTimeout(sleep, IDLE_MS);
  }

  function sleep(): void {
    clearTimeout(timer);
    if (playing) root.classList.add('idle');
  }
}
