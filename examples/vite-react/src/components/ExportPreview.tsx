import { Rim, usePointerLight } from "@exegia/specular/react"
import { useRef, useState } from "react"

import { cn } from "../lib/cn.ts"

export type PreviewKind = "surface" | "plugin" | "merge" | "react"

const PRESETS = [
  { name: "bezel", className: "bezel-base", description: "Inset highlight + shade" },
  { name: "card", className: "card-base", description: "Inset edge + outer shadow" },
  { name: "well", className: "well-base", description: "Recessed shade + lower lip" },
] as const

function SurfacePreview() {
  const [selected, setSelected] = useState(0)
  const preset = PRESETS[selected]!
  return (
    <>
      <div className="flex flex-wrap justify-center gap-2" aria-label="Surface preset">
        {PRESETS.map((item, index) => (
          <button key={item.name} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}
            className={cn("rounded-md px-3 py-1 text-xs", selected === index ? "bg-stone-800 text-white dark:bg-neutral-200 dark:text-neutral-900" : "hover:bg-stone-300 dark:hover:bg-neutral-700")}>
            {item.name}
          </button>
        ))}
      </div>
      <div className={cn("mx-auto size-16 rounded-2xl bg-stone-300 transition-shadow dark:bg-neutral-700", preset.className)} aria-hidden="true" />
      <p className="text-xs">{preset.description}</p>
      <p className="text-xs text-stone-500 dark:text-neutral-400">Configured surfaces rendered by the plugin.</p>
    </>
  )
}

function PluginPreview() {
  const [lit, setLit] = useState(true)
  return (
    <>
      <button type="button" aria-pressed={lit} onClick={() => setLit(!lit)} className="text-xs underline underline-offset-4">
        {lit ? "Remove bezel utilities" : "Apply bezel utilities"}
      </button>
      <div className="flex items-center justify-center gap-8">
        <div className="size-16 rounded-full bg-stone-300 dark:bg-neutral-700" aria-label="Flat surface" role="img" />
        <span aria-hidden="true">→</span>
        <div className={cn("size-16 rounded-full bg-stone-300 transition-shadow dark:bg-neutral-700", lit && "bezel-base")} aria-label={lit ? "Surface with bezel utilities" : "Flat surface"} role="img" />
      </div>
      <code className="text-xs">{lit ? 'className="bezel-base"' : 'className=""'}</code>
      <p className="text-xs text-stone-500 dark:text-neutral-400">One class applies every configured layer.</p>
    </>
  )
}

function MergePreview() {
  const [strong, setStrong] = useState(true)
  const override = strong ? "bezel-lit/80" : "bezel-lit/20"
  const result = cn("bezel-lit/40", override)
  return (
    <>
      <button type="button" aria-pressed={strong} onClick={() => setStrong(!strong)} className="text-xs underline underline-offset-4">Toggle the final class</button>
      <div className="flex items-center justify-center gap-5">
        <code className="text-xs leading-6"><span className="text-stone-500 line-through">bezel-lit/40</span><br />{override}</code>
        <span aria-hidden="true">→</span>
        <div className={cn("size-16 rounded-full bg-stone-300 dark:bg-neutral-700", result)} aria-hidden="true" />
      </div>
      <output className="block font-mono text-xs" aria-live="polite">cn() → {result}</output>
      <p className="text-xs text-stone-500 dark:text-neutral-400">The last alpha wins; conflicting classes are removed.</p>
    </>
  )
}

function ReactPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref, { damping: 0.4 })
  return (
    <>
      <p className="text-xs">Move your pointer around the rims</p>
      <div className="flex justify-center gap-10">
        <div className="space-y-2">
          <div className="relative size-16 rounded-full bg-stone-400 dark:bg-neutral-600"><Rim hi={0.8} lo={0.4} className="rounded-full" /></div>
          <p className="text-xs">Rim</p>
        </div>
        <div className="space-y-2">
          <div ref={ref} className="relative size-16 rounded-full bg-stone-400 dark:bg-neutral-600"><Rim angle={angle} hi={0.8} lo={0.4} className="rounded-full" /></div>
          <p className="text-xs">+ pointer</p>
        </div>
      </div>
      <p className="text-xs text-stone-500 dark:text-neutral-400">Same overlay. The hook adds movement.</p>
    </>
  )
}

export function ExportPreview({ kind }: { kind: PreviewKind }) {
  return (
    <div className="mt-5 flex h-64 shrink-0 flex-col justify-center gap-4 rounded-xl bg-stone-200/70 p-5 text-center text-stone-700 dark:bg-neutral-800 dark:text-neutral-200">
      {kind === "surface" && <SurfacePreview />}
      {kind === "plugin" && <PluginPreview />}
      {kind === "merge" && <MergePreview />}
      {kind === "react" && <ReactPreview />}
    </div>
  )
}
