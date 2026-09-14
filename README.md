# @exegia/specular

Pointer-following rim highlights and inset bezel utilities for Tailwind v4 + React.

[npm](https://www.npmjs.com/package/@exegia/specular) · [live examples](https://emmanuel-defreitas.github.io/specular/) · [MIT](LICENSE)

## Install

```bash
bun add @exegia/specular
```

## Tailwind

Declare the surfaces once, then share them with the Tailwind plugin and `cn()`.

```ts
// specular.config.ts
import { defineSurfaces } from "@exegia/specular"

export const surfaces = defineSurfaces({
  bezel: {
    layers: {
      lit: { color: "#fff", y: 2, blur: 3, alpha: 80, dark: { y: 1, blur: 1, alpha: 5 } },
      dim: { color: "#000", y: -1, blur: 2, alpha: 15, dark: { y: -8, alpha: 20 } },
    },
  },
})
```

```js
// tailwind.plugin.js
import { createPlugin } from "@exegia/specular/plugin"
import { surfaces } from "./specular.config"

export default createPlugin(surfaces)
```

```css
@import "tailwindcss";
@plugin "./tailwind.plugin.js";
```

```tsx
<button className="rounded-lg bg-stone-200 px-4 py-2 bezel-base active:bezel-lit/20 active:bezel-dim/40">
  Press me
</button>
```

Utilities follow `surface-layer-modifier`: `bezel-base`, `bezel-lit/60`, `bezel-lit-t-2`, `bezel-dim-b-1`, `bezel-lit-blur-4`, and `bezel-spread-1`.

## `cn()`

Use the generated merge config when a component builds class names dynamically.

```ts
import { createCn } from "@exegia/specular/merge"
import { surfaces } from "./specular.config"

export const cn = createCn(surfaces)
```

## React

```tsx
import { Rim, usePointerLight } from "@exegia/specular/react"
import { useRef } from "react"

function Orb() {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)

  return (
    <div ref={ref} className="relative size-20 rounded-full bg-stone-300 bezel-base">
      <Rim angle={angle * 0.8} className="rounded-full" />
    </div>
  )
}
```

`usePointerLight(ref, { damping: 0.4 })` makes the rim follow more slowly. `Rim` also accepts `hi` and `lo` alpha overrides.

## API

- `@exegia/specular`: `defineSurfaces`, `litVars`
- `@exegia/specular/plugin`: `createPlugin`
- `@exegia/specular/merge`: `createCn`, `mergeConfig`
- `@exegia/specular/react`: `usePointerLight`, `Rim`, `measureRimTone`, `useRimTone`, `toneToAlphas`

## Development

```bash
make ci
make example-dev
```

The [example site](examples/vite-react) is the complete visual reference.
