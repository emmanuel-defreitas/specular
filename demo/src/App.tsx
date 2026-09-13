import { Rim, usePointerLight } from "@exegia/specular/react"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { cn } from "./lib/cn.ts"

type LitVars = CSSProperties & Record<`--tw-${string}-lit-x` | `--tw-${string}-lit-y`, string>

/** Bearing 0 = 12 o'clock. The offset (-sin, +cos) exposes the band facing the pointer. */
function litVars(angle: number, depth = 2.5, surface = "card"): LitVars {
  const rad = (angle * Math.PI) / 180
  const vars: Record<string, string> = {
    [`--tw-${surface}-lit-x`]: `${(-Math.sin(rad) * depth).toFixed(2)}px`,
    [`--tw-${surface}-lit-y`]: `${(Math.cos(rad) * depth).toFixed(2)}px`,
  }
  return vars as LitVars
}

/** `.dark` on <html>; the plugin's dark presets land under the same class. */
function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return [dark, () => setDark((d) => !d)]
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Toggle dark mode"
      onClick={onToggle}
      className="ml-auto rounded-lg bg-stone-200 px-3 py-1.5 text-sm text-stone-600 btn-base dark:bg-neutral-800 dark:text-neutral-400"
    >
      {dark ? "☾ dark" : "☀ light"}
    </button>
  )
}

/** A card whose emboss itself turns toward the cursor. */
function LitCard({ children, depth, className }: { children: ReactNode; depth?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)
  return (
    <div
      ref={ref}
      style={litVars(angle, depth)}
      className={cn("rounded-xl bg-stone-200 p-5 card-base dark:bg-neutral-800/50 drop-shadow-[0px_0px_1px_rgba(0,0,0,0.1)]", className)}
    >
      {children}
    </div>
  )
}

/** A list row: same math, horizontal layout, its own light. */
function LitRow({ hue, initials, title, preview, time }: { hue: number; initials: string; title: string; preview: string; time: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)
  return (
    <div
      ref={ref}
      style={litVars(angle, 1.2)}
      className="flex items-center gap-4 rounded-xl bg-stone-200 px-4 py-3 card-base dark:bg-neutral-800/50 drop-shadow-xs"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold round-base"
        style={{ backgroundColor: `oklch(0.82 0.09 ${hue})` }}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-stone-900 dark:text-white">{title}</div>
        <div className="truncate text-sm text-stone-500 dark:text-neutral-400">{preview}</div>
      </div>
      <span className="shrink-0 font-mono text-xs text-stone-400 tabular-nums dark:text-neutral-600">{time}</span>
    </div>
  )
}

/** Rim disc: highlight sweep rotates toward the pointer, no re-render. */
function RimTile({ hue, initials, size = 20 }: { hue: number; initials: string; size?: 10 | 12 | 16 | 20 }) {
  const ref = useRef<HTMLSpanElement>(null)
  usePointerLight(ref, { mode: "var" })
  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold round-lit drop-shadow-xs",
        { 10: "size-10 text-xs", 12: "size-12 text-xs", 16: "size-16 text-sm", 20: "size-20 text-lg" }[size]
      )}
      style={{ backgroundColor: `oklch(0.78 0.12 ${hue})` }}
    >
      {initials}
      <Rim className="rounded-full" style={{ transform: "rotate(calc(var(--light-angle, 0deg) * 0.3))" }} />
    </span>
  )
}

