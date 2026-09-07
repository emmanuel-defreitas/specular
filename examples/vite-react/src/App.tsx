import { ThemeToggle, useTheme } from "./components/ThemeToggle.tsx"
import { Alive } from "./sections/Alive.tsx"
import { Basics } from "./sections/Basics.tsx"
import { Colors } from "./sections/Colors.tsx"
import { Direction } from "./sections/Direction.tsx"
import { Hero } from "./sections/Hero.tsx"
import { Intensity } from "./sections/Intensity.tsx"
import { Merge } from "./sections/Merge.tsx"
import { Tone } from "./sections/Tone.tsx"

const NAV = [
  ["basics", "Surfaces"],
  ["direction", "Direction"],
  ["intensity", "Intensity"],
  ["colors", "Colour"],
  ["alive", "Alive"],
  ["tone", "Tone"],
  ["merge", "cn()"],
] as const

export function App() {
  const [dark, toggle] = useTheme()
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-stone-300/60 bg-stone-100/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <a href="#top" className="flex items-center gap-2.5 font-semibold text-stone-900 dark:text-white">
            <span className="size-5 rounded-full bg-stone-300 bezel-base dark:bg-neutral-700" aria-hidden="true" />
            specular
          </a>
          <nav className="hidden gap-1 text-sm text-stone-600 md:flex dark:text-neutral-400">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-md px-2.5 py-1 transition-colors hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-neutral-800 dark:hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <a
              href="https://github.com/emmanuel-defreitas/specular"
              className="text-sm text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white"
            >
              GitHub
            </a>
            <ThemeToggle dark={dark} onToggle={toggle} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6">
        <Hero />
        <Basics />
        <Direction />
        <Intensity />
        <Colors />
        <Alive />
        <Tone />
        <Merge />
      </main>
      <footer className="border-t border-stone-300/60 py-10 text-center text-xs text-stone-500 dark:border-neutral-800 dark:text-neutral-500">
        @exegia/specular · MIT · every surface on this page is a <code className="font-mono">box-shadow</code>
      </footer>
    </>
  )
}
