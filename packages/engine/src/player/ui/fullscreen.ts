/* Full screen for one element. */

export function canFullscreen(): boolean { return !!document.fullscreenEnabled; }

export function isFullscreen(): boolean { return !!document.fullscreenElement; }

export function toggleFullscreen(el: HTMLElement): void {
  const p = document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  p.catch(function () {});
}
