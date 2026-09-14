import { useEffect, useRef, useState } from "react"

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
  const [active, setActive] = useState<string>()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  function openProfile() {
    window.clearTimeout(closeTimer.current)
    setProfileOpen(true)
  }

  function closeProfileLater() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setProfileOpen(false), 3000)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (current) setActive(current.target.id)
      },
      { rootMargin: "-20% 0px -65%", threshold: [0, 0.1, 0.5] }
    )
    NAV.forEach(([id]) => observer.observe(document.getElementById(id)!))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

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
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "page" : undefined}
                className={`rounded-md px-2.5 py-1 transition-[background-color,color,box-shadow] duration-150 hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-neutral-800 dark:hover:text-white ${active === id ? "bg-stone-200 text-stone-900 bezel-base dark:bg-neutral-800 dark:text-white" : ""}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div ref={profileRef} className="relative" onMouseEnter={openProfile} onMouseLeave={closeProfileLater} onFocusCapture={openProfile} onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) closeProfileLater()
            }}>
              <a
                href="https://github.com/emmanuel-defreitas"
                className="flex items-center gap-2 rounded-full bg-stone-200 py-1 pr-3 pl-1 text-sm font-medium text-stone-700 bezel-base transition-[box-shadow,transform,color] duration-150 hover:-translate-y-px hover:text-stone-950 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:text-white"
              >
                <img className="size-6 rounded-full" src="https://github.com/emmanuel-defreitas.png?size=48" alt="" />
                @emmanuel-defreitas
              </a>
              <div className={`absolute top-full right-0 mt-2 w-60 rounded-xl border border-stone-300/70 bg-stone-100 p-3 text-sm shadow-xl transition-[opacity,transform,visibility] duration-150 dark:border-neutral-700 dark:bg-neutral-900 ${profileOpen ? "visible pointer-events-auto translate-y-1 opacity-100" : "pointer-events-none invisible opacity-0"}`}>
                <p className="font-medium text-stone-900 dark:text-white">Specular by Emmanuel Defreitas</p>
                <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-neutral-400">Tailwind v4 lighting utilities and pointer-following React rims.</p>
                <div className="mt-3 flex gap-3 text-xs font-medium">
                  <a href="https://github.com/emmanuel-defreitas" className="text-stone-700 hover:text-stone-950 dark:text-neutral-300 dark:hover:text-white">Profile</a>
                  <a href="https://github.com/emmanuel-defreitas/specular" className="text-stone-700 hover:text-stone-950 dark:text-neutral-300 dark:hover:text-white">Repository</a>
                </div>
              </div>
            </div>
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
