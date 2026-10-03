# Library: characters

Not built. Proposal.

Rigs, poses, expressions and mouths. A character is drawn by a rig. A pose or an expression is data the rig reads.

## Data shape

```ts
// packages/library/src/characters/rig.ts
export interface Anchor { x: number; y: number; rot: number; scale: number }

/** A rig draws a character and tells where its attachment points are for this frame. */
export interface Rig<O> {
  draw(o: O): void;
  /** Pure. Same inputs as draw. Wardrobe and props attach here. */
  anchors(o: O): Record<AnchorName, Anchor>;
}
export type AnchorName = 'head' | 'face' | 'handL' | 'handR' | 'feet' | 'center';

/** A pose: rig options as a function of progress 0..1. Pure. */
export type Pose<O> = (p: number) => Partial<O>;

/** An expression: the face only. */
export interface Expression { mouth: Mouth; brow?: number; look?: [number, number] }
```

The bean today (`kit/bean.ts`, `BeanOpts`) already is a rig in all but name. It gains `anchors()` and `wear?: Worn[]` (see [wardrobe-and-props.md](wardrobe-and-props.md)). `Mouth` stays the mouth set. `mouthOpen(lt)` stays the talk curve.

## Where it lives

```
packages/library/src/characters/
  bean/        bean.ts (rig), bean.card.ts, poses/{sulk,reach,hop,...}.ts, expressions.ts, bean.test.ts
  hand/        the pointing hand
  ghost/  spirit/  thought/   the visitors from the physics chapter (today kit/spirits.ts)
  crow/  dog/  octopus/       today kit/animals.ts
  aibot/
```

One folder per character. The rig, its card, its poses and its test sit together. A pose used by one video only stays in that video's `scenes/` until harvest promotes it.

## How a video uses it

```ts
import { bean } from '@studio/library/characters/bean';
import { sulk } from '@studio/library/characters/bean/poses/sulk';
bean({ x, y, ...sulk(S.act('ghostSulk')), talk: sp.talk('you') });
```

In a shot spec ([authoring.md](authoring.md)) the same thing is data: `{ rig: 'character.bean', pose: 'pose.bean.sulk' }`.

## How an item gets in

The first production has eight characters in `kit/`. Harvest ([harvest.md](harvest.md)) moves each as is, then adds the card. Poses are harvested from scene code where a pose function exists (`ghostPose`, `sulk`, the zombie's hop). A pose must name no beat and hold no times; it takes progress only.

Criterion for a pose: used in two beats, or clearly general (sulk, hop, point, shrug).

## Preview

The card's preview draws the rig at five progress values of its idle, and each pose as a strip of five frames. Headless, 320 px wide, deterministic. The catalog page shows the strip; agents get the PNG path.

```ts
export const card: LibraryCard = {
  id: 'character.bean', kind: 'character', name: 'Bean',
  summary: 'Round figure with eyes, mouth and two arms. The cast of every lecture.',
  origin: { video: 'what-a-mind-is-made-of' },
  module: '@studio/library/characters/bean',
  preview: { kind: 'frame', draw: T => bean({ x: 160, y: 300, t: T }), seconds: 3 },
};
```
