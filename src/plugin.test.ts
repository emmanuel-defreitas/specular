import assert from "node:assert/strict"
import { test } from "node:test"

import { defineSurfaces } from "./index.ts"
import { createPlugin, normalizeAlpha } from "./plugin.ts"
import { build, PREAMBLE, utilities } from "./test-harness.ts"

const surfaces = defineSurfaces({
  bezel: {
    layers: {
      lit: { color: "#fff", y: 2, blur: 3, alpha: 80, dark: { y: 1, blur: 1, alpha: 5 } },
      dim: { color: "#000", y: -1, blur: 2, alpha: 15, dark: { y: -8, alpha: 20 } },
    },
  },
  card: {
    layers: {
      lit: { inset: true, color: "#fff", y: 1, alpha: 60 },
      drop: { inset: false, color: "#000", y: 4, blur: 8, alpha: 15 },
    },
  },
})

const block = (selector: string, decls: string[]) =>
  `  ${selector} {\n    box-shadow: var(--tw-bezel-shadow);\n${decls.map((d) => `    ${d};\n`).join("")}  }`

test("every row of the utility table", async () => {
  const css = utilities(
    await build(PREAMBLE, createPlugin(surfaces), [
      "bezel-base", "bezel-lit", "bezel-lit/40", "bezel-lit/[0.4]",
      "bezel-lit-t-2", "bezel-lit-b-1.5", "bezel-lit-l-[0.5rem]", "bezel-lit-r-3", "bezel-lit-b-[0.5rem]",
      "bezel-lit-blur-3", "bezel-lit-spread-1", "bezel-lit-color-red-500", "bezel-lit-color-[#123]",
      "bezel-blur-6", "bezel-spread-2", "card-drop-b-4",
    ])
  )
  const expect = (selector: string, decls: string[]) => assert.ok(css.includes(block(selector, decls)), `missing ${selector}\n${css}`)
  assert.ok(css.includes("  .bezel-base {\n    box-shadow: var(--tw-bezel-shadow);\n  }"))
  expect(".bezel-lit", ["--tw-bezel-lit-alpha: 100"])
  expect(".bezel-lit\\/40", ["--tw-bezel-lit-alpha: 40"])
  expect(".bezel-lit\\/\\[0\\.4\\]", ["--tw-bezel-lit-alpha: 40"])
  expect(".bezel-lit-t-2", ["--tw-bezel-lit-y: calc(2 * 1px)"])
  expect(".bezel-lit-b-1\\.5", ["--tw-bezel-lit-y: calc(1.5 * -1px)"])
  expect(".bezel-lit-l-\\[0\\.5rem\\]", ["--tw-bezel-lit-x: 0.5rem"])
  expect(".bezel-lit-r-3", ["--tw-bezel-lit-x: calc(3 * -1px)"])
  expect(".bezel-lit-b-\\[0\\.5rem\\]", ["--tw-bezel-lit-y: calc(0.5rem * -1)"])
  expect(".bezel-lit-blur-3", ["--tw-bezel-lit-blur: calc(3 * 1px)"])
  expect(".bezel-lit-spread-1", ["--tw-bezel-lit-spread: calc(1 * 1px)"])
  expect(".bezel-lit-color-red-500", ["--tw-bezel-lit-color: oklch(63.7% 0.237 25.331)"])
  expect(".bezel-lit-color-\\[\\#123\\]", ["--tw-bezel-lit-color: #123"])
  expect(".bezel-blur-6", ["--tw-bezel-lit-blur: calc(6 * 1px)", "--tw-bezel-dim-blur: calc(6 * 1px)"])
  expect(".bezel-spread-2", ["--tw-bezel-lit-spread: calc(2 * 1px)", "--tw-bezel-dim-spread: calc(2 * 1px)"])
  assert.ok(css.includes("  .card-drop-b-4 {\n    box-shadow: var(--tw-card-shadow);\n    --tw-card-drop-y: calc(4 * -1px);\n  }"))
})

test("file: and dark: variants, and @apply inside @layer components", async () => {
  const css = await build(
    PREAMBLE + `@layer components { .bubble { @apply bezel-lit-t-2 bezel-dim/20; } }`,
    createPlugin(surfaces),
    ["file:bezel-lit-t-2", "dark:bezel-dim/90"]
  )
  assert.ok(css.includes(".file\\:bezel-lit-t-2::file-selector-button {\n    box-shadow: var(--tw-bezel-shadow);\n    --tw-bezel-lit-y: calc(2 * 1px);"))
  assert.ok(css.includes(".dark\\:bezel-dim\\/90 {\n      box-shadow: var(--tw-bezel-shadow);\n      --tw-bezel-dim-alpha: 90;"))
  assert.ok(css.includes(".bubble {\n    --tw-bezel-dim-alpha: 20;\n    box-shadow: var(--tw-bezel-shadow);\n    --tw-bezel-lit-y: calc(2 * 1px);"))
})

