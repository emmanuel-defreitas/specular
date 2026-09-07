import type { ReactNode } from "react"

import { cn } from "../lib/cn.ts"
import { Code } from "./Code.tsx"

/**
 * A demo frame: a stage the surfaces sit on, an optional title/description,
 * and the snippet that produced it.
 */
export function Demo({
  title,
  description,
  code,
  children,
  stageClassName,
}: {
  title?: string
  description?: ReactNode
  code?: string
  children: ReactNode
  stageClassName?: string
}) {
  return (
    <div className="grid gap-4">
      {(title || description) && (
        <div className="max-w-2xl">
          {title && <h3 className="text-lg font-semibold text-stone-900 dark:text-white">{title}</h3>}
          {description && <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">{description}</p>}
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl border border-stone-300/60 bg-stone-200/50 p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/60",
          stageClassName
        )}
      >
        {children}
      </div>
      {code && <Code>{code}</Code>}
    </div>
  )
}
