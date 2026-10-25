"use client"

import { Rim, toneToAlphas, usePointerLight, useRimTone } from "@exegia/specular/react"
import { useRef, type ReactNode } from "react"

import { cn } from "../lib/cn.ts"

/**
 * A circular surface whose rim highlight turns toward the pointer.
 *
 *   emboss   `bezel-base`            — the static two-layer inset shadow at its configured values
 *   rim      `<Rim>`                — the conic sweep, rotated to the bearing
 *   bearing  `usePointerLight(ref)` — 0 = 12 o'clock, clockwise; damped here
 */
export function LitAvatar({
  src,
  alt = "",
  damping = 0.8,
  tone = false,
  className,
  children,
}: {
  src?: string
  alt?: string
  /** Multiplier on the raw bearing. 1 = the highlight points straight at the cursor. */
  damping?: number
  /** Sample the image's outer band and tune the rim alphas to it. */
  tone?: boolean
  className?: string
  children?: ReactNode
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const angle = usePointerLight(ref)
  const measured = useRimTone(src, tone)
  const alphas = measured === null ? undefined : toneToAlphas(measured)
  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-300 bezel-base",
        className
      )}
    >
      {src && <img src={src} alt={alt} className="size-full rounded-full object-cover" draggable={false} />}
      {children}
      <Rim angle={angle * damping} {...(alphas ? { hi: alphas.hi, lo: alphas.lo } : {})} className="rounded-full" />
    </span>
  )
}
