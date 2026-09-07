import type { ReactNode } from "react"

export function Section({
  id,
  number,
  title,
  lede,
  children,
}: {
  id: string
  number: string
  title: string
  lede: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-stone-300/60 py-16 dark:border-neutral-800">
      <header className="mb-10 max-w-2xl">
        <div className="mb-2 font-mono text-xs tracking-widest text-stone-500 uppercase dark:text-neutral-500">{number}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600 dark:text-neutral-400">{lede}</p>
      </header>
      <div className="space-y-12">{children}</div>
    </section>
  )
}
