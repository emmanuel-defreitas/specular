import { useEffect, useState } from "react"

const KEY = "specular-theme"

function initial(): boolean {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === "dark") return true
    if (stored === "light") return false
  } catch {
    /* private mode, blocked storage: fall through */
  }
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
}

export function useTheme(): [dark: boolean, toggle: () => void] {
  const [dark, setDark] = useState(initial)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light")
    } catch {
      /* ignore */
    }
  }, [dark])
  return [dark, () => setDark((d) => !d)]
}

/** A pill switch built from two surfaces: the track is a `well`, the knob a `bezel`. */
export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Toggle dark mode"
      onClick={onToggle}
      className="relative h-8 w-14 rounded-full bg-stone-300 well-base transition-colors dark:bg-neutral-800"
    >
      <span
        className={`absolute top-1 left-1 flex size-6 items-center justify-center rounded-full bg-stone-100 text-xs bezel-base transition-transform duration-200 dark:bg-neutral-600 ${dark ? "translate-x-6" : ""}`}
      >
        {dark ? "☾" : "☀"}
      </span>
    </button>
  )
}