test("composed tier: universal block once per surface, @supports split, twice per surface", async () => {
  const css = await build(PREAMBLE, createPlugin(surfaces), ["bezel-lit"])
  for (const s of ["bezel", "card"]) {
    assert.equal(css.split(`--tw-${s}-shadow:`).length - 1, 2, `${s} shadow var count`)
    assert.equal(css.split(`::file-selector-button {\n    --tw-${s}-shadow:`).length - 1, 1)
  }
  assert.ok(css.includes("*, ::before, ::after, ::backdrop, ::file-selector-button {\n    --tw-bezel-shadow: inset var(--tw-bezel-lit-x, var(--bezel-lit-x, 0)) var(--tw-bezel-lit-y, var(--bezel-lit-y, 2px)) var(--tw-bezel-lit-blur, var(--bezel-lit-blur, 3px)) var(--tw-bezel-lit-spread, var(--bezel-lit-spread, 0)) var(--tw-bezel-lit-color, var(--bezel-lit-color, #fff)), inset"))
  assert.ok(css.includes("@supports (color: color-mix(in lab, red, red)) {\n      --tw-bezel-shadow: inset var(--tw-bezel-lit-x, var(--bezel-lit-x, 0)) var(--tw-bezel-lit-y, var(--bezel-lit-y, 2px)) var(--tw-bezel-lit-blur, var(--bezel-lit-blur, 3px)) var(--tw-bezel-lit-spread, var(--bezel-lit-spread, 0)) color-mix(in srgb, var(--tw-bezel-lit-color, var(--bezel-lit-color, #fff)) calc(var(--tw-bezel-lit-alpha, var(--bezel-lit-alpha, 80)) * 1%), transparent), inset"))
  // Outer drop layer: no `inset` keyword.
  assert.ok(css.includes("transparent), var(--tw-card-drop-x, var(--card-drop-x, 0)) var(--tw-card-drop-y, var(--card-drop-y, 4px)) var(--tw-card-drop-blur, var(--card-drop-blur, 8px))"))
})

test("instance tier: @property for every var, syntax *, inherits false, no initial-value", async () => {
  const css = await build(PREAMBLE, createPlugin(surfaces), [])
  for (const [s, layers] of [["bezel", ["lit", "dim"]], ["card", ["lit", "drop"]]] as const)
    for (const l of layers)
      for (const p of ["x", "y", "blur", "spread", "color", "alpha"])
        assert.ok(css.includes(`@property --tw-${s}-${l}-${p} {\n    syntax: "*";\n    inherits: false;\n  }`), `${s}-${l}-${p}`)
  assert.ok(!css.includes("initial-value"))
})

test("preset tier: dark block, configurable selector, at-rule wraps :root; rim tokens", async () => {
  const css = await build(PREAMBLE, createPlugin(surfaces), [])
  assert.ok(css.includes(".dark {\n    --bezel-lit-y: 1px;\n    --bezel-lit-blur: 1px;\n    --bezel-lit-alpha: 5;\n    --bezel-dim-y: -8px;\n    --bezel-dim-alpha: 20;\n  }"))
  assert.ok(css.includes(".dark {\n    --rim-hi-a: 0.18;\n    --rim-lo-a: 0.4;\n  }"))
  assert.ok(!/--card-[a-z]+-[a-z]+:/.test(css), "card has no presets")

  const media = await build(
    PREAMBLE,
    createPlugin({ bezel: { darkSelector: "@media (prefers-color-scheme: dark)", layers: { lit: { dark: { alpha: 5 } } } } }, { rim: false }),
    []
  )
  assert.ok(media.includes("@media (prefers-color-scheme: dark) {\n    :root {\n      --bezel-lit-alpha: 5;\n    }\n  }"))
  assert.ok(!media.includes("--rim-hi-a"))
})

test("migration surface reproduces corpora-ui's inset-shadow-* API", async () => {
  const legacy = defineSurfaces({
    "inset-shadow": { baseClass: "inset-shadow-bezel", allowCoreCollision: true, layers: { lit: { color: "#fff" }, dim: { color: "#000" } } },
  })
  const css = utilities(
    await build(PREAMBLE, createPlugin(legacy), [
      "inset-shadow-bezel", "inset-shadow-lit-t-3", "inset-shadow-lit-blur-3", "inset-shadow-lit/80",
      "inset-shadow-dim-b-1", "inset-shadow-dim-blur-2", "inset-shadow-dim/15", "inset-shadow-blur-3", "inset-shadow-lit-l-[0.5rem]",
    ])
  )
  const has = (s: string) => assert.ok(css.includes(s), `missing ${s}\n${css}`)
  has(".inset-shadow-bezel {\n    box-shadow: var(--tw-inset-shadow-shadow);\n  }")
  has(".inset-shadow-lit-t-3 {\n    box-shadow: var(--tw-inset-shadow-shadow);\n    --tw-inset-shadow-lit-y: calc(3 * 1px);")
  has(".inset-shadow-lit\\/80 {\n    box-shadow: var(--tw-inset-shadow-shadow);\n    --tw-inset-shadow-lit-alpha: 80;")
  has(".inset-shadow-dim-b-1 {\n    box-shadow: var(--tw-inset-shadow-shadow);\n    --tw-inset-shadow-dim-y: calc(1 * -1px);")
  has(".inset-shadow-blur-3 {\n    box-shadow: var(--tw-inset-shadow-shadow);\n    --tw-inset-shadow-lit-blur: calc(3 * 1px);\n    --tw-inset-shadow-dim-blur: calc(3 * 1px);")
  has(".inset-shadow-lit-l-\\[0\\.5rem\\] {\n    box-shadow: var(--tw-inset-shadow-shadow);\n    --tw-inset-shadow-lit-x: 0.5rem;")
  // Nothing leaked into core's inset-shadow utility.
  assert.ok(!css.includes("--tw-inset-shadow:"))
})

test("normalizeAlpha", () => {
  assert.equal(normalizeAlpha("80"), "80")
  assert.equal(normalizeAlpha("0.8"), "80")
  assert.equal(normalizeAlpha("[0.35]"), "35")
  assert.equal(normalizeAlpha(".5"), "50")
  assert.equal(normalizeAlpha("1"), "1")
})
