import { cn } from "../lib/cn.ts"
import { Check, Copy } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"
import { useState } from "react"

const stoneNightOwl = { ...themes.nightOwl, plain: { ...themes.nightOwl.plain, backgroundColor: "transparent" } }

export function Code({ children, className }: { children: string; className?: string }) {
  const code = children.trim()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={cn("group relative", className)}>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy snippet"}
        title={copied ? "Copied" : "Copy snippet"}
        className="pointer-events-none absolute top-3 right-3 z-1 grid size-7 place-items-center rounded-md border border-white/15 bg-white/10 text-white/80 opacity-0 transition-[opacity,transform,background-color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 hover:bg-white/20 hover:text-white active:scale-[0.94] focus-visible:pointer-events-auto focus-visible:opacity-100"
      >
        <span className="relative size-3.5" aria-hidden="true">
          <Copy className={`absolute inset-0 size-3.5 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${copied ? "-rotate-45 scale-75 opacity-0" : "opacity-100"}`} strokeWidth={1.5} />
          <Check className={`absolute inset-0 size-3.5 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${copied ? "rotate-0 scale-100 opacity-100" : "rotate-45 scale-75 opacity-0"}`} strokeWidth={1.5} />
        </span>
      </button>
      <pre className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950 p-4 pr-12 font-mono text-[12.5px] leading-relaxed shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <Highlight theme={stoneNightOwl} code={code} language="tsx">
          {({ getLineProps, getTokenProps, style, tokens }) => (
            <code className="block min-w-max" style={style}>
              {tokens.map((line, index) => (
                <span key={index} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                  {"\n"}
                </span>
              ))}
            </code>
          )}
        </Highlight>
      </pre>
    </div>
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
