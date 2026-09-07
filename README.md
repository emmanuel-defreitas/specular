# @exegia/specular

Specular lighting for Tailwind v4 + React: a highlight that tracks the pointer.
Declare a surface, get a utility
family that draws a two-layer inset "bezel" one axis at a time, a
tailwind-merge config that keeps those utilities alive in `cn()`, and React
primitives that light the surface with the pointer.

| export | contents |
|---|---|
| `@exegia/specular` | `defineSurfaces` + types — the shared module both consumers import |
| `@exegia/specular/plugin` | `createPlugin(surfaces)` — Tailwind v4 plugin factory, pure JS |
| `@exegia/specular/merge` | `mergeConfig(surfaces)`, `createCn(surfaces)` — tailwind-merge |
| `@exegia/specular/react` | `usePointerLight`, `<Rim>`, `measureRimTone`, `toneToAlphas`, `useRimTone` |

Peers: `tailwindcss@^4.1 <5`; `react@^19` and `tailwind-merge@^3` only if you
use `/react` or `/merge`. No runtime dependencies.

## Setup

One config, two consumers. It has to be a JS module: `@plugin` options are
flat scalars only, and tailwind-merge runs in the browser.

```ts
// bezel.config.ts
import { defineSurfaces } from "@exegia/specular"

export const surfaces = defineSurfaces({
  bezel: {
    layers: {
      lit: { color: "#fff", y: 2, blur: 3, alpha: 80, dark: { y: 1, blur: 1, alpha: 5 } },
      dim: { color: "#000", y: -1, blur: 2, alpha: 15, dark: { y: -8, alpha: 20 } },
    },
  },
  card: {
    layers: {
      lit:  { inset: true,  color: "#fff", y: 1, alpha: 60 },
      drop: { inset: false, color: "#000", y: 4, blur: 8, alpha: 15 },
    },
  },
})
```

```js
// tailwind.plugin.js
import { createPlugin } from "@exegia/specular/plugin"
import { surfaces } from "./bezel.config"
export default createPlugin(surfaces)
```

```css
@import "tailwindcss";
@plugin "./tailwind.plugin.js";
```

```ts
// lib/utils.ts
import { createCn } from "@exegia/specular/merge"
import { surfaces } from "./bezel.config"
export const cn = createCn(surfaces)
```

Then: `<div class="bezel-lit bezel-dim rounded-full" />`. The `dark` blocks
land in a `.dark { --bezel-lit-y: … }` token block, so the element carries no
`dark:` classes. Set `darkSelector` per surface for other strategies
(`"@media (prefers-color-scheme: dark)"` wraps `:root`).

### Layer config

```ts
type LayerConfig = {
  inset?: boolean          // default true; false = outer drop layer
  color?: string           // default "#fff" for the first layer, "#000" after
  x?: number | string      // px number or any CSS length; default 0
  y?: number | string
  blur?: number | string   // default 0
  spread?: number | string // default 0 — the knob that turns a hairline into a ring
  alpha?: number           // 0-100, default 100
  dark?: Partial<Omit<LayerConfig, "inset" | "dark">>
}
```

Layer order in the map is paint order in `box-shadow`. `defineSurfaces` throws
on a surface named after a core Tailwind root (`shadow`, `inset-shadow`,
`ring`, `blur`, …), on names with `/`, `:`, whitespace or uppercase, and on a
layer named `blur`, `spread`, `base` or `color`.

> Dark mode is not the light values dimmed. On a dark page the white highlight
> has to all but vanish (5% against 80%) while the shadow grows long and soft
> (8px against 1px), or the disc reads as a lit dome on black.

## Utilities

For a surface `S` and a layer `L`. Every utility also emits the base
`box-shadow`, so any single class stands alone.

| utility | writes |
|---|---|
| `S-base` (or `baseClass`) | `box-shadow: var(--tw-S-shadow)` |
| `S-L` | `--tw-S-L-alpha: 100` |
| `S-L/40`, `S-L/[0.4]` | `--tw-S-L-alpha: 40` (fractions are scaled; `/80` ≡ `/[0.8]`) |
| `S-L-t-N` | `--tw-S-L-y: calc(N * 1px)` — light enters from the top, pushes the layer down |
| `S-L-b-N` | `--tw-S-L-y: calc(N * -1px)` |
| `S-L-l-N` / `S-L-r-N` | `--tw-S-L-x` |
| `S-L-blur-N`, `S-L-spread-N` | `--tw-S-L-blur`, `--tw-S-L-spread` |
| `S-L-color-red-500`, `S-L-color-[#fff]` | `--tw-S-L-color` |
| `S-blur-N`, `S-spread-N` | every layer at once |

`N` is a bare integer, a decimal, or `[<length>]`. `-t-`/`-b-` write the same
variable, as do `-l-`/`-r-`: pick one per layer per axis. `-t-[2]` passes
through as the unitless `2`, which is invalid in `box-shadow` — core behaves
the same.

### How it works: three tiers

| tier | name | set by | inherits |
|---|---|---|---|
| composed | `--tw-S-shadow` | universal selector in `@layer base` | set everywhere |
| instance | `--tw-S-L-{x,y,blur,spread,color,alpha}` | utilities; `@property { syntax: "*"; inherits: false }`, no `initial-value` | no |
| preset | `--S-L-{…}` | the `dark` block, or your CSS | yes |

