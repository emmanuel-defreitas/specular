import { usePointerLight } from "@exegia/specular/react"
import { useRef, useState } from "react"
import { Code } from "../components/Code.tsx"
import { Section } from "../components/Section.tsx"
import { boxShadow, cssCode, defaults, effectiveSurface, gpuiCode, tailwindCode, randomSurface, pointedSurface, type Layer } from "../lib/generator.ts"

function Slider({ label, value, min, max, onChange, unit = "px" }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; unit?: string }) {
  return <label className="grid grid-cols-[5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-xs">
    <span>{label}</span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 w-full accent-stone-700 dark:accent-neutral-300" />
    <output className="text-right font-mono tabular-nums">{value}{unit}</output>
  </label>
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex items-center justify-between gap-3 text-xs"><span>{label}</span><span className="flex items-center gap-2 font-mono">{value}<input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent" /></span></label>
}

export function Playground({ dark }: { dark: boolean }) {
  const [surfaces, setSurfaces] = useState({ light: defaults(false), dark: defaults(true) })
  const [format, setFormat] = useState<"CSS" | "Tailwind" | "GPUI">("CSS")
  const [follow, setFollow] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(previewRef, { enabled: follow, damping: 0.08 })
  const mode = dark ? "dark" : "light"
  const surface = effectiveSurface(surfaces[mode], dark)
  const update = (patch: Partial<typeof surface>) => setSurfaces((previous) => ({ ...previous, [mode]: { ...previous[mode], ...patch } }))
  const updateLayer = (name: "lit" | "dim", patch: Partial<Layer>) => update({ [name]: { ...surface[name], ...patch } })
  const previewSurface = follow ? pointedSurface(surface, angle) : surface
  const code = format === "CSS" ? cssCode(surface) : format === "Tailwind" ? tailwindCode(surface) : gpuiCode(surface)
  return <Section id="playground" number="Playground" title="Shape the light. Take the code."
    lede="Tune two inset layers, then copy the same surface as CSS, a Specular Tailwind config, or native Rust / GPUI. Light and dark settings are saved separately while you explore.">
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 text-sm"><span>{dark ? "Dark" : "Light"} surface · live preview</span><button type="button" className="underline underline-offset-4" onClick={() => update(defaults(dark))}>Reset {mode}</button></div>
        <div className="relative flex min-h-72 items-center justify-center rounded-2xl border border-stone-300 bg-stone-200 p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <button type="button" onClick={() => {
            const next = randomSurface(dark)
            update({ lit: next.lit, dim: next.dim, fill: next.fill })
          }} className="absolute top-3 right-3 rounded-lg border border-stone-400/40 bg-stone-100/90 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-white dark:border-neutral-600 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-900">Randomize</button>
          <div ref={previewRef} role="img" aria-label="Generated specular surface" style={{ width: surface.size, height: surface.size, borderRadius: surface.radius, background: surface.fill, boxShadow: boxShadow(previewSurface) }} />
        </div>
        <div className="space-y-2">
          <label className="flex w-fit cursor-pointer items-center gap-3 text-sm"><input type="checkbox" role="switch" checked={follow} onChange={(event) => setFollow(event.target.checked)} className="size-4 accent-stone-700 dark:accent-neutral-300" />Follow mouse</label>
          <p className="text-xs text-stone-500 dark:text-neutral-400">{follow ? "The preview follows your pointer with gentle damping. Exports keep the configured static direction; mouse tracking is preview-only." : "Turn on to move the light around the surface. Randomize uses muted colors and shallow edges, keeping your size and radius."}</p>
        </div>
        <div className="grid gap-4"><Color label="Surface color" value={surface.fill} onChange={(fill) => update({ fill })} /><Slider label="Size" min={64} max={240} value={surface.size} onChange={(size) => update({ size })} /><Slider label="Radius" min={0} max={120} value={surface.radius} onChange={(radius) => update({ radius })} /></div>
        <div className="grid gap-6 sm:grid-cols-2">
          {(["lit", "dim"] as const).map((name) => <fieldset key={name} className="min-w-0 space-y-4"><legend className="mb-3 font-medium">{name === "lit" ? "Lit · highlight" : "Dim · shade"}</legend>
            <Color label={`${name} color`} value={surface[name].color} onChange={(color) => updateLayer(name, { color })} />
            {(["x", "y", "blur", "spread", "alpha"] as const).map((key) => <Slider key={key} label={`${name} ${key}`} value={surface[name][key]} min={key === "x" || key === "y" || key === "spread" ? -12 : 0} max={key === "alpha" ? (name === "lit" && dark ? 20 : 100) : key === "blur" ? 24 : 12} unit={key === "alpha" ? "%" : "px"} onChange={(value) => updateLayer(name, { [key]: value })} />)}
          </fieldset>)}
        </div>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-neutral-400">Positive Y lights the top edge; negative Y lights the bottom. Dark-mode highlight alpha is capped at 20%. Use the theme toggle to edit the other mode.</p>
      </div>
      <div className="min-w-0 space-y-4">
        <div className="flex gap-2" aria-label="Code format">{(["CSS", "Tailwind", "GPUI"] as const).map((name) => <button key={name} type="button" aria-pressed={format === name} onClick={() => setFormat(name)} className={`rounded-lg px-4 py-2 text-sm ${format === name ? "bg-stone-800 text-white dark:bg-neutral-200 dark:text-neutral-900" : "bg-stone-200 dark:bg-neutral-800"}`}>{name}</button>)}</div>
        <p className="text-xs text-stone-500 dark:text-neutral-400">Exporting the current {mode} settings. {format === "GPUI" ? "Native inset shadows; code only. Browser and GPUI blur may differ slightly. Requires GPUI with BoxShadow::inset (verified against gpui-pre 0.3.8)." : format === "Tailwind" ? "Requires Tailwind v4 and @exegia/specular. Copy each labeled block into its file." : "Standalone CSS. No library or plugin required."}</p>
        <Code language={format === "CSS" ? "css" : format === "GPUI" ? "rust" : "tsx"} alwaysShowCopy>{code}</Code>
      </div>
    </div>
  </Section>
}
