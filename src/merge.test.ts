import assert from "node:assert/strict"
import { test } from "node:test"
import { twMerge } from "tailwind-merge"

import { defineSurfaces } from "./index.ts"
import { createCn, mergeConfig } from "./merge.ts"

const surfaces = defineSurfaces({
  bezel: { layers: { lit: { color: "#fff" }, dim: { color: "#000" } } },
  card: { layers: { lit: {}, drop: { inset: false } } },
})
const cn = createCn(surfaces)

/** Both survive, and nothing else: a single toContain hides a collapse. */
const keepsBoth = (input: string) => {
  const out = cn(input).split(" ")
  for (const c of input.split(" ")) assert.ok(out.includes(c), `${c} dropped from "${input}" → "${out.join(" ")}"`)
  assert.equal(out.length, input.split(" ").length)
}
const keepsLast = (input: string) => assert.equal(cn(input), input.split(" ").at(-1))

test("stock tailwind-merge collapses the family (the bug that shipped)", () => {
  assert.equal(twMerge("inset-shadow-lit-t-2 inset-shadow-dim-b-1"), "inset-shadow-dim-b-1")
})

test("independent properties coexist", () => {
  keepsBoth("bezel-lit-t-2 bezel-dim-b-1")
  keepsBoth("bezel-lit-t-2 bezel-lit-l-1")
  keepsBoth("bezel-lit-t-2 bezel-lit-blur-3 bezel-lit-spread-1 bezel-lit-color-red-500 bezel-lit/80")
  keepsBoth("bezel-lit/80 bezel-dim/15")
  keepsBoth("bezel-base bezel-lit-t-2")
  keepsBoth("bezel-lit-blur-3 bezel-dim-blur-2")
  keepsBoth("bezel-lit-t-3 bezel-lit-blur-3 bezel-lit/80 dark:bezel-lit-t-1 dark:bezel-lit-blur-1 dark:bezel-lit/5 bezel-dim-b-1 bezel-dim-blur-2 bezel-dim/15 dark:bezel-dim-b-8 dark:bezel-dim-blur-2 dark:bezel-dim/20")
})

test("same property: last wins", () => {
  keepsLast("bezel-lit-t-2 bezel-lit-b-1")
  keepsLast("bezel-lit-l-2 bezel-lit-r-1")
  keepsLast("bezel-lit bezel-lit/40")
  keepsLast("bezel-lit/40 bezel-lit")
  keepsLast("bezel-lit-blur-2 bezel-lit-blur-4")
  keepsLast("bezel-lit-color-red-500 bezel-lit-color-[#fff]")
})

test("all-layer groups displace per-layer twins", () => {
  keepsLast("bezel-lit-blur-3 bezel-blur-6")
  keepsLast("bezel-dim-blur-3 bezel-blur-6")
  keepsLast("bezel-lit-spread-1 bezel-spread-2")
  // …but not the reverse: a later per-layer blur refines the all-layer one.
  keepsBoth("bezel-blur-6 bezel-lit-blur-3")
})

test("bidirectional with core shadow and inset-shadow", () => {
  assert.equal(cn("shadow-md bezel-lit-t-2"), "bezel-lit-t-2")
  assert.equal(cn("bezel-lit-t-2 shadow-md"), "shadow-md")
  assert.equal(cn("inset-shadow-sm bezel-dim/20"), "bezel-dim/20")
  assert.equal(cn("bezel-base shadow-lg"), "shadow-lg")
  assert.equal(cn("bezel-blur-4 inset-shadow-xs"), "inset-shadow-xs")
})

test("cross-surface: any group of A displaces any group of B", () => {
  keepsLast("bezel-lit-t-2 card-drop-b-4")
  keepsLast("card-drop-b-4 bezel-lit-t-2")
  keepsLast("bezel-base card-lit/50")
  keepsLast("bezel-blur-2 card-spread-1")
})

test("migration surface: corpora-ui's cn() behaviour, class by class", () => {
  const legacy = createCn(
    defineSurfaces({ "inset-shadow": { baseClass: "inset-shadow-bezel", allowCoreCollision: true, layers: { lit: {}, dim: {} } } })
  )
  const emboss = "inset-shadow-lit-t-3 inset-shadow-lit-blur-3 inset-shadow-lit/80 dark:inset-shadow-lit-t-1 dark:inset-shadow-lit-blur-1 dark:inset-shadow-lit/5 inset-shadow-dim-b-1 inset-shadow-dim-blur-2 inset-shadow-dim/15 dark:inset-shadow-dim-b-8 dark:inset-shadow-dim-blur-2 dark:inset-shadow-dim/20"
  const out = legacy(emboss).split(" ")
  for (const c of emboss.split(" ")) assert.ok(out.includes(c), c)
  assert.equal(out.length, 12)
  assert.equal(legacy("inset-shadow-lit-t-2 inset-shadow-dim-b-1"), "inset-shadow-lit-t-2 inset-shadow-dim-b-1")
  assert.equal(legacy("shadow-md inset-shadow-lit-t-2"), "inset-shadow-lit-t-2")
  assert.equal(legacy("inset-shadow-lit-t-2 shadow-md"), "shadow-md")
  assert.equal(legacy("inset-shadow-lit-blur-3 inset-shadow-blur-6"), "inset-shadow-blur-6")
  assert.equal(legacy("inset-shadow-lit-t-2 inset-shadow-sm"), "inset-shadow-sm")
})

test("mergeConfig shape", () => {
  const { extend } = mergeConfig(surfaces)
  const groups = Object.keys(extend?.classGroups ?? {})
  assert.equal(groups.length, 2 * (3 + 2 * 6))
  assert.deepEqual(extend?.conflictingClassGroups?.shadow, groups)
  assert.deepEqual(extend?.conflictingClassGroups?.["inset-shadow"], groups)
  assert.ok(extend?.conflictingClassGroups?.["bezel-blur"]?.includes("bezel-lit-blur"))
  assert.ok(extend?.conflictingClassGroups?.["bezel-lit-x"]?.includes("card-drop-y"))
  assert.ok(!extend?.conflictingClassGroups?.["bezel-lit-x"]?.includes("bezel-lit-y"))
})
