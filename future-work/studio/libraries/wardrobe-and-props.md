# Library: wardrobe and props

Not built. Proposal.

Wardrobe attaches to a character. A prop stands on its own. A background fills the frame behind the action.

## Data shape

```ts
// packages/library/src/wardrobe/worn.ts
/** A wardrobe item draws itself at a rig anchor. It knows nothing about the rig. */
export interface Wardrobe {
  id: string;                      // 'wardrobe.hat.bowler'
  anchor: AnchorName;              // where it attaches
  layer: 'behind' | 'front';       // drawn before or after the body
  draw(a: Anchor, t: number): void;
}
export interface Worn { item: Wardrobe; offset?: [number, number] }

// packages/library/src/props/prop.ts
/** A prop is a draw function of options and time. Pure. */
export type Prop<O> = (o: O & { x: number; y: number; t: number }) => void;

// packages/library/src/backgrounds/background.ts
/** A background draws in screen space, before the camera. Pure in T. */
export type Background<O> = (o: O, T: number) => void;
```

The rig draws `wear` in two passes: `behind` items, body, `front` items. A hat at `head` follows the bob and tilt because the anchor is computed from the same options. The scene never positions a hat by hand. That is why "put a hat on a bean once" is enough: the second bean gets it with `wear: [{ item: bowler }]`.

## Where it lives

```
packages/library/src/
  wardrobe/     hat/bowler.ts, glasses/round.ts, ... each with .card.ts
  props/        domino.ts, lever.ts, pulley.ts, lamp.ts, truthTable.ts, speechBubble? (no: engine), ...
  backgrounds/  neuralField.ts, scenery.ts (hills, ground), ...
```

## From the first production

- **Props**: the domino chain and the pushing finger (physics), lever, pulley, ramp, lamps and the truth table (form), the item badges on a shelf (inventory). Each is drawn in a chapter scene today. Harvest extracts the ones used twice or clearly general. The domino and the lever are general. The truth table is one chapter's and stays until a second video wants one.
- **Backgrounds**: `scenes/03-body.network.ts` has `activity(T)`: the constant background neural firing the human asked for ("fired because others fired first" begs the question without it). It is pure in `T`, seeded by `hash(a, b, c)`. It becomes `backgrounds/neuralField.ts` with options for node count, extent, rate and color. `kit/scenery.ts` (ground, hills) becomes `backgrounds/scenery.ts`.
- **Wardrobe**: none exists yet. The data shape is here so the first hat lands in the right place.

## How a video uses it

```ts
bean({ x, y, wear: [{ item: bowler }] });
domino({ x, y, t: T, tilt: S.act('fall') * 0.5 });
neuralField({ nodes: 60, rate: 1.2, color: C.yellow }, T);
```

## How an item gets in

Harvest step for a prop drawn inside a scene: cut the draw code into `props/<name>.ts`, replace the scene's constants with options, keep the scene's call pixel-identical (guard proves it), add the card, add a determinism test (draw at `T=30` cold equals draw after `T=0..30`).

## Preview

Prop: one frame at `t = 1` and a strip over its main option. Background: one frame at 1280 x 720 scaled to 320 wide. Wardrobe: drawn on the bean at the catalog's standard pose, so the human sees it worn.
