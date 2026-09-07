/**
 * Tailwind v4 plugin factory. Pure JS, no CSS file: the whole utility family
 * for every surface comes out of `createPlugin(surfaces)`.
 *
 *   // tailwind.plugin.js
 *   import { createPlugin } from "@exegia/specular/plugin"
 *   import { surfaces } from "./bezel.config"
 *   export default createPlugin(surfaces)
 *
 *   // app.css
 *   @plugin "./tailwind.plugin.js";
 *
 * Three tiers of custom property make presets and dark mode work with no
 * `dark:` classes on the element:
 *
 *   composed  --tw-{S}-shadow          universal selector, @layer base
 *   instance  --tw-{S}-{L}-{prop}      utilities; @property { syntax: "*"; inherits: false }
 *   preset    --{S}-{L}-{prop}         darkSelector block / consumer CSS; inherits
 *
 * Each component in the composed string is `var(instance, var(preset, default))`.
 * The instance tier is registered WITHOUT an initial-value so its initial
 * value is the guaranteed-invalid value and `var()` falls through to the
 * preset; `inherits: false` keeps a nested surface from picking up its
 * ancestor's offsets (verified in Chromium, see README).
 */
import type { PluginAPI } from "tailwindcss/plugin"

import {
  LAYER_PROPS,
  resolveSurfaces,
  type LayerProp,
  type ResolvedLayer,
  type ResolvedSurface,
  type Surfaces,
} from "./index.ts"

/** Five selectors, not fewer: `file:bezel-lit-t-2` resolves to
 * `::file-selector-button`, which must see the hoisted var too. */
const UNIVERSAL = "*, ::before, ::after, ::backdrop, ::file-selector-button"

export type RimTokens = { hi: number; lo: number }

export type PluginOptions = {
  /**
   * `<Rim>` reads `--rim-hi-a` / `--rim-lo-a`. Light defaults are the
   * fallbacks baked into the component; the dark block is emitted here so a
   * consumer never writes `dark:` classes on the rim. `false` emits nothing.
   */
  rim?: { darkSelector?: string; dark?: RimTokens } | false
}

export const RIM_DARK_DEFAULTS: RimTokens = { hi: 0.18, lo: 0.4 }

type CssInJs = { [key: string]: string | string[] | CssInJs | CssInJs[] }
type Utility = (value: string, extra: { modifier: string | null }) => CssInJs

const BARE = /^\d+(\.\d+)?$/
const BARE_NEG = /^calc\(\d+(\.\d+)? \* -1px\)$/

/** `-t-2` → `calc(2 * 1px)`, `-t-1.5` → `calc(1.5 * 1px)`; `[0.5rem]` passes through. */
const bare = (u: { value: string }) => (BARE.test(u.value) ? `calc(${u.value} * 1px)` : undefined)
/** The opposite edge of the same axis. */
const bareNeg = (u: { value: string }) => (BARE.test(u.value) ? `calc(${u.value} * -1px)` : undefined)
const negate = (v: string) => (BARE_NEG.test(v) ? v : `calc(${v} * -1)`)

/**
 * `/80` and `/[0.8]` both mean 80%. Tailwind hands `/[0.8]` over as `0.8`,
 * which `calc(… * 1%)` would read as 0.8%, so a fraction is scaled up.
 */
export function normalizeAlpha(raw: string): string {
  const v = raw.replace(/^\[|\]$/g, "")
  if (/^0?\.\d+$/.test(v)) return String(Math.round(parseFloat(v) * 10000) / 100)
  return v
}

const instanceVar = (s: string, l: string, p: LayerProp) => `--tw-${s}-${l}-${p}`
const presetVar = (s: string, l: string, p: LayerProp) => `--${s}-${l}-${p}`

function chain(s: string, l: ResolvedLayer, p: LayerProp): string {
  return `var(${instanceVar(s, l.name, p)}, var(${presetVar(s, l.name, p)}, ${l[p]}))`
}

