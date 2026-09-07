import { cn } from "../lib/cn.ts"

/** A snippet. No highlighter: the point of the page is the surfaces, not the code. */
export function Code({ children, className }: { children: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-xl border border-stone-300/70 bg-white/70 p-4 font-mono text-[12.5px] leading-relaxed text-stone-700 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300",
        className
      )}
    >
      <code>{children.trim()}</code>
    </pre>
  )
}

/** An inline class-name label under a swatch. */
export function Chip({ children, className }: { children: string; className?: string }) {
  return (
    <code
      className={cn(
        "rounded-md bg-stone-300/50 px-1.5 py-0.5 font-mono text-[11px] leading-5 text-stone-700 dark:bg-neutral-800 dark:text-neutral-300",
        className
      )}
    >
      {children}
    </code>
  )
}
