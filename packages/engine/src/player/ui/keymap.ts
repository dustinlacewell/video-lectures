/* Pure key map: a key press to a player action. */

export type KeyAction =
  | { kind: 'toggle' }
  | { kind: 'seekBy'; by: number }
  | { kind: 'seekTo'; to: 'start' | 'end' }
  | { kind: 'mute' }
  | { kind: 'fullscreen' };

export interface KeyPress {
  key: string;
  /** Modifier held: the browser keeps the key. */
  mod: boolean;
  /** Focus is on a button: Space and Enter press it. */
  onButton: boolean;
  /** Focus is inside an open menu: arrows move through it. */
  inMenu: boolean;
}

export function keyAction(k: KeyPress): KeyAction | null {
  if (k.mod || k.inMenu) return null;
  switch (k.key.length === 1 ? k.key.toLowerCase() : k.key) {
    case ' ': return k.onButton ? null : { kind: 'toggle' };
    case 'k': return { kind: 'toggle' };
    case 'ArrowLeft': return { kind: 'seekBy', by: -5 };
    case 'ArrowRight': return { kind: 'seekBy', by: 5 };
    case 'j': return { kind: 'seekBy', by: -10 };
    case 'l': return { kind: 'seekBy', by: 10 };
    case 'Home': return { kind: 'seekTo', to: 'start' };
    case 'End': return { kind: 'seekTo', to: 'end' };
    case 'm': return { kind: 'mute' };
    case 'f': return { kind: 'fullscreen' };
    default: return null;
  }
}
