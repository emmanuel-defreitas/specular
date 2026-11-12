import { usePointerLight } from "@exegia/specular/react"
import { useRef } from "react"

import { Code } from "../components/Code.tsx"
import { Section } from "../components/Section.tsx"
import { boxShadow, defaults, pointedSurface } from "../lib/generator.ts"

const REPO = "https://github.com/emmanuel-defreitas/specular"

const LIGHTS = [
  { light: ".pointer", behavior: "The default. Follows immediately, like the web and GPUI." },
  { light: ".pointer(animation: .specular)", behavior: "Eases each change with the web rim's 350 ms curve." },
  { light: ".fixed(.degrees(90))", behavior: "A static light, clockwise from 12 o'clock. 90° lights the right edge." },
]

/** The web twin of `SpecularSurface.light` / `.dark`: the same two layers, turned by the pointer. */
function Twin({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const angle = usePointerLight(ref)
  const surface = defaults(dark)
  return (
    <div
      ref={ref}
      role="img"
      aria-label="A tile lit by the same layers as the SwiftUI preset"
      className="size-40 rounded-[32px]"
      style={{ background: surface.fill, boxShadow: boxShadow(pointedSurface(surface, angle)) }}
    />
  )
}

export function SwiftUI({ dark }: { dark: boolean }) {
  return (
    <Section
      id="swiftui"
      number="08 · SwiftUI"
      title="The same light, native in SwiftUI"
      lede={
        <>
          The <code className="font-mono text-[0.9em]">Specular</code> Swift package draws the same lit and dim layers as a{" "}
          <code className="font-mono text-[0.9em]">Shape</code> modifier and turns them toward the pointer. It uses SwiftUI only: no web view and no global
          event monitor. Requires macOS 14, iOS 17 or visionOS 1, and Swift 6.
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">1. Add the package</h3>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
            In Xcode, choose File › Add Package Dependencies…, paste the repository URL, and add the Specular library to your app target. Or declare it in{" "}
            <code className="font-mono text-[0.9em]">Package.swift</code>. The package shares its version tags with npm.
          </p>
          <Code language="swift">{`dependencies: [
    .package(
        url: "${REPO}.git",
        from: "0.4.0"
    ),
],
targets: [
    .target(name: "App", dependencies: [
        .product(name: "Specular", package: "specular"),
    ]),
]`}</Code>
        </div>
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">2. Light a shape</h3>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
            <code className="font-mono text-[0.9em]">.specular</code> fills the shape and lights its edge. Without a surface, it uses{" "}
            <code className="font-mono text-[0.9em]">.dark</code> in dark mode and <code className="font-mono text-[0.9em]">.light</code> otherwise. Other views
            borrow a shape, the way <code className="font-mono text-[0.9em]">.background(_:in:)</code> does.
          </p>
          <Code language="swift">{`import Specular
import SwiftUI

RoundedRectangle(cornerRadius: 32)
    .specular(fill: Color(white: 0.25))
    .frame(width: 160, height: 160)

Label("Inbox", systemImage: "tray")
    .padding()
    .background(.quaternary, in: .capsule)
    .specular(in: .capsule)`}</Code>
        </div>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-3">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">3. Make the light follow the mouse</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
            Each surface follows the pointer while the pointer is over it. Add <code className="font-mono text-[0.9em]">.specularPointer()</code> to a
            container that fills the window, and every surface inside tracks the pointer anywhere. That's one hover handler, like this page's single window
            listener. Each surface measures its own center, so scroll views and arbitrary layouts work.
          </p>
          <Code language="swift">{`struct ContentView: View {
    var body: some View {
        HStack(spacing: 32) {
            ForEach(0..<4) { _ in
                Circle().specular(fill: .gray).frame(width: 64, height: 64)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .specularPointer()
    }
}`}</Code>
        </div>
        <figure className="grid justify-items-center gap-3 rounded-2xl border border-stone-300/60 bg-stone-200/50 p-8 dark:border-neutral-800 dark:bg-neutral-900/60">
          <Twin dark={dark} />
          <figcaption className="max-w-48 text-center text-xs text-stone-500 dark:text-neutral-400">
            The {dark ? ".dark" : ".light"} preset's layers, drawn here in CSS. Move the pointer.
          </figcaption>
        </figure>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {LIGHTS.map(({ light, behavior }) => (
          <article key={light} className="min-w-0 border-t border-stone-300/60 pt-5 dark:border-neutral-800">
            <code className="break-all text-xs text-stone-500 dark:text-neutral-500">light: {light}</code>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">{behavior}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-300/60 p-6 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">What differs from the web</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
          Layer opacity is 0–1, as in GPUI, rather than the Tailwind config's 0–100. Blur keeps its CSS meaning, so values carry over, and the Playground above
          exports any surface as SwiftUI. The layers paint as an overlay above the view's content, where a CSS inset shadow paints below its children. The
          light always takes the short way around, and stays lit from the top when Reduce Motion is on. The image rim and tone sampling are web-only.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          <a href={`${REPO}/blob/main/swift/README.md`} className="underline underline-offset-4">Read the Swift package guide →</a>
          <a href={`${REPO}/tree/main/swift/Examples/SpecularDemo`} className="underline underline-offset-4">Run the demo: swift run SpecularDemo →</a>
        </div>
      </div>
    </Section>
  )
}
