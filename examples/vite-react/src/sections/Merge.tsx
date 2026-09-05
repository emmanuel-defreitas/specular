"use client"

import { useState } from "react"
import { twMerge } from "tailwind-merge"

import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { cn } from "../lib/cn.ts"

const PRESETS: { label: string; a: string; b: string; why: string }[] = [
  {
    label: "later should win",
    a: "bezel-lit/40 bezel-lit-t-2",
    b: "bezel-lit/80 bezel-lit-t-4",
    why: "Stock tailwind-merge has never heard of `bezel`, so it keeps all four. Both alphas and both depths reach the element and the stylesheet's own order decides — the class string no longer tells you what you get.",
  },
  {
    label: "all-layer beats per-layer",
    a: "bezel-lit-blur-2 bezel-dim-blur-2",
    b: "bezel-blur-6",
    why: "bezel-blur-6 writes the same variables as both per-layer classes, so the generated config displaces them. Stock keeps everything.",
  },
  {
    label: "surface beats core shadow",
    a: "shadow-lg",
    b: "bezel-lit",
    why: "A surface owns box-shadow. Stock keeps both and leaves two box-shadow declarations to fight; cn() keeps the later one. Swap the two fields and shadow-lg wins instead.",
  },
  {
    label: "two surfaces, one element",
    a: "bezel-lit bezel-dim",
    b: "card-lit card-drop",
    why: "Two surfaces on one element means one box-shadow wins outright. The generated config carries the full cross-surface matrix.",
  },
  {
    label: "a family named after a core root",
    a: "inset-shadow-lit-t-2",
    b: "inset-shadow-dim-b-1",
    why: "The other failure. A family whose name starts with a core group (`inset-shadow-*`, `shadow-*`) is filed under that group by stock tailwind-merge and only the last class survives: the lit layer never reaches the screen. This page has no such surface, so cn() behaves like stock here; declare one with allowCoreCollision and mergeConfig() handles it.",
  },
]

function Diff({ input, output }: { input: string; output: string }) {
  const kept = new Set(output.split(/\s+/))
  return (
    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
      {input
        .split(/\s+/)
        .filter(Boolean)
        .map((c, i) => (
          <span
            key={`${c}-${i}`}
            className={
              kept.has(c)
                ? "rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                : "rounded-md bg-rose-100 px-1.5 py-0.5 text-rose-900 line-through decoration-rose-400 dark:bg-rose-950 dark:text-rose-300"
            }
          >
            {c}
          </span>
        ))}
    </div>
  )
}

export function Merge() {
  const [a, setA] = useState(PRESETS[0]?.a ?? "")
  const [b, setB] = useState(PRESETS[0]?.b ?? "")
  const [why, setWhy] = useState(PRESETS[0]?.why ?? "")
  const input = `${a} ${b}`.trim()
  const stock = twMerge(a, b)
  const ours = cn(a, b)
  const inputCls =
    "h-10 w-full rounded-lg bg-stone-200 px-3 font-mono text-sm outline-none well-base transition-shadow focus:well-shade/8 dark:bg-neutral-900"
  return (
    <Section
      id="merge"
      number="07 · cn()"
      title="Why the merge config ships with the plugin"
      lede={
        <>
          Stock tailwind-merge fails a custom shadow family in one of two ways. A name it does not know (<code className="font-mono text-[0.9em]">bezel-*</code>)
          is never merged, so <code className="font-mono text-[0.9em]">twMerge("bezel-lit/40", "bezel-lit/80")</code> keeps both and the stylesheet decides. A
          name that shares a prefix with a core group (<code className="font-mono text-[0.9em]">inset-shadow-*</code>) is folded into that group, so{" "}
          <code className="font-mono text-[0.9em]">twMerge("inset-shadow-lit-t-2", "inset-shadow-dim-b-1")</code> keeps only the last.{" "}
          <code className="font-mono text-[0.9em]">createCn(surfaces)</code> is generated from the same config the plugin compiled, so it knows every utility,
          every conflict and every cross-surface collision.
        </>
      }
    >
      <Demo
        title="Try it"
        description="Two class strings go in; the stock merge and the generated one come out. Struck-through classes were dropped."
        code={`
import { createCn } from "@exegia/specular/merge"
import { surfaces } from "./specular.config"
export const cn = createCn(surfaces)          // accepts strings, arrays, falsy — like twMerge`}
      >
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setA(p.a)
                  setB(p.b)
                  setWhy(p.why)
                }}
                className={cn("btn h-8 px-3 text-xs", a === p.a && b === p.b && "bg-stone-800 text-white bezel-lit/25 dark:bg-white dark:text-neutral-900")}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input aria-label="first classes" className={inputCls} value={a} onChange={(e) => setA(e.target.value)} />
            <input aria-label="second classes" className={inputCls} value={b} onChange={(e) => setB(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 rounded-xl bg-stone-200/70 p-4 dark:bg-neutral-900">
              <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">stock twMerge</div>
              <Diff input={input} output={stock} />
              <div className="mt-3 flex h-14 items-center justify-center rounded-xl bg-stone-200 dark:bg-neutral-800">
                <div className={cn("size-10 rounded-full bg-stone-200 dark:bg-neutral-800", stock)} />
              </div>
            </div>
            <div className="grid gap-2 rounded-xl bg-stone-200/70 p-4 dark:bg-neutral-900">
              <div className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-neutral-500">createCn(surfaces)</div>
              <Diff input={input} output={ours} />
              <div className="mt-3 flex h-14 items-center justify-center rounded-xl bg-stone-200 dark:bg-neutral-800">
                <div className={cn("size-10 rounded-full bg-stone-200 dark:bg-neutral-800", ours)} />
              </div>
            </div>
          </div>
          {why && <p className="text-sm text-stone-600 dark:text-neutral-400">{why}</p>}
        </div>
      </Demo>
    </Section>
  )
}
