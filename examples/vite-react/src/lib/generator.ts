export type Layer = { x: number; y: number; blur: number; spread: number; alpha: number; color: string }
export type Surface = { fill: string; size: number; radius: number; lit: Layer; dim: Layer }

export function defaults(dark: boolean): Surface {
  return { fill: dark ? "#404040" : "#d6d3d1", size: 160, radius: 32,
    lit: { x: 0, y: 2, blur: 3, spread: 0, alpha: dark ? 12 : 80, color: "#ffffff" },
    dim: { x: 0, y: -2, blur: 3, spread: 0, alpha: dark ? 35 : 20, color: "#000000" } }
}
export function effectiveSurface(surface: Surface, dark: boolean): Surface {
  return { ...surface, lit: { ...surface.lit, alpha: Math.min(surface.lit.alpha, dark ? 20 : 100) } }
}
function shadow(layer: Layer) {
  const rgb = [1, 3, 5].map((offset) => parseInt(layer.color.slice(offset, offset + 2), 16)).join(" ")
  return `inset ${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px rgb(${rgb} / ${layer.alpha}%)`
}
export function boxShadow(surface: Surface) { return [surface.lit, surface.dim].map(shadow).join(", ") }
export function cssCode(surface: Surface) {
  return `.specular {\n  width: ${surface.size}px;\n  height: ${surface.size}px;\n  border-radius: ${surface.radius}px;\n  background: ${surface.fill};\n  box-shadow:\n    ${shadow(surface.lit)},\n    ${shadow(surface.dim)};\n}`
}
export function tailwindCode(surface: Surface) {
  const layer = (value: Layer) => `{ color: "${value.color}", x: ${value.x}, y: ${value.y}, blur: ${value.blur}, spread: ${value.spread}, alpha: ${value.alpha} }`
  return `// specular.config.ts\nimport { defineSurfaces } from "@emmanuel-defreitas/specular"\n\nexport const surfaces = defineSurfaces({\n  custom: { layers: {\n    lit: ${layer(surface.lit)},\n    dim: ${layer(surface.dim)},\n  } },\n})\n\n// specular.plugin.ts\nimport { createPlugin } from "@emmanuel-defreitas/specular/plugin"\nimport { surfaces } from "./specular.config.ts"\nexport default createPlugin(surfaces)\n\n/* app.css — adjust the plugin path to your CSS file */\n@import "tailwindcss";\n@plugin "./specular.plugin.ts";\n\n<!-- markup -->\n<div class="size-[${surface.size}px] rounded-[${surface.radius}px] bg-[${surface.fill}] custom-base"></div>`
}
export function gpuiCode(surface: Surface) {
  const num = (value: number) => Number.isInteger(value) ? `${value}.0` : String(value)
  const layer = (value: Layer) => `            BoxShadow::new(px(${num(value.x)}), px(${num(value.y)}),\n                rgb(0x${value.color.slice(1)}).alpha(${num(value.alpha / 100)}).into())\n                .blur_radius(px(${num(value.blur)}))\n                .spread_radius(px(${num(value.spread)}))\n                .inset()`
  return `use gpui::{div, px, rgb, BoxShadow, Div, Styled};\n\npub fn specular_surface() -> Div {\n    div()\n        .w(px(${num(surface.size)}))\n        .h(px(${num(surface.size)}))\n        .rounded(px(${num(surface.radius)}))\n        .bg(rgb(0x${surface.fill.slice(1)}))\n        .shadow(vec![\n            // GPUI paints the last layer on top: dim, then lit.\n${layer(surface.dim)},\n${layer(surface.lit)},\n        ])\n}`
}

/** Coordinated, low-contrast materials with narrow inset edges. */
export function randomSurface(dark: boolean, random = Math.random): Surface {
  const palettes = dark
    ? [["#404040", "#ffffff", "#171717"], ["#38434b", "#dbeafe", "#17212b"], ["#42463e", "#ecf1df", "#20251d"], ["#49403b", "#ffedd5", "#29201b"]]
    : [["#d6d3d1", "#ffffff", "#57534e"], ["#cbd5df", "#f0f9ff", "#334155"], ["#d2d8c8", "#f7fee7", "#3f4936"], ["#dfd1c5", "#fff7ed", "#604a3a"]]
  const pick = <T,>(values: T[]) => values[Math.min(values.length - 1, Math.floor(random() * values.length))]!
  const [fill, litColor, dimColor] = pick(palettes) as [string, string, string]
  const x = pick([-1, 0, 1])
  const y = pick([1, 2])
  return { ...defaults(dark), fill,
    lit: { x, y, blur: pick([1, 2, 3]), spread: 0, alpha: pick(dark ? [8, 10, 12, 14, 16] : [45, 55, 65, 75]), color: litColor },
    dim: { x: -x, y: -y, blur: pick([2, 3, 4]), spread: 0, alpha: pick(dark ? [25, 30, 35, 40] : [16, 20, 24, 28]), color: dimColor } }
}

/** Rotate the configured offsets without changing their depth or softness. */
export function pointedSurface(surface: Surface, angle: number): Surface {
  const rad = angle * Math.PI / 180
  const rotate = (layer: Layer): Layer => ({ ...layer,
    x: Math.round((layer.x * Math.cos(rad) - layer.y * Math.sin(rad)) * 100) / 100,
    y: Math.round((layer.x * Math.sin(rad) + layer.y * Math.cos(rad)) * 100) / 100 })
  return { ...surface, lit: rotate(surface.lit), dim: rotate(surface.dim) }
}
