"use client"

import { Rim, usePointerLight } from "@exegia/specular/react"
import { useRef, useState, type CSSProperties, type ReactNode } from "react"

import { Chip } from "../components/Code.tsx"
import { Demo } from "../components/Demo.tsx"
import { LitAvatar } from "../components/LitAvatar.tsx"
import { Section } from "../components/Section.tsx"
import { cn } from "../lib/cn.ts"

/**
 * The bezel itself turns toward the cursor. `usePointerLight` gives the
 * bearing; the offsets are derived from it and written to the INSTANCE tier
 * (`--tw-bezel-lit-x`, …) inline. Those properties are registered with
 * `inherits: false`, so a nested surface inside the card keeps its own light.
 */
function LitCard({ children, className, depth = 2.5 }: { children: ReactNode; className?: string; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)
  const rad = (angle * Math.PI) / 180
  // Bearing 0 is 12 o'clock. An inset layer offset (0, +d) exposes the TOP
  // band, so the highlight sits opposite the offset: offset = -direction * d.
  const litX = -Math.sin(rad) * depth
  const litY = Math.cos(rad) * depth
  const vars = {
    "--tw-bezel-lit-x": `${litX.toFixed(2)}px`,
    "--tw-bezel-lit-y": `${litY.toFixed(2)}px`,
    "--tw-bezel-dim-x": `${(-litX * 0.6).toFixed(2)}px`,
    "--tw-bezel-dim-y": `${(-litY * 0.6).toFixed(2)}px`,
  } as CSSProperties
  return (
    <div ref={ref} style={vars} className={cn("rounded-2xl bg-stone-200 p-5 bezel-base bezel-lit-blur-3 bezel-dim-blur-3 dark:bg-neutral-800", className)}>
      {children}
    </div>
  )
}

/** The list escape hatch: no re-render, the hook writes `--light-angle` on the element. */
function VarTile({ hue }: { hue: number }) {
  const ref = useRef<HTMLDivElement>(null)
  usePointerLight(ref, { mode: "var" })
  return (
    <div ref={ref} className="relative size-10 rounded-full bezel-base" style={{ backgroundColor: `oklch(0.78 0.12 ${hue})` }}>
      <Rim className="rounded-full" style={{ transform: "rotate(calc(var(--light-angle, 0deg) * 0.8))" }} />
    </div>
  )
}

const CARD = "rounded-2xl bg-stone-100 p-5 card-base transition-[box-shadow,transform] duration-300 dark:bg-neutral-800"
const CARD_HOVER = "hover:-translate-y-0.5 hover:card-drop/25 hover:card-drop-t-10 hover:card-drop-blur-24 dark:hover:card-drop/80"

