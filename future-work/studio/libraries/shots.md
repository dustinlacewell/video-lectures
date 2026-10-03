# Library: shots

Not built. Proposal.

A shot template is a reusable picture pattern with parameters. "Title card", "two beans talking", "checklist". A video fills the parameters and gets a shot spec.

## Data shape

```ts
// packages/library/src/shots/template.ts
import type { ShotSpec } from '@studio/engine/shot';   // authoring.md

export interface ShotTemplate<P> {
  id: string;                       // 'shot.twoBeansTalking'
  params: z.ZodType<P>;             // checked at build; the catalog prints it
  make(p: P): ShotSpec;             // pure: data in, data out
  sample: P;                        // for the preview and the tests
}
```

A template returns a `ShotSpec`: actors, actions, camera. It never draws. The engine compiles the spec ([authoring.md](authoring.md)). So a template is library data, not scene code, and the same compiler runs it in every video.

## The first templates

From the first production:

| Id | Params | Where it was |
|---|---|---|
| `shot.titleCard` | title, accent | engine today (`_title` beats). Stays in the engine as a service; the template wraps it so boards can cite it. |
| `shot.chapterCard` | text | engine today (`card` beats). Same. |
| `shot.twoBeansTalking` | left: actor, right: actor, bubbleSide | zombie chapter: you and the zombie answer together; words chapter: you and the friend |
| `shot.checklist` | items: badge ids, revealOn: anchors | body.list, inventory.m1..m3, subtract: badges pop in on their words |
| `shot.visitorTry` | visitor: character, target: prop, result: 'fail' | physics.ghost, .spirit, .thought: a visitor enters, tries, fails, sulks |
| `shot.lineup` | actors[], labelOn: anchors | animals.three: crow, dog, octopus |

`shot.visitorTry` is the ghost beat generalized. Its actions are the ones in studio-design B7, with the visitor and the anchor word as parameters.

## Where it lives

```
packages/library/src/shots/
  twoBeansTalking/   template.ts, template.card.ts, template.test.ts
  checklist/
  visitorTry/
  ...
```

## How a video uses it

```ts
// videos/<slug>/scenes/01-physics.shots.ts
import { visitorTry } from '@studio/library/shots/visitorTry';
export const physicsShots: ChapterShots = {
  ghost:   visitorTry({ visitor: 'character.ghost',   target: 'prop.domino', on: { word: 'ghost' } }),
  spirit:  visitorTry({ visitor: 'character.spirit',  target: 'prop.domino', on: { word: 'spirit' } }),
  thought: visitorTry({ visitor: 'character.thought', target: 'prop.domino', on: { word: 'thought' } }),
};
```

Three beats, three lines. Today they are about 90 lines of pose code plus a `FAILT` table plus three `sfx` arrays that must agree with it.

## How an item gets in

Harvest finds a pattern when two beats, or two videos, have the same actors and action shape with different words. The librarian writes the template with the first beat as `sample`, migrates the beats, and the guard proves the pixels did not move. A template needs a test: `make(sample)` compiles, every action resolves, every anchor word exists in the sample line.

## Preview

The catalog compiles `make(sample)` against a fixture beat and shows five frames: start, each action's payoff, end. It also prints the params schema as a table.
