import assert from "node:assert/strict"
import { test } from "node:test"

import { defineSurfaces, resolveSurfaces } from "./index.ts"

test("rejects core roots unless allowCoreCollision", () => {
  for (const name of ["shadow", "inset-shadow", "ring", "inset-ring", "blur", "drop-shadow", "text-shadow", "outline"])
    assert.throws(() => defineSurfaces({ [name]: { layers: { lit: {} } } }), new RegExp(name))
  assert.doesNotThrow(() => defineSurfaces({ "inset-shadow": { layers: { lit: {} }, allowCoreCollision: true } }))
})

test("rejects bad names and reserved layers", () => {
  assert.throws(() => defineSurfaces({ "a/b": { layers: { lit: {} } } }), /a\/b/)
  assert.throws(() => defineSurfaces({ Bezel: { layers: { lit: {} } } }), /Bezel/)
  assert.throws(() => defineSurfaces({ bezel: { layers: { "l:t": {} } } }), /l:t/)
  for (const layer of ["blur", "spread", "base", "color"])
    assert.throws(() => defineSurfaces({ bezel: { layers: { [layer]: {} } } }), new RegExp(layer))
  assert.throws(() => defineSurfaces({ bezel: { layers: {} } }), /no layers/)
})

test("resolves defaults: first layer white, later black, px for numbers", () => {
  const [s] = resolveSurfaces({ bezel: { layers: { lit: { y: 2 }, dim: { y: -1, blur: "0.5rem", alpha: 15, dark: { y: -8 } } } } })
  assert.equal(s?.baseClass, "bezel-base")
  assert.equal(s?.darkSelector, ".dark")
  assert.deepEqual(s?.layers.map((l) => [l.color, l.y, l.blur, l.alpha]), [["#fff", "2px", "0", "100"], ["#000", "-1px", "0.5rem", "15"]])
  assert.deepEqual(s?.layers[1]?.dark, { y: "-8px" })
})
