import { cn } from "../lib/cn.ts"
import { Highlight, themes } from "prism-react-renderer"
import { useState } from "react"

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
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={copy}
        className="absolute top-3 right-3 z-10 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/80 transition-[background-color,color,transform] duration-150 hover:bg-white/20 hover:text-white active:translate-y-px"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-xl border border-[#1d3751] bg-[#011627] p-4 pr-20 font-mono text-[12.5px] leading-relaxed shadow-sm">
        <Highlight theme={themes.nightOwl} code={code} language="tsx">
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