/** The whole `box-shadow` for one surface, every component a var chain. */
export function composedShadow(s: ResolvedSurface): string {
  return s.layers
    .map((l) => {
      const c = (p: LayerProp) => chain(s.name, l, p)
      return `${l.inset ? "inset " : ""}${c("x")} ${c("y")} ${c("blur")} ${c("spread")} color-mix(in srgb, ${c("color")} calc(${c("alpha")} * 1%), transparent)`
    })
    .join(", ")
}

/** A selector wraps the declarations; an at-rule prelude wraps `:root`. */
function darkBlock(selector: string, decls: Record<string, string>): CssInJs {
  return selector.startsWith("@") ? { [selector]: { ":root": decls } } : { [selector]: decls }
}

export function createPlugin(surfaces: Surfaces, options: PluginOptions = {}) {
  const resolved = resolveSurfaces(surfaces)
  const rim = options.rim === false ? null : { darkSelector: ".dark", dark: RIM_DARK_DEFAULTS, ...options.rim }

  return function bezel({ addBase, addUtilities, matchUtilities, theme }: PluginAPI): void {
    if (rim) {
      addBase(
        darkBlock(rim.darkSelector, { "--rim-hi-a": String(rim.dark.hi), "--rim-lo-a": String(rim.dark.lo) })
      )
    }

    for (const s of resolved) {
      const base: CssInJs = { "box-shadow": `var(--tw-${s.name}-shadow)` }

      // Composed tier, hoisted once. Tailwind splits the color-mix() into a
      // plain fallback plus an @supports branch; doing this per utility
      // would duplicate that pair per utility per surface.
      addBase({ [UNIVERSAL]: { [`--tw-${s.name}-shadow`]: composedShadow(s) } })

      // Instance tier. No initial-value on purpose (see the header).
      const registrations: CssInJs = {}
      for (const l of s.layers)
        for (const p of LAYER_PROPS)
          registrations[`@property ${instanceVar(s.name, l.name, p)}`] = { syntax: '"*"', inherits: "false" }
      addBase(registrations)

      // Preset tier: the dark block.
      const dark: Record<string, string> = {}
      for (const l of s.layers)
        for (const [p, v] of Object.entries(l.dark)) dark[presetVar(s.name, l.name, p as LayerProp)] = v
      if (Object.keys(dark).length > 0) addBase(darkBlock(s.darkSelector, dark))

      addUtilities({ [`.${s.baseClass}`]: base })

      // `values` is typed as a string record; the bare-value hook is the one
      // documented exception (`NamedUtilityValue` is not exported).
      const lengths = (neg: boolean) => ({
        type: ["number", "length"],
        values: { __BARE_VALUE__: neg ? bareNeg : bare } as unknown as Record<string, string>,
      })

      for (const l of s.layers) {
        const n = `${s.name}-${l.name}`
        const v = (p: LayerProp) => instanceVar(s.name, l.name, p)
        const set = (p: LayerProp, f: (value: string) => string = (x) => x): Utility =>
          (value) => ({ ...base, [v(p)]: f(value) })

        // Bare = full alpha; `/40` and `/[0.4]` = 40.
        matchUtilities(
          { [n]: (value, { modifier }) => ({ ...base, [v("alpha")]: normalizeAlpha(modifier ?? value) }) },
          { values: { DEFAULT: "100" }, modifiers: "any" }
        )
        // The letter names the edge the light enters from.
        matchUtilities(
          { [`${n}-t`]: set("y"), [`${n}-l`]: set("x"), [`${n}-blur`]: set("blur"), [`${n}-spread`]: set("spread") },
          lengths(false)
        )
        matchUtilities({ [`${n}-b`]: set("y", negate), [`${n}-r`]: set("x", negate) }, lengths(true))
        matchUtilities({ [`${n}-color`]: set("color") }, { type: ["color"], values: theme("colors") })
      }

      // All layers at once.
      const all = (p: LayerProp): Utility => (value) => ({
        ...base,
        ...Object.fromEntries(s.layers.map((l) => [instanceVar(s.name, l.name, p), value])),
      })
      matchUtilities({ [`${s.name}-blur`]: all("blur"), [`${s.name}-spread`]: all("spread") }, lengths(false))
    }
  }
}

export default createPlugin
