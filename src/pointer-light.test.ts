import assert from "node:assert/strict"
import { test } from "node:test"

import { bearingFrom, subscribe, subscriberCount, unwrap } from "./pointer-light.ts"

// A window with a recordable pointermove listener and a manual rAF.
const listeners = new Set<(e: { clientX: number; clientY: number }) => void>()
let frame: (() => void) | null = null
Object.assign(globalThis, {
  window: {
    addEventListener: (_: string, fn: (e: { clientX: number; clientY: number }) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (e: { clientX: number; clientY: number }) => void) => listeners.delete(fn),
  },
  requestAnimationFrame: (fn: () => void) => ((frame = fn), 1),
  cancelAnimationFrame: () => (frame = null),
})
const move = (x: number, y: number) => {
  for (const l of listeners) l({ clientX: x, clientY: y })
  frame?.()
  frame = null
}
// Centred at the origin.
const el = { getBoundingClientRect: () => ({ left: -5, top: -5, width: 10, height: 10 }) } as unknown as Element

test("bearing: 0 = 12 o'clock, clockwise grows", () => {
  assert.equal(bearingFrom(0, 0, 0, -10), 0)
  assert.equal(bearingFrom(0, 0, 10, 0), 90)
  assert.equal(bearingFrom(0, 0, 0, 10), 180)
  assert.equal(bearingFrom(0, 0, -10, 0), 270)
})

test("unwrap steps by the shortest arc and gates on epsilon", () => {
  assert.equal(unwrap(Number.NaN, 10), 10)
  assert.equal(unwrap(350, 10), 370)
  assert.equal(unwrap(10, 350), -10)
  assert.equal(unwrap(370, 15), 375)
  assert.equal(unwrap(100, 101), null)
})

test("subscribers share one listener; angles flow through the registry", () => {
  const a: number[] = []
  const b: number[] = []
  const offA = subscribe(() => el, (v) => a.push(v))
  assert.equal(listeners.size, 1)
  const offB = subscribe(() => el, (v) => b.push(v))
  assert.equal(listeners.size, 1, "a second subscriber does not add a second window listener")
  assert.equal(subscriberCount(), 2)

  move(0, -10)
  move(10, 0)
  move(0, 10)
  move(10.5, 0.1) // ~ 90.5°: a -89.5 step from 180, not +270 the long way
  assert.deepEqual(a, [0, 90, 180, bearingFrom(0, 0, 10.5, 0.1)])
  assert.ok(a[3]! > 89 && a[3]! < 92)
  assert.deepEqual(b, a)

  // Under epsilon: no write.
  move(10.6, 0.1)
  assert.equal(a.length, 4)

  // Zero-width host: frame skipped.
  const c: number[] = []
  const offC = subscribe(() => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }) }) as unknown as Element, (v) => c.push(v))
  move(0, -10)
  assert.deepEqual(c, [])

  offA()
  offB()
  assert.equal(listeners.size, 1)
  offC()
  assert.equal(listeners.size, 0, "listener detached once the set is empty")
  assert.equal(subscriberCount(), 0)
})
