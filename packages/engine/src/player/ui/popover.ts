/* A menu that opens above its button. Closes on Escape, on a click outside, or when the caller closes it. */

export interface Popover {
  open(): void;
  close(): void;
  isOpen(): boolean;
}

export function createPopover(trigger: HTMLButtonElement, panel: HTMLElement, onOpen: () => void): Popover {
  const self: Popover = { open: open, close: close, isOpen: function () { return !panel.hidden; } };
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', function () { if (self.isOpen()) close(); else open(); });
  panel.addEventListener('keydown', onMenuKey);
  document.addEventListener('click', swallowOutsideClick, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  return self;

  function open(): void {
    onOpen();
    panel.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    const first = (panel.querySelector('[aria-checked="true"],[aria-current="true"]') || items()[0]) as HTMLElement | undefined;
    if (first) first.focus();
  }

  function close(): void {
    if (panel.hidden) return;
    const hadFocus = panel.contains(document.activeElement);
    panel.hidden = true; trigger.setAttribute('aria-expanded', 'false');
    if (hadFocus) trigger.focus();
  }

  function items(): HTMLElement[] { return Array.from(panel.querySelectorAll<HTMLElement>('[role^="menuitem"]')); }

  function onMenuKey(e: KeyboardEvent): void {
    const list = items(), i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') list[(i + 1) % list.length].focus();
    else if (e.key === 'ArrowUp') list[(i - 1 + list.length) % list.length].focus();
    else if (e.key === 'Tab') close();
    else return;
    if (e.key !== 'Tab') e.preventDefault();
  }

  /** A click outside an open menu closes it. A click on blank space does nothing else, so it does not also pause the video. */
  function swallowOutsideClick(e: MouseEvent): void {
    const t = e.target as Element;
    if (panel.hidden || panel.contains(t) || trigger.contains(t)) return;
    close();
    if (!t.closest || !t.closest('button, input')) { e.stopPropagation(); e.preventDefault(); }
  }
}
