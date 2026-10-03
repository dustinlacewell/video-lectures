# Authoring

Not built. Proposal.

High-level scene authoring: a beat is actors, actions anchored to words, and a camera. The engine compiles that to the pure function of `T` it already runs. Hand-drawn scenes stay legal; a shot spec is the default for new work.

## Why

The ghost beat today (studio-design B7): a `ghostPose(u)` with five time branches, a `FAILT` table, three `sfx` times in the script that must agree with it, and a `dur` chosen by hand. The red X appears 1.7 s before the narrator says "ghost". Twenty of 90 beats have the same disease: timing typed as constants in two places. The sync engine fixes "when". Authoring fixes "what", so the animator writes neither.

## The data

```ts
// packages/engine/src/shot.ts
export interface ShotSpec {
  actors: Record<string, ActorSpec>;
  actions: Record<string, Action>;         // timing from studio-design B3, plus what to do
  camera?: Cam | CamFn | { frame: string[]; z?: number; pad?: number };   // frame: actor names to keep in view
  props?: Record<string, PropSpec>;
  background?: { item: string; opts?: unknown };
}

export interface ActorSpec {
  rig: string;                               // catalog id: 'character.bean'
  at: [number, number] | string;             // world point, or a layout mark name
  color?: string; scale?: number; flip?: boolean;
  wear?: string[];                           // 'wardrobe.hat.bowler'
  speaker?: string;                          // cast id; the mouth flaps while this speaker talks
}

export interface Action extends ActionSpec {   // ActionSpec: at, dur, payoff, hold, sfx (studio-design B3)
  do: Do;
}

export type Do =
  | { move: string; from?: [number, number] | string; to: [number, number] | string; arc?: number; ease?: Ease }
  | { pose: string; actor: string }                       // 'pose.bean.sulk' over the action's progress
  | { face: string; actor: string }                       // an expression, switched at start
  | { fade: string; to: number }                          // actor or prop alpha
  | { pop: { label: string; at: [number, number] | string; style?: string } }
  | { mark: 'fail' | 'check' | 'strike'; at: string }     // a symbol, by catalog id
  | { prop: string; set: Record<string, number> }         // tween a prop's numeric options
  | { camera: Cam | { frame: string[]; z?: number } };
```

Anchors are word-named (`at: at({ word: 'ghost' }, -0.4)`), studio-design decision 1(b): the writer's text stays clean, and a reworded line that drops the word fails the build with the beat id.

## The ghost beat as a spec

```ts
// videos/what-a-mind-is-made-of/scenes/01-physics.shots.ts
ghost: {
  actors: { ghost: { rig: 'character.ghost', at: 'offRight' } },
  props:  { chain: { item: 'prop.dominoChain', at: 'chain' } },
  actions: {
    ghostEnter: { at: at({ word: 'ghost' }, -0.4), dur: 1.2, sfx: [['start', 'boo']],
                  do: { move: 'ghost', to: 'ghostHome', ease: 'out' } },
    ghostNudge: { at: after('ghostEnter'), dur: 0.6, do: { move: 'ghost', to: 'ghostNudge' } },
    ghostPass:  { at: after('ghostNudge'), dur: 0.8, sfx: [['start', 'whoosh']],
                  do: { move: 'ghost', to: 'ghostThrough', arc: 0.5 } },
    ghostFail:  { at: after('ghostPass', 0.1), dur: 0.4, payoff: true, sfx: [['start', 'fail']],
                  do: { mark: 'fail', at: 'chainTop' } },
    ghostSulk:  { at: after('ghostPass', 1.0), dur: 1.0, hold: 'none',
                  do: { pose: 'pose.ghost.sulk', actor: 'ghost' } },
  },
  camera: { x: 1560, y: 404, z: 1.62 },
},
```

Marks (`offRight`, `ghostHome`, `chain`) come from the chapter's layout file, as today (`01-physics.layout.ts`). With `shot.visitorTry` from the library ([libraries/shots.md](libraries/shots.md)) the same beat is one line.

## How it compiles

```ts
// packages/engine/src/shot/compile.ts  (pure)
export function compileShot(spec: ShotSpec, layout: Layout, lib: LibraryIndex): Scene['draw'];
```

Per frame, in order:

1. `state = actorStates(spec, S)`: for each actor, fold every action that targets it. A `move` contributes `lerp(from, to, ease(S.act(name)))`. A `pose` contributes `pose(S.act(name))`. A `fade` contributes alpha. Later actions override earlier ones on the same field. Pure: a function of `S` and the spec.
2. Draw background, props (with tweened options), actors (rig draw with `wear`), marks and pops (a `pop` draws from `S.act(name)` with the engine's pop curve), in that order.
3. Camera: a `frame` camera computes the bounding box of the named actors at this `S` and returns the `Cam` that fits it with `pad`. It is a `CamFn`, so `camera.ts` eases it as today.

Nothing here keeps state between frames. `compileShot` runs once at boot; the returned `draw` is the same shape every scene has now (`(S, cam, T) => void`). A chapter mixes spec beats and hand-drawn beats: `scenes/01-physics.ts` becomes `{ ...compileChapter(physicsShots), custom: physicsDraw }` where `physicsDraw` handles beats the spec cannot.

## How the sync engine fits

The sync engine (studio-design Part B) is the "when": word timings, anchors, action resolution, the beat length rule, `S.act` and `S.sinceAct`. Authoring adds `do` to each action and the actors the actions move. The timeline reads `actions` from the spec exactly as it reads `.actions.ts` today; `VideoData.shots` is the source, `VideoData.actions` is derived from it. A video with hand-drawn scenes keeps `.actions.ts` and `S.act` in its own code. Both roads end at the same `Timeline`.

## What the animator writes after this

For a spec beat: the shot entry and, if needed, a layout mark. For a hand-drawn beat: `S.act` and `S.sinceAct`, never a number. The brief's check: a grep of `scenes/` for `since(` minus a constant fails the build (studio-design B6 step 5).

## Boards

A storyboard panel for a beat is a `ShotSpec` with no actions and a `purpose` string. The board renderer draws it. When the animator fills in actions, the same object becomes the shot. The board is not thrown away; it grows up. That is what makes the reel the film.

## Open questions

1. `frame` cameras: compute per frame from actor positions, or bake at compile time from the spec's extremes? Recommend per frame, clamped to the chapter's world bounds; it is cheap and keeps the actor in view through a pose.
2. Mixing spec beats and hand-drawn beats in one chapter: allowed for the migration, or do we require a chapter to be all one kind? Recommend allowed; the physics chapter proves it in stage 5.
