"use client"

import { Rim, usePointerLight } from "@exegia/specular/react"
import { useRef } from "react"

import { Code } from "../components/Code.tsx"
import { LitAvatar } from "../components/LitAvatar.tsx"

function Orb() {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)
  const bearing = Math.round(((angle % 360) + 360) % 360)
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={ref}
        className="relative size-44 rounded-full bg-[radial-gradient(circle_at_38%_32%,#fafaf9,#a8a29e_70%,#78716c)] bezel-lit/90 bezel-lit-t-3 bezel-lit-blur-4 bezel-dim/30 bezel-dim-b-2 bezel-dim-blur-4 sm:size-56 dark:bg-[radial-gradient(circle_at_38%_32%,#525252,#262626_70%,#171717)]"
      >
        <Rim angle={angle * 0.8} className="rounded-full" />
      </div>
      <div className="font-mono text-xs text-stone-500 tabular-nums dark:text-neutral-500">bearing {bearing}° · rim at {Math.round(bearing * 0.8)}°</div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
      <div className="max-w-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-200 px-3 py-1 font-mono text-[11px] text-stone-600 bezel-base dark:bg-neutral-800 dark:text-neutral-400">
          @exegia/specular · Tailwind v4 · React 19
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl dark:text-white">
          Light that follows <span className="text-stone-500 dark:text-neutral-500">the cursor.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-stone-600 dark:text-neutral-400">
          Specular gives a Tailwind project a family of utilities that draw a two-layer inset bezel one axis at a time, a{" "}
          <code className="font-mono text-[0.9em]">cn()</code> that keeps those utilities alive, and a React rim that turns toward the pointer. Move your mouse
          around this page: every disc, button and card is lit by the same two ideas.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#basics" className="btn">
            Start with a bezel
          </a>
          <a href="#alive" className="btn bg-stone-800 text-white bezel-lit/25 bezel-dim/40 dark:bg-white dark:text-neutral-900 dark:bezel-lit/60">
            See it come alive
          </a>
        </div>
        <Code className="mt-8">{`
import { Rim, usePointerLight } from "@exegia/specular/react"

function Orb() {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)            // 0 = 12 o'clock, clockwise
  return (
    <div ref={ref} className="relative size-44 rounded-full bezel-base">
      <Rim angle={angle * 0.8} className="rounded-full" />
    </div>
  )
}`}</Code>
      </div>
      <div className="flex flex-col items-center gap-10">
        <Orb />
        <div className="flex items-end gap-5">
          <LitAvatar damping={1} className="size-12 bg-amber-200 dark:bg-amber-900">
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">1.0</span>
          </LitAvatar>
          <LitAvatar damping={0.8} className="size-16 bg-sky-200 dark:bg-sky-900">
            <span className="text-xs font-semibold text-sky-900 dark:text-sky-200">0.8</span>
          </LitAvatar>
          <LitAvatar damping={0.5} className="size-20 bg-rose-200 dark:bg-rose-900">
            <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">0.5</span>
          </LitAvatar>
          <LitAvatar damping={0.25} className="size-24 bg-emerald-200 dark:bg-emerald-900">
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">0.25</span>
          </LitAvatar>
        </div>
        <p className="max-w-xs text-center text-xs text-stone-500 dark:text-neutral-500">
          Same hook, four dampings. <code className="font-mono">angle * 1</code> points straight at the cursor; smaller factors lag behind it, which reads as
          weight.
        </p>
      </div>
    </section>
  )
}
