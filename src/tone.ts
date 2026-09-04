"use client"

/**
 * Image tone sampling: how light is the band the rim overlays?
 */
import { useEffect, useState } from "react"

/** 16² px is enough to average a rim. */
export const TONE_SAMPLE_SIZE = 16
/** Pixels this far (in radii) from the centre count as rim — the band the
 * bezel sits on. Matches the ring's mask, which fades in from ~78%. */
export const TONE_RIM_RADIUS = 0.6

/**
 * Rec. 709 luma, 0 (black) → 1 (white), averaged over the pixels outside
 * `TONE_RIM_RADIUS × radius` of a `size × size` RGBA buffer. Pure, so the
 * maths is testable without a canvas.
 */
export function rimLuma(data: ArrayLike<number>, size = TONE_SAMPLE_SIZE): number | null {
  const centre = (size - 1) / 2
  const rim = TONE_RIM_RADIUS * centre
  let sum = 0
  let count = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centre
      const dy = y - centre
      if (dx * dx + dy * dy < rim * rim) continue
      const o = (y * size + x) * 4
      const r = data[o] ?? 0
      const g = data[o + 1] ?? 0
      const b = data[o + 2] ?? 0
      sum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      count++
    }
  }
  return count === 0 ? null : sum / count
}

/** Exported for tests. A `null` result is evicted so a later mount retries. */
export const toneCache = new Map<string, Promise<number | null>>()

/**
 * Average perceived lightness of an image's outer band, or `null` when it
 * cannot be measured: no DOM/canvas (SSR), a decode failure, or a host
 * without CORS headers (a tainted canvas throws on `getImageData`). The
 * image's own `<img>` is untouched, so a non-CORS host still displays.
 * Memoised per `src`; a `null` is not kept.
 */
export function measureRimTone(src: string): Promise<number | null> {
  const cached = toneCache.get(src)
  if (cached) return cached
  const promise = new Promise<number | null>((resolve) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      resolve(null)
      return
    }
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.decoding = "async"
    image.onerror = () => resolve(null)
    image.onload = () => {
      try {
        const size = TONE_SAMPLE_SIZE
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext("2d", { willReadFrequently: true })
        if (!context) {
          resolve(null)
          return
        }
        context.drawImage(image, 0, 0, size, size)
        resolve(rimLuma(context.getImageData(0, 0, size, size).data, size))
      } catch {
        resolve(null)
      }
    }
    image.src = src
  })
  toneCache.set(src, promise)
  void promise.then((tone) => {
    if (tone === null) toneCache.delete(src)
  })
  return promise
}

export type ToneAlphas = { hi: number; lo: number }
/** Alphas at tone 0 (a black rim) and tone 1 (a white rim); linear between. */
export type ToneEnds = { dark: ToneAlphas; light: ToneAlphas }

/** Tuned by eye on a dark and a light photo in both themes. */
export const DEFAULT_TONE_ENDS: ToneEnds = { dark: { hi: 0.7, lo: 0.6 }, light: { hi: 1, lo: 0.2 } }

/**
 * Against a dark rim the white highlight glares, so it eases off and the
 * shadow pushes up; against a pale rim the reverse. `tone` is clamped to
 * [0, 1]. Defaults: `{ hi: 0.7 + 0.3t, lo: 0.6 − 0.4t }`.
 */
export function toneToAlphas(tone: number, ends: ToneEnds = DEFAULT_TONE_ENDS): ToneAlphas {
  const t = Math.min(1, Math.max(0, tone))
  return {
    hi: ends.dark.hi + (ends.light.hi - ends.dark.hi) * t,
    lo: ends.dark.lo + (ends.light.lo - ends.dark.lo) * t,
  }
}

/**
 * `measureRimTone` as state. Resets to `null` whenever `src` changes so a
 * stale tone never lights the new image for a frame; a slow sample that
 * lands after a change is dropped. Pass `enabled = status === "loaded"`.
 */
export function useRimTone(src: string | undefined, enabled = true): number | null {
  const [tone, setTone] = useState<number | null>(null)
  useEffect(() => {
    setTone(null)
    if (!enabled || !src) return
    let cancelled = false
    void measureRimTone(src).then((t) => {
      if (!cancelled) setTone(t)
    })
    return () => {
      cancelled = true
    }
  }, [src, enabled])
  return tone
}
