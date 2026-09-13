import { litVars } from "@exegia/specular"
import { Rim, usePointerLight } from "@exegia/specular/react"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { cn } from "./lib/cn.ts"

type Preset = "card" | "raised"

/** Literal class strings — Tailwind's scanner can't see interpolated names. */
const BASE_CLASS: Record<Preset, string> = { card: "card-base", raised: "raised-base" }

/** Follow speed. 1 = the shadow snaps to the cursor; smaller = heavier.
 *  (The `mouse · 0.4` knob — every eased frame moves this fraction of the
 *  remaining distance, then keeps easing after the pointer stops.) */
const FOLLOW_DAMPING = 0.4

/** `.dark` on <html>; the plugin's dark presets land under the same class. */
function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return [dark, () => setDark((d) => !d)]
}

/** Ambient CSS reads --amb-light-x/y in -1..1; a bearing becomes a unit vector. */
function ambLightVars(angle: number) {
  const rad = (angle * Math.PI) / 180
  return {
    "--amb-light-x": Math.sin(rad).toFixed(2),
    "--amb-light-y": (-Math.cos(rad)).toFixed(2),
  } as CSSProperties
}

/** Ambient CSS surface that re-aims the scene light at the pointer. */
function AmbLit({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref, { damping: FOLLOW_DAMPING })
  return (
    <div ref={ref} style={ambLightVars(angle)} className={className}>
      {children}
    </div>
  )
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
function LitCard({ children, depth, className, surface = "card" }: { children: ReactNode; depth?: number; className?: string; surface?: Preset }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref, { damping: FOLLOW_DAMPING })
  return (
    <div
      ref={ref}
      style={litVars(angle, depth, surface)}
      className={cn("rounded-xl bg-stone-200 p-5 dark:bg-neutral-800/50", BASE_CLASS[surface], className)}
    >
      {children}
    </div>
  )
}

/** A list row: same math, horizontal layout, its own light. */
function LitRow({ hue, initials, title, preview, time, surface = "card" }: { hue: number; initials: string; title: string; preview: string; time: string; surface?: Preset }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref, { damping: FOLLOW_DAMPING })
  return (
    <div
      ref={ref}
      style={litVars(angle, 1.2, surface)}
      className={cn("flex items-center gap-4 rounded-xl bg-stone-200 px-4 py-3 dark:bg-neutral-800/50", BASE_CLASS[surface])}
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
  usePointerLight(ref, { mode: "var", damping: FOLLOW_DAMPING })
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
  const angle = usePointerLight(ref, { damping: FOLLOW_DAMPING })
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

/** Copy/paste-ready surface presets. Both expose the same `lit` layer, so
 * components switch by surface name only. */
const PRESETS = {
  card: `// flat — hairline light, ring, micro drop
import { defineSurfaces } from "@exegia/specular"
export const surfaces = defineSurfaces({
  card: { layers: {
    lit: { inset: true, color: "#fff", y: 1, blur: 1, alpha: 70 },
    ring: { inset: false, color: "#000", blur: 0, spread: 0.2, alpha: 14 },
    drop: { inset: false, color: "#000", y: 4, blur: 2, alpha: 4 },
  }},
})`,
  raised: `// raised — same hairline + stacked contact/penumbra/umbra
import { defineSurfaces } from "@exegia/specular"
export const surfaces = defineSurfaces({
  card: { layers: {
    lit:      { inset: true,  color: "#fff", y: 1,  blur: 1,  alpha: 70 },
    ring:     { inset: false, color: "#000", blur: 0,  spread: 0.2, alpha: 14 },
    contact:  { inset: false, color: "#000", y: 2,  blur: 3,  alpha: 8 },
    penumbra: { inset: false, color: "#000", y: 5,  blur: 10, alpha: 5 },
    umbra:    { inset: false, color: "#000", y: 12, blur: 24, alpha: 4 },
  }},
})`,
}

export function App() {
  const [dark, toggleTheme] = useTheme()
  const [preset, setPreset] = useState<"card" | "raised">("card")
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-white">A page lit from everywhere</h2>
          <div className="inline-flex gap-1 rounded-xl bg-stone-300/70 p-1 dark:bg-neutral-900">
            {(["card", "raised"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-shadow duration-150",
                  preset === p
                    ? "bg-stone-100 text-stone-900 bezel-base dark:bg-neutral-700 dark:text-white"
                    : "text-stone-600 hover:text-stone-900 dark:text-neutral-400"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
          One window listener, one rAF per frame for the whole page. Every card, row, pill and avatar below derives its
          light direction from the same pointer bearing.
        </p>
        <Snippet>{PRESETS[preset]}</Snippet>

        <div className="grid gap-8 rounded-3xl bg-stone-200/50 p-6 sm:p-8 dark:bg-stone-900/50">
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
              <LitCard key={title} depth={1.2} surface={preset}>
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
              <LitRow key={row.title} {...row} surface={preset} />
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

      <section className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Same cursor, Ambient CSS</h2>
          <code className="w-fit rounded-full bg-stone-200 px-3 py-1 font-mono text-[11px] text-stone-600 bezel-base dark:bg-neutral-800 dark:text-neutral-400">
            --amb-light-x/y ← usePointerLight
          </code>
        </div>

        <div className="amb-scene grid gap-8 rounded-[2rem] p-8 sm:p-12 dark:bg-stone-900/50 bg-stone-200/50">
          <div className="grid items-center gap-8 sm:grid-cols-3">
            <AmbLit className="ambient amb-surface amb-chamfer amb-elevation amb-rounded-lg grid h-28 place-items-center text-sm font-medium">
              <span style={{ color: "var(--amb-label)" }}>flat · chamfer</span>
            </AmbLit>
            <AmbLit className="ambient amb-surface-concave amb-fillet amb-elevation amb-rounded-lg grid h-28 place-items-center text-sm font-medium">
              <span style={{ color: "var(--amb-label)" }}>concave · fillet</span>
            </AmbLit>
            <AmbLit className="ambient amb-surface-convex amb-chamfer amb-elevation amb-rounded-full mx-auto grid size-28 place-items-center text-sm font-semibold">
              <span style={{ color: "var(--amb-label)" }}>convex</span>
            </AmbLit>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {["Play", "Stop", "Rec"].map((label) => (
              <AmbLit key={label} className="ambient amb-surface-convex amb-chamfer amb-elevation amb-rounded-md">
                <button
                  type="button"
                  className="grid h-11 w-24 cursor-pointer place-items-center text-sm font-semibold select-none"
                  style={{ color: "var(--amb-label)" }}
                >
                  {label}
                </button>
              </AmbLit>
            ))}
            <AmbLit className="ambient amb-surface-concave amb-groove amb-rounded-md">
              <div className="grid h-11 w-44 place-items-center font-mono text-xs text-stone-500">groove track</div>
            </AmbLit>
            <span className="ml-auto font-mono text-xs text-stone-500">albedo lab(92.6%) · hue 234 · key .9 · fill .7</span>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-stone-500 dark:text-neutral-500">
        every surface is a box-shadow · full walkthrough in examples/vite-react
      </footer>
    </main>
  )
}
