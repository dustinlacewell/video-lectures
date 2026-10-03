/* Re-measure text once the display fonts arrive. */

export function onFontsLoaded(fn: () => void): void {
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('600 40px Fredoka'), document.fonts.load('700 40px Fredoka'), document.fonts.load('500 40px Fredoka')])
      .then(fn).catch(function () {});
  }
}
