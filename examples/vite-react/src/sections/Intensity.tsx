"use client"

import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

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
        description="Explicit alpha overrides the preset. These examples use lower dark-mode values to keep the edge restrained; the bare class uses 80% in light mode and 7% in dark mode."
        code={`<div class="bezel-lit/10 dark:bezel-lit/2" /> <div class="bezel-lit/25 dark:bezel-lit/4" /> <div class="bezel-lit/50 dark:bezel-lit/9" /> <div class="bezel-lit" /> <div class="bezel-lit/100 dark:bezel-lit/18" />`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-lit/10 dark:bezel-lit/2" />
          <Swatch classes="bezel-lit/25 dark:bezel-lit/4" />
          <Swatch classes="bezel-lit/50 dark:bezel-lit/9" />
          <Swatch classes="bezel-lit" label="configured" />
          <Swatch classes="bezel-lit/100 dark:bezel-lit/18" label="strong" />
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
        <div className="flex flex-col items-center gap-6 md:flex-row md:flex-wrap md:items-start md:justify-around">
          <Swatch classes="bezel-lit-blur-0" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-2" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-6" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-lit-blur-12" shape="size-20 rounded-2xl" />
          <Swatch classes="bezel-blur-8" shape="size-20 rounded-2xl" label="all layers" />
        </div>
      </Demo>

      <a href="#playground" className="underline underline-offset-4">Build and export your own surface in the playground →</a>
    </Section>
  )
}
