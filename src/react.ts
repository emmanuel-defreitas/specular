"use client"

export { usePointerLight, useReducedMotion, ANGLE_EPSILON, type PointerLightOptions } from "./pointer-light.ts"
export { Rim, RIM_TRANSITION, type RimProps } from "./rim.tsx"
export {
  measureRimTone,
  toneToAlphas,
  useRimTone,
  DEFAULT_TONE_ENDS,
  type ToneAlphas,
  type ToneEnds,
} from "./tone.ts"
