import assert from "node:assert/strict"
import { test } from "node:test"
import { boxShadow, cssCode, defaults, effectiveSurface, gpuiCode, tailwindCode, pointedSurface, randomSurface } from "../src/lib/generator.ts"

test("dark cap leaves the original light settings intact", () => {
  const light = defaults(false)
  const dark = effectiveSurface(light, true)
  assert.equal(dark.lit.alpha, 20)
  assert.equal(light.lit.alpha, 80)
  assert.match(cssCode(dark), /255 255 255 \/ 20%/)
  assert.match(tailwindCode(dark), /alpha: 20/)
  assert.match(gpuiCode(dark), /alpha\(0.2\)/)
})
test("exports preserve signed geometry, custom colors and layer order", () => {
  const surface = defaults(true)
  surface.lit = { x: -4, y: 8, blur: 0, spread: -3, color: "#12abef", alpha: 17 }
  const shadow = "inset -4px 8px 0px -3px rgb(18 171 239 / 17%)"
  assert.ok(boxShadow(surface).startsWith(shadow))
  assert.ok(cssCode(surface).includes(shadow))
  assert.match(tailwindCode(surface), /color: "#12abef", x: -4, y: 8, blur: 0, spread: -3, alpha: 17/)
  const rust = gpuiCode(surface)
  assert.ok(rust.indexOf("0x000000") < rust.indexOf("0x12abef"))
  assert.match(rust, /px\(-4.0\), px\(8.0\)/)
  assert.match(rust, /spread_radius\(px\(-3.0\)\)/)
  assert.match(rust, /alpha\(0.17\)/)
})

test("random materials stay restrained in both themes", () => {
  for (const dark of [false, true]) {
    for (const sample of [0, 0.25, 0.5, 0.75, 0.999]) {
      const surface = randomSurface(dark, () => sample)
      assert.ok(surface.lit.alpha <= (dark ? 16 : 75))
      assert.ok(surface.dim.alpha <= (dark ? 40 : 28))
      assert.equal(surface.lit.spread, 0)
      assert.equal(surface.dim.spread, 0)
      assert.ok(surface.lit.blur <= 3 && surface.dim.blur <= 4)
      assert.equal(surface.lit.x + surface.dim.x, 0)
      assert.equal(surface.lit.y + surface.dim.y, 0)
      assert.match(surface.fill, /^#[0-9a-f]{6}$/)
    }
  }
})
test("pointer rotation keeps shading opposite and leaves export settings intact", () => {
  const surface = defaults(true)
  const rotated = pointedSurface(surface, 90)
  assert.equal(rotated.lit.x, -2)
  assert.equal(rotated.dim.x, 2)
  assert.equal(rotated.lit.y, 0)
  assert.equal(rotated.lit.alpha, surface.lit.alpha)
  assert.equal(surface.lit.x, 0)
  assert.equal(surface.lit.y, 2)
})