Each component is `var(--tw-S-L-y, var(--S-L-y, <default>))`: the utility's
value if set on this element, else the inherited preset, else the config
default. Registering the instance tier without an `initial-value` gives it
the guaranteed-invalid value, so `var()` falls through; `inherits: false`
stops a nested bezel from picking up its ancestor's offsets. Verified in
Chromium 152 (a registered `--x: 20px` on the parent leaves the child at the
fallback; an unregistered one leaks). Not yet verified in WebKit — if it
ever leaks there, drop the `@property` block and everything else still works.

## `cn()` and why the merge config ships here

`twMerge("inset-shadow-lit-t-2 inset-shadow-dim-b-1")` with stock
tailwind-merge returns `"inset-shadow-dim-b-1"`: any custom utility whose
name shares a prefix with a core group is filed under that group and only the
last survives. That shipped once — the CSS compiled, a `toContain` test
passed on the survivor, and the lit layer never reached the screen.

`mergeConfig(surfaces)` generates one class group per custom property,
bidirectional conflicts with core `shadow`/`inset-shadow`, all-layer groups
that displace their per-layer twins, and the full cross-surface matrix (two
surfaces on one element means one `box-shadow` wins outright). Group ids are
a template-literal union, so a typo in your own `conflictingClassGroups` is a
compile error.

`createCn` accepts what tailwind-merge accepts (strings, arrays, falsy). For
clsx's object form: `extendTailwindMerge(mergeConfig(surfaces))(clsx(...))`.

## React

Every entry carries `"use client"`. SSR renders the static emboss; nothing
touches `window` at module scope.

```tsx
import { usePointerLight, Rim, useRimTone, toneToAlphas } from "@exegia/specular/react"

function Avatar({ src }: { src: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const angle = usePointerLight(ref)               // raw bearing, 0 = 12 o'clock
  const tone = useRimTone(src)                     // 0–1 rim lightness, or null
  const alphas = tone === null ? undefined : toneToAlphas(tone)
  return (
    <span ref={ref} className="relative size-16 rounded-full bezel-lit bezel-dim">
      <img src={src} className="size-full rounded-full" />
      <Rim angle={angle * 0.8} hi={alphas?.hi} lo={alphas?.lo} className="rounded-full" />
    </span>
  )
}
```

- **`usePointerLight(ref, options?)`** — one shared window listener and one
  rAF per frame for every subscriber on the page; 1.5° epsilon; shortest-arc
  unwrapping so `rotate()` never spins the long way round; no subscription
  under `prefers-reduced-motion`. Damping is yours (`angle * 0.8`).
  `{ mode: "var", property: "--light-angle" }` writes `<angle>deg` on the
  element with no re-render — the escape hatch for lists.
- **`<Rim>`** — the masked conic sweep, `rotate()` as the animated property,
  radius-relative mask so it reads the same at 32px and 64px. Radius is
  yours: pass `rounded-full`. Alphas come from `--rim-hi-a` / `--rim-lo-a`
  (light 1 / 0.2 baked in; the plugin emits the dark 0.18 / 0.4 block).
- **`measureRimTone(src)`** — Rec. 709 luma over the outer band of a 16×16
  sample; `null` on SSR, decode error or a host without CORS headers;
  memoised per `src`, a `null` is evicted so a later mount retries.
- **`toneToAlphas(t, ends?)`** — `{ hi: 0.7 + 0.3t, lo: 0.6 − 0.4t }`,
  retunable through `ends`.

## Things worth knowing

- **An inset shadow paints under the root's children.** A `size-full` image
  hides it. That is why `<Rim>` is a separate overlay, and why a fallback
  must stay transparent for the emboss to show.
- **The family owns `box-shadow`.** Never pair a surface with `shadow-*` or
  `ring-*`; `cn()` deletes one, and raw class strings leave the stylesheet to
  pick an arbitrary winner.
- **`S-blur-N` and `S-L-blur-N` write the same var.** In the stylesheet (and
  in `@apply`) the winner is Tailwind's sort order, not class order. `cn()`
  resolves it: all-layer displaces per-layer.
- **Browser floor: `color-mix()`** (Chrome 111, Safari 16.2, Firefox 113).
  Tailwind's fallback branch drops the alpha, so below that the surface
  paints opaque. Accepted: all three are 2023.
- **`@apply` of a surface inside `@layer components` works.**
- **Opposite edges of one layer overwrite; they do not add.** Two layers is
  the way to light two edges.

## Migrating an existing `inset-shadow-*` family

A surface named `inset-shadow` with `baseClass: "inset-shadow-bezel"`,
`allowCoreCollision: true` and layers `lit` / `dim` reproduces the class API
exactly (`inset-shadow-lit-t-3 inset-shadow-lit/80 …`), and the merge config
handles the core collision. The tests cover this shape class by class.

## Example app

`examples/vite-react` is a Vite + React 19 + Tailwind v4 page that walks
through every surface, offset, alpha, blur and colour utility, the `glow`
hover halo, the pointer-lit rims and the `cn()` merge. It runs against the
library in this checkout:

```bash
make example-dev       # build the library, install the example, start Vite
make example-build     # production build, what CI runs
```

See [`examples/vite-react/README.md`](examples/vite-react/README.md) for what
each section shows.

## Development

```bash
make ci        # lint (tsc), build, test, smoke
make help      # every target, including the release pipeline
```

Tests run on `node --test` with no framework. The Tailwind harness compiles
in memory in under a second. See `.github/WORKFLOW.md` for branching and
releases.
