/**
 * The one config both consumers import: the Tailwind plugin (build time) and
 * the tailwind-merge `cn()` (browser). Four surfaces, each a small family of
 * utilities. Layer order is paint order in `box-shadow`.
 *
 * `y` is the axis the light travels along. For an inset layer a positive `y`
 * exposes a band along the TOP edge (the light comes from above), a negative
 * one along the BOTTOM. The `dark` block is not "the light values dimmed":
 * on a dark page the white highlight has to almost vanish while the shadow
 * grows long and soft, or the surface reads as a lit dome on black.
 */
import { defineSurfaces } from "@exegia/specular"

export const surfaces = defineSurfaces({
  /** The classic emboss: highlight on the top edge, shadow on the bottom. */
  bezel: {
    layers: {
      lit: { color: "#fff", y: 2, blur: 3, alpha: 80, dark: { y: 1, blur: 1, alpha: 7 } },
      dim: { color: "#000", y: -1, blur: 2, alpha: 15, dark: { y: -6, blur: 10, alpha: 45 } },
    },
  },

  /** A raised card: hairline highlight inside, soft drop shadow outside. */
  card: {
    layers: {
      lit: { inset: true, color: "#fff", y: 1, alpha: 70, dark: { alpha: 8 } },
      drop: { inset: false, color: "#000", y: 4, blur: 10, alpha: 12, dark: { blur: 16, alpha: 55 } },
    },
  },

  /** A recessed well: shadow cast into the top, a bright lip along the bottom. */
  well: {
    layers: {
      shade: { inset: true, color: "#000", y: 2, blur: 4, alpha: 20, dark: { blur: 6, alpha: 60 } },
      lip: { inset: true, color: "#fff", y: -1, alpha: 70, dark: { alpha: 8 } },
    },
  },

  /** Neon: a thin inner edge plus an outer halo that sits at alpha 0 until hovered. */
  glow: {
    layers: {
      edge: { inset: true, color: "#fff", y: 1, alpha: 40, dark: { alpha: 15 } },
      halo: { inset: false, color: "#6366f1", blur: 20, spread: 1, alpha: 0 },
    },
  },
})

export type AppSurfaces = typeof surfaces
