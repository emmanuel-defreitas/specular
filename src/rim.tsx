"use client"

/**
 * The masked conic sweep that rotates toward the pointer.
 *
 *   <Rim angle={angle * 0.8} hi={0.7} lo={0.4} className="rounded-full" />
 *
 * An inset shadow paints under the root's children, so a `size-full` image
 * hides the emboss completely; this overlay sits above the image instead.
 * The gradient starts at 6 o'clock with the highlight peaking at 12, so
 * `rotate(angle)` puts the highlight exactly `angle` degrees clockwise from
 * 12. Rotation is the animated property, not the gradient's `from` angle:
 * `transform` transitions, a gradient angle does not. The mask is
 * radius-relative so the rim reads the same at 32px and 64px. Radius is the
 * consumer's: pass `rounded-full` or `rounded-[20px]`.
 */
import type { CSSProperties, HTMLAttributes } from "react"

import { useReducedMotion } from "./pointer-light.ts"

export type RimProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Degrees clockwise from 12 o'clock. Apply damping before passing. */
  angle?: number
  /** Highlight alpha, 0–1. Unset = `--rim-hi-a` (light 1, dark 0.18 via the plugin). */
  hi?: number
  /** Shadow alpha, 0–1. Unset = `--rim-lo-a` (light 0.2, dark 0.4 via the plugin). */
  lo?: number
}

const GRADIENT =
  "conic-gradient(from 180deg, var(--rim-lo) 0%, transparent 24%, transparent 28%, var(--rim-hi) 50%, transparent 72%, transparent 76%, var(--rim-lo) 100%)"
const MASK = "radial-gradient(farthest-side, transparent 78%, #000 92%)"
/** transitions.dev `--duration-quick` / `--ease-smooth-out`. */
export const RIM_TRANSITION = "transform 150ms cubic-bezier(0.22, 1, 0.36, 1)"

export function Rim({ angle = 0, hi, lo, style, ...rest }: RimProps) {
  const reduce = useReducedMotion()
  const vars: Record<string, string> = {
    "--rim-hi": "color-mix(in oklab, white calc(var(--rim-hi-a, 1) * 50%), transparent)",
    "--rim-lo": "color-mix(in oklab, black calc(var(--rim-lo-a, 0.2) * 50%), transparent)",
  }
  if (hi !== undefined) vars["--rim-hi-a"] = String(hi)
  if (lo !== undefined) vars["--rim-lo-a"] = String(lo)
  return (
    <span
      aria-hidden="true"
      data-slot="rim"
      {...rest}
      style={
        {
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: GRADIENT,
          maskImage: MASK,
          WebkitMaskImage: MASK,
          transition: reduce ? "none" : RIM_TRANSITION,
          transform: `rotate(${angle}deg)`,
          ...vars,
          ...style,
        } as CSSProperties
      }
    />
  )
}
