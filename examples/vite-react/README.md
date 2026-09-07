# @exegia/specular — example app

A single-page showcase of everything the library does, built with Vite, React 19
and Tailwind v4. Every disc, button and card on the page is a `box-shadow`
produced by the plugin; nothing uses gradients, borders or pseudo-elements.

```bash
# from the repository root
make example-dev        # builds the library, installs the example, starts Vite on :5173
make example-build      # the same, but a production build into examples/vite-react/dist
```

Or by hand:

```bash
npm ci && npm run build                       # the library → dist/
cd examples/vite-react && npm ci && npm run dev
```

The example depends on the library as `"@exegia/specular": "file:../.."`, so it
always runs against the source in this checkout. Rebuild the root (`npm run
build`) after changing `src/` and Vite picks it up.

## What is on the page

| section | shows |
|---|---|
| **Hero** | `usePointerLight` + `<Rim>`: a sphere whose highlight follows the cursor, and four dampings side by side |
| **01 Surfaces** | the four surfaces this app declares (`bezel`, `card`, `well`, `glow`); flat vs lit; buttons, inputs, a pill group and a switch built from them; `@apply` in `@layer components` |
| **02 Direction** | `-t-` / `-b-` / `-l-` / `-r-` offsets (the letter names the edge the light enters from), depth in integers, decimals and arbitrary lengths, `spread` from a hairline to a ring |
| **03 Intensity** | alpha ladders for the highlight and the shadow, blur ladders, and a playground whose sliders write the *preset* tier as inline custom properties |
| **04 Colour** | tinting the layers to the fill (`bezel-lit-color-amber-50`), "metal and gems" on dark fills, and the `glow` surface: a coloured outer halo at alpha 0 that fades in on hover |
| **05 Alive** | hover lifts a card, press sinks a button, the bezel offset itself turns toward the pointer (instance tier written inline), six pointer-lit rims, and 48 tiles on one listener via `mode: "var"` |
| **06 Tone** | `useRimTone` + `toneToAlphas` on dark and light images, fixed alphas versus measured |
| **07 cn()** | stock `twMerge` against `createCn(surfaces)` on five inputs, dropped classes struck through |

The header switch toggles `.dark` on `<html>`. The dark look comes entirely from
the `dark` blocks in `specular.config.ts`: no element on the page carries a
`dark:` class for its bezel.

## Files

```
specular.config.ts   defineSurfaces(...) — the one config both consumers import
specular.plugin.ts   createPlugin(surfaces) — loaded by @plugin in src/index.css
src/index.css        @import "tailwindcss"; @plugin "../specular.plugin.ts"; the .btn @apply
src/lib/cn.ts        createCn(surfaces)
src/components/      Swatch (a shape + the classes under it), LitAvatar (bezel + Rim + tone), Demo, Code, ThemeToggle
src/sections/        one file per section above
vite.config.ts       resolve.dedupe for react — see the comment there
```

## Two things worth knowing

- **`bezel-base` versus `bezel-lit`.** `S-base` is the surface exactly as
  configured: every layer at the alpha, blur and offset in the config, and the
  dark presets apply. The bare layer class `S-L` sets *that layer's alpha to
  100*, which overrides both the configured alpha and the dark preset. This app
  therefore uses `-base` wherever it means "the default look" and `S-L/N` where
  it wants a specific alpha; `bezel-lit bezel-dim` appears once, labelled "full
  alpha".
- **`resolve.dedupe` in `vite.config.ts`.** `file:../..` links the package as a
  symlink and Vite resolves the linked files to their real path, from which a
  bare `import "react"` finds the repository's own devDependency copy, a
  second React. `dedupe` pins `react`, `react-dom` and `tailwind-merge` to this
  app's copies. A consumer installing from npm does not need it.
