import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

const GLOWS = [
  { name: "rose", cls: "bg-rose-500 glow-halo-color-rose-500" },
  { name: "amber", cls: "bg-amber-400 text-amber-950 glow-halo-color-amber-400" },
  { name: "emerald", cls: "bg-emerald-500 glow-halo-color-emerald-500" },
  { name: "sky", cls: "bg-sky-500 glow-halo-color-sky-500" },
  { name: "violet", cls: "bg-violet-500 glow-halo-color-violet-500" },
  { name: "white", cls: "bg-neutral-100 text-neutral-900 glow-halo-color-white" },
]

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
<div class="bg-stone-800 bezel-lit-color-[#ffd700] bezel-lit/70 bezel-dim/60" />        <!-- gold -->
<div class="bg-slate-700 bezel-lit-color-sky-100 bezel-lit/60 bezel-lit-t-3 bezel-dim/60" />  <!-- chrome -->
<div class="bg-emerald-900 bezel-lit-color-emerald-300 bezel-lit/80 bezel-dim-color-emerald-950 bezel-dim/80" />  <!-- emerald -->
<div class="bg-rose-950 bezel-lit-color-rose-400 bezel-lit/80 bezel-lit-spread-1 bezel-dim/80" />   <!-- ruby -->
<div class="bg-indigo-950 bezel-lit-color-indigo-300 bezel-lit/70 bezel-lit-blur-6 bezel-dim/80" /> <!-- sapphire -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-6">
          <Swatch classes="bezel-lit-color-[#ffd700] bezel-lit/70 bezel-dim/60" fill="bg-stone-800" label="gold" />
          <Swatch classes="bezel-lit-color-sky-100 bezel-lit/60 bezel-lit-t-3 bezel-dim/60" fill="bg-slate-700" label="chrome" />
          <Swatch classes="bezel-lit-color-emerald-300 bezel-lit/80 bezel-dim-color-emerald-950 bezel-dim/80" fill="bg-emerald-900" label="emerald" />
          <Swatch classes="bezel-lit-color-rose-400 bezel-lit/80 bezel-lit-spread-1 bezel-dim/80" fill="bg-rose-950" label="ruby" />
          <Swatch classes="bezel-lit-color-indigo-300 bezel-lit/70 bezel-lit-blur-6 bezel-dim/80" fill="bg-indigo-950" label="sapphire" />
        </div>
      </Demo>

      <Demo
        title="Glow: a coloured drop layer that wakes on hover"
        description={
          <>
            The <em>glow</em> surface has an inset edge plus an outer <code className="font-mono">halo</code> declared with{" "}
            <code className="font-mono">inset: false</code> and <code className="font-mono">alpha: 0</code>. At rest it is invisible. On hover{" "}
            <code className="font-mono">hover:glow-halo/75</code> raises the alpha, and because <code className="font-mono">box-shadow</code> transitions, the
            halo fades in. Hover the buttons.
          </>
        }
        code={`
<button class="bg-rose-500 text-white glow-base glow-halo-color-rose-500
               hover:glow-halo/75 transition-shadow duration-300">Rose</button>`}
      >
        <div className="flex flex-wrap items-center justify-center gap-5 py-2">
          {GLOWS.map((g) => (
            <button
              key={g.name}
              type="button"
              className={`h-11 rounded-full px-6 text-sm font-semibold text-white glow-base transition-shadow duration-300 hover:glow-halo/75 ${g.cls}`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-2">
          <div className="text-center text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">halo intensity, always on</div>
          <div className="flex flex-wrap items-start justify-around gap-6">
            <Swatch classes="glow-base glow-halo/20" fill="bg-violet-500" shape="size-14 rounded-full" />
            <Swatch classes="glow-base glow-halo/40" fill="bg-violet-500" shape="size-14 rounded-full" />
            <Swatch classes="glow-base glow-halo/60" fill="bg-violet-500" shape="size-14 rounded-full" />
            <Swatch classes="glow-base glow-halo/80" fill="bg-violet-500" shape="size-14 rounded-full" />
            <Swatch classes="glow-base glow-halo/80 glow-halo-blur-40 glow-halo-spread-4" fill="bg-violet-500" shape="size-14 rounded-full" label="wider" />
          </div>
        </div>
      </Demo>
    </Section>
  )
}
