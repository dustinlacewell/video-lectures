/* Bind the key map to the document. */

import { keyAction, type KeyAction } from './keymap';

export function bindKeyboard(run: (a: KeyAction) => void): void {
  document.addEventListener('keydown', function (e) {
    const t = e.target as HTMLElement | null;
    const a = keyAction({
      key: e.key,
      mod: e.ctrlKey || e.metaKey || e.altKey,
      onButton: !!t && t.tagName === 'BUTTON',
      inMenu: !!t && !!t.closest && !!t.closest('[role="menu"]')
    });
    if (!a) return;
    e.preventDefault();
    run(a);
  });
}