export function Alive() {
  const [pressed, setPressed] = useState<"list" | "grid" | "map">("grid")
  return (
    <Section
      id="alive"
      number="05 · Alive"
      title="A page that answers the pointer"
      lede={
        <>
          Static light says "this is a thing". Light that <em>moves</em> says "this is a thing in a room". Two mechanisms: state changes on{" "}
          <code className="font-mono text-[0.9em]">hover:</code> and <code className="font-mono text-[0.9em]">active:</code> that the browser tweens because{" "}
          <code className="font-mono text-[0.9em]">box-shadow</code> transitions, and a bearing from <code className="font-mono text-[0.9em]">usePointerLight</code>{" "}
          that turns the light toward the cursor.
        </>
      }
    >
      <Demo
        title="Hover: the card lifts"
        description="A raised card whose drop layer grows deeper, softer and darker under the cursor. Nothing but hover: utilities and transition-shadow."
        code={`
<div class="rounded-2xl bg-stone-100 p-5 card-base
            transition-[box-shadow,transform] duration-300
            hover:-translate-y-0.5 hover:card-drop/25 hover:card-drop-t-10 hover:card-drop-blur-24">`}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {["Inbox", "Drafts", "Archive"].map((title, i) => (
            <a key={title} href="#alive" className={cn(CARD, CARD_HOVER, "block")}>
              <div className="mb-3 size-8 rounded-lg bg-stone-300 bezel-base dark:bg-neutral-700" />
              <div className="font-medium text-stone-900 dark:text-white">{title}</div>
              <div className="mt-1 text-sm text-stone-500 dark:text-neutral-400">{[12, 3, 148][i]} items</div>
            </a>
          ))}
        </div>
      </Demo>

      <Demo
        title="Press: the button sinks"
        description="A pressed control swaps its emboss for a well. In a segmented control the selected item is the one that is raised; the others sit in the track."
        code={`
<button aria-pressed="true"  class="rounded-lg bg-stone-100 bezel-base" />
<button aria-pressed="false" class="rounded-lg well-shade/0 well-lip/0 hover:well-shade/10" />`}
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="inline-flex gap-1 rounded-xl bg-stone-300/70 p-1 well-base dark:bg-neutral-900">
            {(["list", "grid", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={pressed === v}
                onClick={() => setPressed(v)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-shadow duration-150",
                  pressed === v
                    ? "bg-stone-100 text-stone-900 bezel-base dark:bg-neutral-700 dark:text-white"
                    : "text-stone-600 well-shade/0 well-lip/0 hover:well-shade/10 dark:text-neutral-400"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button type="button" className="btn">
            hold me
          </button>
          <button type="button" className="btn size-12 rounded-full px-0 text-xl bezel-lit-t-3 bezel-dim-b-2 active:bezel-lit-t-1 active:bezel-dim-b-1">
            ●
          </button>
        </div>
      </Demo>

      <Demo
        title="The bezel turns toward the cursor"
        description={
          <>
            Here the pointer drives the <em>emboss itself</em>. The bearing from <code className="font-mono">usePointerLight</code> becomes an (x, y) offset
            for each layer, written inline to the instance tier. Move across the cards: the lit edge is always the one nearest you, and the small disc
            inside keeps its own top light because instance properties do not inherit.
          </>
        }
        code={`
const angle = usePointerLight(ref)
const rad = (angle * Math.PI) / 180
const style = {
  "--tw-bezel-lit-x": \`\${-Math.sin(rad) * 2.5}px\`,   // instance tier, this element only
  "--tw-bezel-lit-y": \`\${ Math.cos(rad) * 2.5}px\`,
  "--tw-bezel-dim-x": \`\${ Math.sin(rad) * 1.5}px\`,
  "--tw-bezel-dim-y": \`\${-Math.cos(rad) * 1.5}px\`,
}
<div ref={ref} style={style} className="rounded-2xl bezel-base bezel-lit-blur-3" />`}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {["Aperture", "Focal length", "Exposure"].map((t, i) => (
            <LitCard key={t}>
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-full bg-stone-300 bezel-base dark:bg-neutral-700" />
                <Chip>{["f/1.8", "35mm", "1/250"][i] ?? ""}</Chip>
              </div>
              <div className="mt-4 font-medium text-stone-900 dark:text-white">{t}</div>
              <div className="mt-1 text-sm text-stone-500 dark:text-neutral-400">The near edge is lit.</div>
            </LitCard>
          ))}
        </div>
      </Demo>

      <Demo
        title="Rims: the specular sweep"
        description={
          <>
            <code className="font-mono">{"<Rim>"}</code> is a masked conic gradient laid over the surface, rotated toward the pointer. It exists because an
            inset shadow paints <em>under</em> children: a full-bleed image would hide the emboss, so the rim is an overlay. One window listener and one
            animation frame serve every rim on the page.
          </>
        }
        code={`
<span ref={ref} className="relative size-16 rounded-full overflow-hidden bezel-base">
  <img src={src} className="size-full rounded-full object-cover" />
  <Rim angle={angle * 0.8} className="rounded-full" />
</span>`}
      >
        <div className="flex flex-wrap items-center justify-around gap-8">
          {[
            ["AL", "bg-amber-300 text-amber-950 dark:bg-amber-800 dark:text-amber-100"],
            ["BK", "bg-sky-300 text-sky-950 dark:bg-sky-800 dark:text-sky-100"],
            ["CM", "bg-rose-300 text-rose-950 dark:bg-rose-800 dark:text-rose-100"],
            ["DN", "bg-emerald-300 text-emerald-950 dark:bg-emerald-800 dark:text-emerald-100"],
            ["EP", "bg-violet-300 text-violet-950 dark:bg-violet-800 dark:text-violet-100"],
            ["FR", "bg-stone-500 text-white dark:bg-neutral-600"],
          ].map(([initials, color]) => (
            <LitAvatar key={initials} className={cn("size-20", color)}>
              <span className="text-lg font-semibold">{initials}</span>
            </LitAvatar>
          ))}
        </div>
      </Demo>

      <Demo
        title="Forty-eight of them, still one listener"
        description={
          <>
            <code className="font-mono">{'usePointerLight(ref, { mode: "var" })'}</code> writes <code className="font-mono">--light-angle</code> on the element
            and never re-renders. The rim reads it in CSS. This is the shape to use for a list or a grid.
          </>
        }
        code={`
usePointerLight(ref, { mode: "var" })          // writes --light-angle: <deg> on ref.current
<Rim style={{ transform: "rotate(calc(var(--light-angle, 0deg) * 0.8))" }} className="rounded-full" />`}
      >
        <div className="grid grid-cols-8 gap-3 sm:grid-cols-12">
          {Array.from({ length: 48 }, (_, i) => (
            <VarTile key={i} hue={(i * 360) / 48} />
          ))}
        </div>
      </Demo>
    </Section>
  )
}
