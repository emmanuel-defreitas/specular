/**
 * The CI smoke test. The plugin relies on Tailwind's `__BARE_VALUE__` hook
 * for bare numbers; run against the newest peer minor so a release that
 * drops it fails here, not in a consumer.
 */
import assert from "node:assert/strict"
import { test } from "node:test"

import { createPlugin } from "./plugin.ts"
import { build, PREAMBLE, utilities } from "./test-harness.ts"

test("__BARE_VALUE__ still turns bare numbers into px", async () => {
  const css = utilities(await build(PREAMBLE, createPlugin({ bezel: { layers: { lit: {} } } }), ["bezel-lit-t-2", "bezel-lit-t-1.5"]))
  assert.ok(css.includes("--tw-bezel-lit-y: calc(2 * 1px)"), css)
  assert.ok(css.includes("--tw-bezel-lit-y: calc(1.5 * 1px)"), css)
})
