import type { CSSProperties, ReactNode } from "react"

import { cn } from "../lib/cn.ts"
import { Chip } from "./Code.tsx"

/**
 * A disc (or any shape via `shape`) on the stage with the classes that make
 * it printed underneath. `classes` is applied verbatim, so every class in it
 * is a literal Tailwind can see at build time.
 */
export function Swatch({
  classes,
  label,
  shape = "size-20 rounded-full",
  fill = "bg-stone-300 dark:bg-neutral-800",
  children,
  style,
}: {
  classes: string
  label?: string
  shape?: string
  fill?: string
  children?: ReactNode
  style?: CSSProperties
}) {
  return (
    <figure className="flex flex-col items-center gap-3 text-center">
      <div className={cn("relative flex items-center justify-center", shape, fill, classes)} style={style}>
        {children}
      </div>
      <figcaption className="flex max-w-40 flex-col items-center gap-1">
        {label && <span className="text-xs font-medium text-stone-700 dark:text-neutral-300">{label}</span>}
        <Chip className="whitespace-normal">{classes}</Chip>
      </figcaption>
    </figure>
  )
}
