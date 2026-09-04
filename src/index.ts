/**
 * `defineSurfaces()` — the shared module.
 *
 * Both the Tailwind plugin (`@exegia/bezel/plugin`) and the tailwind-merge
 * generator (`@exegia/bezel/merge`) consume the same surface config. It has
 * to be a JS module because `@plugin` options are flat scalars only and
 * tailwind-merge runs in the browser where `@plugin` options do not exist.
 * One source of truth, two consumers.
 */

export type Length = number | string

export type LayerConfig = {
  /** `false` = an outer drop layer. Default `true`. */
  inset?: boolean
  /** Default `#fff` for the first layer, `#000` after. */
  color?: string
  /** px when a number, any CSS length as a string. Default 0. */
  x?: Length
  y?: Length
  blur?: Length
  /** The knob that turns a hairline into a ring. Default 0. */
  spread?: Length
  /** 0–100. Default 100. */
  alpha?: number
  /**
   * Dark-mode preset, emitted under `darkSelector`.
   *
   * Dark mode is not the light values dimmed. On a dark page the white
   * highlight has to all but vanish (5% against 80%) while the shadow grows
   * long and soft (8px against 1px), or the disc reads as a lit dome on black.
   */
  dark?: Partial<Omit<LayerConfig, "inset" | "dark">>
}

export type SurfaceConfig = {
  /** Paint order in `box-shadow` is map order. */
  layers: Record<string, LayerConfig>
  /** Default `${surface}-base`. */
  baseClass?: string
  /** Where the `dark` presets land. A selector, or an at-rule prelude
   * (`@media (prefers-color-scheme: dark)`) which wraps `:root`. Default `.dark`. */
  darkSelector?: string
  /** Only for migrating an existing `inset-shadow-*` family in place. */
  allowCoreCollision?: boolean
}

export type Surfaces = Record<string, SurfaceConfig>

/** Tailwind roots our utilities would shadow — and that tailwind-merge would
 * fold ours into (§6). */
const CORE_ROOTS = new Set([
  "shadow",
  "inset-shadow",
  "ring",
  "inset-ring",
  "blur",
  "drop-shadow",
  "text-shadow",
  "outline",
])

/** Layer names that would collide with the all-layer / base utilities. */
const RESERVED_LAYERS = new Set(["blur", "spread", "base", "color"])

const BAD_NAME = /[/:\s]|[A-Z]/

export function defineSurfaces<const T extends Surfaces>(surfaces: T): T {
  for (const [surface, config] of Object.entries(surfaces)) {
    if (BAD_NAME.test(surface))
      throw new Error(`bezel: surface "${surface}" may not contain "/", ":", whitespace or uppercase`)
    if (CORE_ROOTS.has(surface) && !config.allowCoreCollision)
      throw new Error(
        `bezel: surface "${surface}" collides with a core Tailwind root; set allowCoreCollision: true only to migrate an existing family in place`
      )
    const layers = Object.keys(config.layers)
    if (layers.length === 0) throw new Error(`bezel: surface "${surface}" declares no layers`)
    for (const layer of layers) {
      if (BAD_NAME.test(layer))
        throw new Error(`bezel: layer "${surface}.${layer}" may not contain "/", ":", whitespace or uppercase`)
      if (RESERVED_LAYERS.has(layer))
        throw new Error(`bezel: layer "${surface}.${layer}" is reserved (blur, spread, base, color)`)
    }
  }
  return surfaces
}

// ── Resolved model, shared by plugin and merge ────────────────────────────────

export type ResolvedLayer = {
  name: string
  inset: boolean
  color: string
  x: string
  y: string
  blur: string
  spread: string
  alpha: string
  dark: Partial<Record<"color" | "x" | "y" | "blur" | "spread" | "alpha", string>>
}

export type ResolvedSurface = {
  name: string
  baseClass: string
  darkSelector: string
  layers: ResolvedLayer[]
}

export const LAYER_PROPS = ["x", "y", "blur", "spread", "color", "alpha"] as const
export type LayerProp = (typeof LAYER_PROPS)[number]

export function length(v: Length | undefined, fallback = "0"): string {
  if (v === undefined) return fallback
  if (typeof v === "number") return v === 0 ? "0" : `${v}px`
  return v
}

export function resolveSurfaces(surfaces: Surfaces): ResolvedSurface[] {
  return Object.entries(surfaces).map(([name, config]) => ({
    name,
    baseClass: config.baseClass ?? `${name}-base`,
    darkSelector: config.darkSelector ?? ".dark",
    layers: Object.entries(config.layers).map(([layer, l], i) => {
      const dark: ResolvedLayer["dark"] = {}
      if (l.dark) {
        if (l.dark.color !== undefined) dark.color = l.dark.color
        if (l.dark.x !== undefined) dark.x = length(l.dark.x)
        if (l.dark.y !== undefined) dark.y = length(l.dark.y)
        if (l.dark.blur !== undefined) dark.blur = length(l.dark.blur)
        if (l.dark.spread !== undefined) dark.spread = length(l.dark.spread)
        if (l.dark.alpha !== undefined) dark.alpha = String(l.dark.alpha)
      }
      return {
        name: layer,
        inset: l.inset ?? true,
        color: l.color ?? (i === 0 ? "#fff" : "#000"),
        x: length(l.x),
        y: length(l.y),
        blur: length(l.blur),
        spread: length(l.spread),
        alpha: String(l.alpha ?? 100),
        dark,
      }
    }),
  }))
}
