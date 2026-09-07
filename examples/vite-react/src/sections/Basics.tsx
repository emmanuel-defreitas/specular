import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

export function Basics() {
  return (
    <Section
      id="basics"
      number="01 · Surfaces"
      title="One family of utilities per surface"
      lede={
        <>
          A <em>surface</em> is a named set of shadow layers declared once in <code className="font-mono text-[0.9em]">specular.config.ts</code>. The plugin
          turns each layer into utilities that write one custom property each, and every utility also emits the composed{" "}
          <code className="font-mono text-[0.9em]">box-shadow</code>, so any single class stands on its own.{" "}
          <code className="font-mono text-[0.9em]">bezel-base</code> is the surface exactly as configured; <code className="font-mono text-[0.9em]">bezel-lit</code>{" "}
          is the same with that layer pushed to full alpha, and <code className="font-mono text-[0.9em]">bezel-lit/40</code> sets it explicitly. This page
          declares four surfaces: <em>bezel</em>, <em>card</em>, <em>well</em> and <em>glow</em>.
        </>
      }
    >
      <Demo
        title="Flat, then lit"
        description="The same disc four ways. The classes on the right are the only difference — no gradients, no borders, no pseudo-elements."
        code={`
<div class="size-20 rounded-full bg-stone-300" />               <!-- flat -->
<div class="size-20 rounded-full bg-stone-300 bezel-base" />    <!-- emboss: lit 80% on top, dim 15% below -->
<div class="size-20 rounded-full bg-stone-300 card-base" />     <!-- raised: hairline inside, drop shadow outside -->
<div class="size-20 rounded-full bg-stone-300 well-base" />     <!-- recessed: shade cast in from the top -->
<div class="size-20 rounded-full bg-stone-300 bezel-lit bezel-dim" />   <!-- both layers at full alpha -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-8">
          <Swatch classes="" label="flat" />
          <Swatch classes="bezel-base" label="bezel — emboss" />
          <Swatch classes="card-base" label="card — raised" />
          <Swatch classes="well-base" label="well — recessed" />
          <Swatch classes="bezel-lit bezel-dim" label="bezel — full alpha" />
        </div>
      </Demo>

      <Demo
        title="Controls"
        description={
          <>
            Buttons, inputs and a switch built from the same three surfaces. The button is an{" "}
            <code className="font-mono">@apply</code> in <code className="font-mono">index.css</code>: a surface is ordinary utilities, so it composes inside{" "}
            <code className="font-mono">@layer components</code> and takes <code className="font-mono">active:</code> like any other class.
          </>
        }
        code={`
.btn {
  @apply inline-flex h-10 items-center rounded-lg bg-stone-200 px-4 text-sm font-medium
    bezel-base transition-shadow duration-150
    active:bezel-lit/20 active:bezel-dim/40;         /* press: highlight fades, shadow deepens */
}

<input class="h-10 rounded-lg bg-stone-200 px-3 well-base focus:well-shade/8" />`}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">bezel · press me</div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn">
                Default
              </button>
              <button type="button" className="btn bg-stone-800 text-white bezel-lit/25 bezel-dim/40 dark:bg-white dark:text-neutral-900 dark:bezel-lit/60">
                Primary
              </button>
              <button type="button" className="btn bg-emerald-500 text-white bezel-lit/50 bezel-dim/30 bezel-dim-color-emerald-950">
                Confirm
              </button>
              <button type="button" className="btn size-10 rounded-full px-0 text-lg" aria-label="Add">
                +
              </button>
            </div>
            <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">pill group</div>
            <div className="inline-flex w-fit gap-1 rounded-full bg-stone-300/70 p-1 well-base dark:bg-neutral-800">
              {["Day", "Week", "Month"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={
                    i === 1
                      ? "rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium bezel-base dark:bg-neutral-600"
                      : "rounded-full px-4 py-1.5 text-sm text-stone-600 dark:text-neutral-400"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">well · fields</div>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-stone-600 dark:text-neutral-400">Name</span>
              <input
                className="h-10 rounded-lg bg-stone-200 px-3 outline-none well-base transition-shadow focus:well-shade/8 dark:bg-neutral-900"
                placeholder="Ada Lovelace"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-stone-600 dark:text-neutral-400">Search</span>
              <input
                className="h-10 rounded-full bg-stone-200 px-4 outline-none well-base transition-shadow focus:well-shade/8 dark:bg-neutral-900"
                placeholder="Focus me — the well shallows"
              />
            </label>
            <div className="flex items-center gap-3 pt-1">
              <div className="relative h-2 flex-1 rounded-full bg-stone-300 well-base dark:bg-neutral-800">
                <div className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-sky-500 bezel-lit/40 bezel-dim/30" />
                <div className="absolute top-1/2 left-3/5 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-100 bezel-base dark:bg-neutral-300" />
              </div>
              <span className="w-8 font-mono text-xs text-stone-500">60</span>
            </div>
          </div>
        </div>
      </Demo>
    </Section>
  )
}
