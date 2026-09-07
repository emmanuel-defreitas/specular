import assert from "node:assert/strict"
import { test } from "node:test"

import { measureRimTone, rimLuma, toneCache, toneToAlphas, TONE_SAMPLE_SIZE } from "./tone.ts"

/** A 16×16 RGBA buffer: `inner` inside 0.6r, `outer` on the rim. */
const disc = (inner: number, outer: number) => {
  const size = TONE_SAMPLE_SIZE
  const data = new Uint8ClampedArray(size * size * 4)
  const centre = (size - 1) / 2
  const rim = 0.6 * centre
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const v = (x - centre) ** 2 + (y - centre) ** 2 < rim * rim ? inner : outer
      data.set([v, v, v, 255], (y * size + x) * 4)
    }
  return data
}

test("rim luma reads the band outside 0.6r only", () => {
  assert.ok(Math.abs((rimLuma(disc(0, 255)) ?? -1) - 1) < 1e-9)
  assert.ok(Math.abs((rimLuma(disc(255, 0)) ?? -1) - 0) < 1e-9)
  assert.equal(rimLuma(new Uint8ClampedArray(0), 0), null)
})

test("toneToAlphas end points, clamped, retunable", () => {
  assert.deepEqual(toneToAlphas(0), { hi: 0.7, lo: 0.6 })
  assert.deepEqual(toneToAlphas(1), { hi: 1, lo: 0.2 })
  assert.deepEqual(toneToAlphas(5), { hi: 1, lo: 0.2 })
  assert.deepEqual(toneToAlphas(-1), { hi: 0.7, lo: 0.6 })
  const mid = toneToAlphas(0.5)
  assert.ok(Math.abs(mid.hi - 0.85) < 1e-9 && Math.abs(mid.lo - 0.4) < 1e-9)
  assert.deepEqual(toneToAlphas(1, { dark: { hi: 0, lo: 1 }, light: { hi: 1, lo: 0 } }), { hi: 1, lo: 0 })
})

test("a null sample is not kept in the cache", async () => {
  // No document here → null.
  assert.equal(await measureRimTone("x.png"), null)
  await Promise.resolve()
  assert.equal(toneCache.has("x.png"), false)
})
