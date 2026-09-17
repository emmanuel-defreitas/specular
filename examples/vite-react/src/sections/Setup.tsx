import { Code } from "../components/Code.tsx"
import { ExportPreview, type PreviewKind } from "../components/ExportPreview.tsx"
import { Section } from "../components/Section.tsx"

const EXPORTS = [
  { preview: "surface" as PreviewKind, path: "@exegia/specular", title: "Define the surface", description: "defineSurfaces validates the shared config and preserves its types. litVars converts an angle to inline offsets for a layer named lit. Neither generates CSS.", href: "#basics", link: "Explore surfaces" },
  { preview: "plugin" as PreviewKind, path: "@exegia/specular/plugin", title: "Generate the CSS", description: "createPlugin(surfaces) generates Tailwind utilities and dark-mode presets at build time. Requires your surface config; React is optional.", href: "#setup-surfaces", link: "Set up the plugin" },
  { preview: "merge" as PreviewKind, path: "@exegia/specular/merge", title: "Merge class names", description: "createCn(surfaces) returns a ready cn() helper. mergeConfig(surfaces) returns configuration for an existing tailwind-merge setup. Both use the same surfaces as the plugin.", href: "#merge", link: "Try class merging" },
  { preview: "react" as PreviewKind, path: "@exegia/specular/react", title: "Draw and move the rim", description: "Rim draws an overlay; usePointerLight supplies its angle. Optional tone helpers adapt it to images. React 19 is required; the Specular plugin is optional.", href: "#alive", link: "Explore React effects" },
]

export function Setup() {
  return (
    <Section id="setup" number="00 · Setup" title="Start with the effect you need" lede="One package, four entry points. Use Tailwind surfaces for inset bezels, React for rim overlays, or combine them. You do not need to configure everything.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">1. Install</h3>
          <Code>{`bun add @exegia/specular`}</Code>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">For the utility classes, start with a working Tailwind CSS 4.1–4.x app. The package requires Node.js 22.18+.</p>
        </div>
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Add peers for the features you use</h3>
          <Code>{`# React effects, if React is not already installed
bun add react@^19

# Optional class merging
bun add tailwind-merge@^3`}</Code>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {EXPORTS.map(({ path, title, description, href, link, preview }) => (
          <article key={path} className="flex min-w-0 flex-col border-t border-stone-300/60 pt-5 dark:border-neutral-800">
            <code className="break-all text-xs text-stone-500 dark:text-neutral-500">{path}</code>
            <h3 className="mt-2 text-lg font-semibold text-stone-900 dark:text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">{description}</p>
            <ExportPreview kind={preview} />
            <a href={href} className="mt-3 inline-block text-sm font-medium underline underline-offset-4">{link} →</a>
          </article>
        ))}
      </div>

      <div id="setup-surfaces" className="scroll-mt-24 space-y-5">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">2. For Tailwind bezels: define your surfaces</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">Create these files at your project root. There is no built-in surface preset: this config creates the bezel-* family. Static bezels do not need React or cn().</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Code className="min-w-0">{`// specular.config.ts
import { defineSurfaces } from "@exegia/specular"

export const surfaces = defineSurfaces({
  bezel: {
    layers: {
      lit: { color: "#fff", y: 2, blur: 3, alpha: 80,
        dark: { y: 1, blur: 1, alpha: 5 } },
      dim: { color: "#000", y: -1, blur: 2, alpha: 15,
        dark: { y: -8, alpha: 20 } },
    },
  },
})`}</Code>
          <Code className="min-w-0">{`// specular.plugin.ts
import { createPlugin } from "@exegia/specular/plugin"
import { surfaces } from "./specular.config.ts"

export default createPlugin(surfaces)`}</Code>
        </div>
      </div>

      <div className="space-y-5">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">3. Register the plugin, then use the classes</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">Point @plugin at your local file, relative to the stylesheet. Do not point it directly at @exegia/specular/plugin: that export is a factory and needs your surfaces. Make sure your app loads this CSS.</p>
        </div>
        <Code>{`/* src/app.css */
@import "tailwindcss";
@plugin "../specular.plugin.ts";`}</Code>
        <Code>{`<button className="rounded-lg bg-stone-200 px-4 py-2 bezel-base
  active:bezel-lit/20 active:bezel-dim/40">
  Press me
</button>`}</Code>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">bezel-base applies all configured layers. Dark presets activate under a .dark ancestor, such as &lt;html class="dark"&gt;; your app controls that class.</p>
      </div>

      <div className="rounded-2xl border border-stone-300/60 p-6 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Only want a React rim?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-neutral-400">Skip steps 2–3. The React quick start at the top of this page works with React and ordinary Tailwind classes. Rim draws the highlight and usePointerLight makes it follow the pointer. Omit the hook for a static rim. No surface config or cn() is required.</p>
        <a href="#alive" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">Compare rims and pointer-following bezels →</a>
      </div>
    </Section>
  )
}
