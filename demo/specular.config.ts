import { defineSurfaces } from "@exegia/specular";

/**
 * Shape-class surfaces in the lab01.dev lighting language: inset hairline
 * light, stacked contact/penumbra/umbra drop shadows, hairline ring. Dark is
 * not the light values dimmed — highlights nearly vanish, shadows deepen.
 */
export const surfaces = defineSurfaces({
  /** Card: hairline light inside, no outer drop. */
  card: {
    layers: {
      lit: { inset: true, color: "#fff", y: 1, blur: 1, alpha: 70, dark: { alpha: 15 } },
      ring: { inset: false, color: "#000", blur: 0, spread: 0.2, alpha: 14, dark: { alpha: 20 } },
      drop: { inset: false, color: "#000", y: 4, blur: 2, alpha: 4, dark: { blur: 10, alpha: 10 } },
    },
  },
  /** Pill or button: hairline ring, emboss, tight contact shadow. */
  btn: {
    layers: {
      lit: { inset: true, color: "#fff", y: 1, blur: 1, alpha: 90, dark: { alpha: 18 } },
      dim: { inset: true, color: "#000", y: -1, blur: 1, alpha: 18, dark: { alpha: 50 } },
      ring: { inset: false, color: "#000", blur: 0, spread: 0.2, alpha: 14, dark: { alpha: 50 } },
      drop: { inset: false, color: "#000", y: 2, blur: 4, alpha: 8, dark: { blur: 3, alpha: 25 } },
    },
  },
  /** Disc: emboss + contact shadow, tuned for 40-64px avatars. */
  round: {
    layers: {
      lit: { inset: true, color: "#fff", y: 1, blur: 0, alpha: 40, dark: { alpha: 15 } },
      dim: { inset: true, color: "#000", y: -1, blur: 1, alpha: 15, dark: { y: -1, blur: 2, alpha: 20 } },
      drop: { inset: false, color: "#000", y: 1, blur: 2, alpha: 10, dark: { blur: 4, alpha: 25 } },
    },
  },
});