/** A nav pill: the small bezel follows the cursor with a shallower depth. */
function LitNav({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const angle = usePointerLight(ref)
  return (
    <button
      ref={ref}
      type="button"
      style={litVars(angle, 1.2, "btn")}
      className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm text-stone-600 btn-base dark:bg-neutral-800 dark:text-neutral-400"
    >
      {label}
    </button>
  )
}

function Snippet({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-stone-900 p-4 font-mono text-xs leading-relaxed text-stone-100 dark:bg-neutral-900">
      {children}
    </pre>
  )
}

const APPLY = `# 1. install
npm i @exegia/specular

// 2. declare surfaces — bezel.config.ts
import { defineSurfaces } from "@exegia/specular"
export const surfaces = defineSurfaces({
  card: { layers: {
    lit: { inset: true, color: "#fff", y: 1, blur: 1, alpha: 70 },
  }},
})

// 3. tailwind.plugin.js
import { createPlugin } from "@exegia/specular/plugin"
import { surfaces } from "./bezel.config"
export default createPlugin(surfaces)

/* 4. index.css */
@import "tailwindcss";
@plugin "./tailwind.plugin.js";

<!-- 5. use it -->
<div class="card-base hover:card-lit-t-2
            transition-[box-shadow,transform] duration-300" />`

const ROWS = [
  { hue: 80, initials: "AL", title: "Ada Lovelace", preview: "The analytical engine notes are ready for review.", time: "09:41" },
  { hue: 200, initials: "BK", title: "Bruno Kessler", preview: "Shipped the walker patch — TF031 is silent now.", time: "08:17" },
  { hue: 300, initials: "CM", title: "Claude Monet", preview: "Water lilies, fourth study. The light moves.", time: "Yesterday" },
  { hue: 140, initials: "DN", title: "David Nolan", preview: "Merge config lands with the cross-surface matrix.", time: "Yesterday" },
] as const

const CARD_TILES = [
  { title: "Aperture", hue: 45, initials: "f/", value: "1.8" },
  { title: "Focal length", hue: 190, initials: "mm", value: "35" },
  { title: "Exposure", hue: 320, initials: "s", value: "250" },
] as const

export function App() {
  const [dark, toggleTheme] = useTheme()
  return (
    <main className="relative mx-auto grid max-w-4xl gap-14 px-6 py-16">
      <header className="grid gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-stone-200 px-3 py-1 font-mono text-[11px] text-stone-600 bezel-base dark:bg-neutral-800 dark:text-neutral-400">
            @exegia/specular · demo
          </div>
          <ThemeToggle dark={dark} onToggle={toggleTheme} />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-white">
          Every element answers the pointer.
        </h1>
      </header>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">How to apply it</h2>
        <Snippet>{APPLY}</Snippet>
      </section>

      <section className="grid gap-6">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">A page lit from everywhere</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
          One window listener, one rAF per frame for the whole page. Every card, row, pill and avatar below derives its
          light direction from the same pointer bearing.
        </p>

        <div className="grid gap-8 rounded-3xl bg-stone-200/50 p-6 sm:p-8 dark:bg-neutral-900/50">
          <div className="flex flex-wrap items-center gap-3">
            <RimTile hue={40} initials="◆" size={12} />
            <nav className="flex flex-wrap gap-2">
              {["Inbox", "Today", "Snoozed", "Sent"].map((label) => (
                <LitNav key={label} label={label} />
              ))}
            </nav>
            <div className="ml-auto flex items-center -space-x-2">
              <RimTile hue={80} initials="AL" size={10} />
              <RimTile hue={200} initials="BK" size={10} />
              <RimTile hue={330} initials="CM" size={10} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {CARD_TILES.map(({ title, hue, initials, value }) => (
              <LitCard key={title} depth={1.2}>
                <div className="flex items-center justify-between">
                  <RimTile hue={hue} initials={initials} size={10} />
                  <span className="font-mono text-xs text-stone-400 dark:text-neutral-500">{value}</span>
                </div>
                <div className="mt-4 font-medium text-stone-900 dark:text-white">{title}</div>
                <div className="mt-1 text-sm text-stone-500 dark:text-neutral-400">The near edge is lit.</div>
              </LitCard>
            ))}
          </div>

          <div className="grid gap-2">
            {ROWS.map((row) => (
              <LitRow key={row.title} {...row} />
            ))}
          </div>

          <LitCard depth={1.2}>
            <div className="flex items-center gap-5">
              <RimTile hue={160} initials="EP" size={16} />
              <div>
                <div className="font-medium text-stone-900 dark:text-white">Elif Polat joined the corpus review</div>
                <div className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                  The card and the avatar each keep their own light — instance properties do not inherit.
                </div>
              </div>
            </div>
          </LitCard>
        </div>
      </section>

      <footer className="text-center text-xs text-stone-500 dark:text-neutral-500">
        every surface is a box-shadow · full walkthrough in examples/vite-react
      </footer>
    </main>
  )
}
