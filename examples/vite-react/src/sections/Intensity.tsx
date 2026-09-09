"use client"

import { useState, type CSSProperties } from "react"

import { Chip } from "../components/Code.tsx"
import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

type Knobs = { y: number; blur: number; alpha: number }

function Slider({ label, value, min, max, step = 1, unit = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="grid grid-cols-[4rem_1fr_3.5rem] items-center gap-3 text-sm">
      <span className="text-stone-600 dark:text-neutral-400">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-stone-700 dark:accent-neutral-300" />
      <span className="text-right font-mono text-xs text-stone-500 tabular-nums dark:text-neutral-500">
        {value}
        {unit}
      </span>
    </label>
  )
}

/**
 * The playground sets the PRESET tier (`--bezel-lit-y`, …) on a wrapper. It
 * inherits, so every `bezel-base` inside follows the sliders. A utility on a
 * child would set the INSTANCE tier and win over the preset — which is the
 * whole point of the three tiers.
 */
function Playground() {
  const [lit, setLit] = useState<Knobs>({ y: 2, blur: 3, alpha: 80 })
  const [dim, setDim] = useState<Knobs>({ y: 1, blur: 2, alpha: 15 })
  const vars = {
    "--bezel-lit-y": `${lit.y}px`,
    "--bezel-lit-blur": `${lit.blur}px`,
    "--bezel-lit-alpha": String(lit.alpha),
    "--bezel-dim-y": `${-dim.y}px`,
    "--bezel-dim-blur": `${dim.blur}px`,
    "--bezel-dim-alpha": String(dim.alpha),
  } as CSSProperties
  const equivalent = `bezel-lit-t-${lit.y} bezel-lit-blur-${lit.blur} bezel-lit/${lit.alpha} bezel-dim-b-${dim.y} bezel-dim-blur-${dim.blur} bezel-dim/${dim.alpha}`
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-6">
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">lit — the white layer</legend>
          <Slider label="depth" value={lit.y} min={0} max={12} unit="px" onChange={(y) => setLit({ ...lit, y })} />
          <Slider label="blur" value={lit.blur} min={0} max={24} unit="px" onChange={(blur) => setLit({ ...lit, blur })} />
          <Slider label="alpha" value={lit.alpha} min={0} max={100} unit="%" onChange={(alpha) => setLit({ ...lit, alpha })} />
        </fieldset>
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">dim — the black layer</legend>
          <Slider label="depth" value={dim.y} min={0} max={12} unit="px" onChange={(y) => setDim({ ...dim, y })} />
          <Slider label="blur" value={dim.blur} min={0} max={24} unit="px" onChange={(blur) => setDim({ ...dim, blur })} />
          <Slider label="alpha" value={dim.alpha} min={0} max={100} unit="%" onChange={(alpha) => setDim({ ...dim, alpha })} />
        </fieldset>
        <div className="grid gap-1.5">
          <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">the same look as utilities</div>
          <Chip className="whitespace-normal">{equivalent}</Chip>
        </div>
      </div>
      <div style={vars} className="flex flex-wrap items-center justify-around gap-8 rounded-xl bg-stone-200/70 p-8 dark:bg-neutral-900">
        <div className="size-24 rounded-full bg-stone-200 bezel-base dark:bg-neutral-800" />
        <div className="size-24 rounded-2xl bg-stone-200 bezel-base dark:bg-neutral-800" />
        <button type="button" className="h-10 rounded-lg bg-stone-200 px-5 text-sm font-medium bezel-base dark:bg-neutral-800">
          Button
        </button>
        <div className="flex h-24 w-40 items-end rounded-2xl bg-stone-200 p-3 text-xs text-stone-500 bezel-base dark:bg-neutral-800 dark:text-neutral-400">
          a card
        </div>
      </div>
    </div>
  )
}

export function Intensity() {
  return (
    <Section
      id="intensity"
      number="03 · Intensity"
      title="Alpha, blur and depth"
      lede={
        <>
          Every layer has an alpha (<code className="font-mono text-[0.9em]">bezel-lit/40</code>), a blur (
          <code className="font-mono text-[0.9em]">bezel-lit-blur-6</code>) and an offset. Alpha is how bright the light is, blur is how soft, offset is how
          deep. Together they cover everything from a barely-there hairline to a heavy, glossy lip.
        </>
      }
    >
      <Demo
        title="Brightness: the highlight alpha"
        description="From invisible to full white. /N and /[0.N] are the same thing; the bare class keeps the configured alpha (80 here)."
        code={`<div class="bezel-lit/10" /> <div class="bezel-lit/25" /> <div class="bezel-lit/50" /> <div class="bezel-lit" /> <div class="bezel-lit/100" />`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-lit/10" />
          <Swatch classes="bezel-lit/25" />
          <Swatch classes="bezel-lit/50" />
          <Swatch classes="bezel-lit" label="configured (80)" />
          <Swatch classes="bezel-lit/100" label="100" />
        </div>
      </Demo>

      <Demo
        title="Weight: the shadow alpha"
        description="The dim layer does the opposite job. Heavier shadow, heavier object."
        code={`<div class="bezel-dim/5" /> <div class="bezel-dim/15" /> <div class="bezel-dim/30" /> <div class="bezel-dim/50" /> <div class="bezel-dim/80" />`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-dim/5" fill="bg-stone-300 dark:bg-neutral-700" />
          <Swatch classes="bezel-dim/15" fill="bg-stone-300 dark:bg-neutral-700" />
          <Swatch classes="bezel-dim/30" fill="bg-stone-300 dark:bg-neutral-700" />
          <Swatch classes="bezel-dim/50" fill="bg-stone-300 dark:bg-neutral-700" />
          <Swatch classes="bezel-dim/80" fill="bg-stone-300 dark:bg-neutral-700" />
        </div>
      </Demo>

      <Demo
        title="Softness: blur"
        description="Zero blur is a machined edge; large blur is a matte glow that bleeds into the fill. bezel-blur-N blurs both layers at once."
        code={`
<div class="bezel-lit-blur-0" /> <div class="bezel-lit-blur-2" /> <div class="bezel-lit-blur-6" /> <div class="bezel-lit-blur-12" />
<div class="bezel-blur-8" />     <!-- every layer -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-lit-blur-0" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-2" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-6" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-12" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-blur-8" shape="size-20 rounded-2xl" label="all layers" />
        </div>
      </Demo>

      <Demo
        title="Playground"
        description={
          <>
            These sliders write the <em>preset</em> tier (<code className="font-mono">--bezel-lit-y</code>, <code className="font-mono">--bezel-lit-alpha</code>
            , …) as inline custom properties on the stage. Presets inherit, so the four <code className="font-mono">bezel-base</code> shapes inside all follow.
            The dark theme is the same mechanism: the plugin emits a <code className="font-mono">.dark {"{ … }"}</code> preset block, and no element carries a{" "}
            <code className="font-mono">dark:</code> class.
          </>
        }
        code={`
<div style="--bezel-lit-y: 2px; --bezel-lit-blur: 3px; --bezel-lit-alpha: 80; --bezel-dim-y: -1px; …">
  <div class="bezel-base" />   <!-- follows the presets: no utility sets an instance value -->
  <div class="bezel-base bezel-lit-t-6" />   <!-- would override depth for itself only -->
</div>`}
      >
        <Playground />
      </Demo>
    </Section>
  )
}
