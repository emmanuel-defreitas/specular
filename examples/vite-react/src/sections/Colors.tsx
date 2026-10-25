import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

export function Colors() {
  return (
    <Section
      id="colors"
      number="04 · Colour"
      title="Tinted light, tinted shade"
      lede={
        <>
          The highlight is white and the shadow black by default, but either layer takes any theme colour (
          <code className="font-mono text-[0.9em]">bezel-lit-color-amber-50</code>) or an arbitrary one (
          <code className="font-mono text-[0.9em]">bezel-lit-color-[#ffd700]</code>). Tinting the layers toward the fill is how a coloured surface stops looking
          like a sticker.
        </>
      }
    >
      <Demo
        title="Match the layers to the fill"
        description="Neutral: white light and black shade on a colour. Tinted: the same colour with both layers pulled toward its own hue — the shade stops looking grey."
        code={`
<div class="bg-amber-200 bezel-base" />                                                       <!-- neutral: white / black -->
<div class="bg-amber-200 bezel-lit-color-amber-50 bezel-dim-color-amber-900 bezel-dim/40" />  <!-- tinted to the fill -->`}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          <Swatch classes="bezel-base" label="amber · neutral" fill="bg-amber-200 dark:bg-amber-700" />
          <Swatch classes="bezel-lit-color-amber-50 bezel-dim-color-amber-900 bezel-dim/40" label="amber · tinted" fill="bg-amber-200 dark:bg-amber-700" />
          <Swatch classes="bezel-base" label="sky · neutral" fill="bg-sky-200 dark:bg-sky-700" />
          <Swatch classes="bezel-lit-color-sky-50 bezel-dim-color-sky-900 bezel-dim/40" label="sky · tinted" fill="bg-sky-200 dark:bg-sky-700" />
          <Swatch classes="bezel-base" label="rose · neutral" fill="bg-rose-200 dark:bg-rose-700" />
          <Swatch classes="bezel-lit-color-rose-50 bezel-dim-color-rose-900 bezel-dim/40" label="rose · tinted" fill="bg-rose-200 dark:bg-rose-700" />
        </div>
      </Demo>

      <Demo
        title="Metal and gems"
        description="A coloured highlight on a dark fill reads as a material. Gold is a warm highlight; chrome a cold one; a gem a saturated rim in its own hue."
        code={`
<div class="bg-stone-800 bezel-lit-color-[#ffd700] bezel-lit/70 dark:bezel-lit/13 bezel-dim/60" />        <!-- gold -->
<div class="bg-slate-700 bezel-lit-color-sky-100 bezel-lit/60 dark:bezel-lit/11 bezel-lit-t-3 bezel-dim/60" />  <!-- chrome -->
<div class="bg-emerald-900 bezel-lit-color-emerald-300 bezel-lit/80 dark:bezel-lit/14 bezel-dim-color-emerald-950 bezel-dim/80" />  <!-- emerald -->
<div class="bg-rose-950 bezel-lit-color-rose-400 bezel-lit/80 dark:bezel-lit/14 bezel-lit-spread-1 bezel-dim/80" />   <!-- ruby -->
<div class="bg-indigo-950 bezel-lit-color-indigo-300 bezel-lit/70 dark:bezel-lit/13 bezel-lit-blur-6 bezel-dim/80" /> <!-- sapphire -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-lit-color-[#ffd700] bezel-lit/70 dark:bezel-lit/13 bezel-dim/60" fill="bg-stone-800" label="gold" />
          <Swatch classes="bezel-lit-color-sky-100 bezel-lit/60 dark:bezel-lit/11 bezel-lit-t-3 bezel-dim/60" fill="bg-slate-700" label="chrome" />
          <Swatch classes="bezel-lit-color-emerald-300 bezel-lit/80 dark:bezel-lit/14 bezel-dim-color-emerald-950 bezel-dim/80" fill="bg-emerald-900" label="emerald" />
          <Swatch classes="bezel-lit-color-rose-400 bezel-lit/80 dark:bezel-lit/14 bezel-lit-spread-1 bezel-dim/80" fill="bg-rose-950" label="ruby" />
          <Swatch classes="bezel-lit-color-indigo-300 bezel-lit/70 dark:bezel-lit/13 bezel-lit-blur-6 bezel-dim/80" fill="bg-indigo-950" label="sapphire" />
        </div>
      </Demo>

    </Section>
  )
}
