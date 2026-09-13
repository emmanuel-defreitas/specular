"use client"

/**
 * Pointer → bearing, shared across every lit surface on the page.
 *
 * One window `pointermove` listener and one rAF per frame flush a registry
 * of subscribers, so fifty avatars are one handler, not fifty. Each
 * subscriber keeps its own unwrapped angle so `rotate()` never spins the
 * long way round.
 */
import { useEffect, useState, type RefObject } from "react"

/** Below this the write is skipped: a rim cannot show a sub-degree change. */
export const ANGLE_EPSILON = 1.5

/** Bearing of (x, y) from (cx, cy): 0 = 12 o'clock, clockwise grows. */
export function bearingFrom(cx: number, cy: number, x: number, y: number): number {
  // atan2 measures from 3 o'clock anticlockwise-positive in screen space.
  return ((Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90 + 360) % 360
}

/**
 * Step from `last` toward `bearing` along the shortest arc. The result is
 * continuous (it may exceed 360 or go negative). `null` when the move is
 * under `ANGLE_EPSILON`. A NaN `last` means "no previous value".
 */
export function unwrap(last: number, bearing: number): number | null {
  if (Number.isNaN(last)) return bearing
  let delta = bearing - (((last % 360) + 360) % 360)
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  if (Math.abs(delta) < ANGLE_EPSILON) return null
  return last + delta
}

type Subscriber = {
  target: () => Element | null
  last: number
  emit: (angle: number) => void
  damping: number
}

const subscribers = new Set<Subscriber>()
let frame = 0
let pointer: { x: number; y: number } | null = null

function flush(): void {
  frame = 0
  if (!pointer) return
  let unsettled = false
  for (const s of subscribers) {
    const el = s.target()
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) continue
    const bearing = bearingFrom(rect.left + rect.width / 2, rect.top + rect.height / 2, pointer.x, pointer.y)
    if (s.damping >= 1) {
      const next = unwrap(s.last, bearing)
      if (next === null) continue
      s.last = next
      s.emit(next)
      continue
    }
    // Damped: ease along the shortest arc each frame, self-scheduling until
    // the residual is under a degree. `last` stays continuous.
    if (Number.isNaN(s.last)) {
      s.last = bearing
      s.emit(bearing)
      continue
    }
    let d = bearing - (((s.last % 360) + 360) % 360)
    if (d > 180) d -= 360
    if (d < -180) d += 360
    if (Math.abs(d) <= ANGLE_EPSILON) {
      s.last = bearing
      continue
    }
    const moved = s.last + d * s.damping
    s.last = moved
    s.emit(moved)
    if (Math.abs(d) * (1 - s.damping) > 0.5) unsettled = true
  }
  if (unsettled && frame === 0) frame = requestAnimationFrame(flush)
}

function onMove(event: PointerEvent): void {
  pointer = { x: event.clientX, y: event.clientY }
  if (frame === 0) frame = requestAnimationFrame(flush)
}

/** Register a target; the listener exists only while the set is non-empty. */
export function subscribe(target: () => Element | null, emit: (angle: number) => void, damping = 1): () => void {
  const sub: Subscriber = { target, last: Number.NaN, emit, damping }
  if (subscribers.size === 0) window.addEventListener("pointermove", onMove, { passive: true })
  subscribers.add(sub)
  return () => {
    subscribers.delete(sub)
    if (subscribers.size === 0) {
      window.removeEventListener("pointermove", onMove)
      if (frame !== 0) cancelAnimationFrame(frame)
      frame = 0
    }
  }
}

/** For tests. */
export const subscriberCount = (): number => subscribers.size

const REDUCE = "(prefers-reduced-motion: reduce)"

/** `false` on the server and on first render; tracks the media query after. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const mq = window.matchMedia(REDUCE)
    const update = () => setReduce(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduce
}

export type PointerLightOptions =
  | { mode?: "state"; enabled?: boolean; damping?: number }
  | { mode: "var"; property?: string; enabled?: boolean; damping?: number }

/**
 * `mode: "state"` (default) returns the raw bearing and re-renders on change.
 * `mode: "var"` writes `<property>: <angle>deg` (default `--light-angle`) on
 * the element with `style.setProperty` and never re-renders — the escape
 * hatch for lists. Damping stays with the consumer: `rotate(angle * 0.8)`.
 * Reduced motion: no subscription, `0`.
 */
export function usePointerLight(ref: RefObject<Element | null>, options?: { mode?: "state"; enabled?: boolean; damping?: number }): number
export function usePointerLight(ref: RefObject<Element | null>, options: { mode: "var"; property?: string; enabled?: boolean; damping?: number }): void
export function usePointerLight(ref: RefObject<Element | null>, options: PointerLightOptions = {}): number | undefined {
  const [angle, setAngle] = useState(0)
  const reduce = useReducedMotion()
  const enabled = options.enabled ?? true
  const mode = options.mode ?? "state"
  const damping = options.damping ?? 1
  const property = options.mode === "var" ? (options.property ?? "--light-angle") : null

  useEffect(() => {
    if (!enabled || reduce) return
    const emit =
      property === null
        ? setAngle
        : (a: number) => (ref.current as HTMLElement | null)?.style.setProperty(property, `${a}deg`)
    return subscribe(() => ref.current, emit, damping)
  }, [enabled, reduce, property, ref, damping])

  return mode === "state" ? angle : undefined
}
