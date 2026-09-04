/** In-memory Tailwind compile. Runs in well under a second. */
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { compile } from "tailwindcss"
import type { PluginCreator } from "tailwindcss/plugin"

const require = createRequire(import.meta.url)

export async function build(css: string, plugin: PluginCreator, candidates: string[]): Promise<string> {
  const c = await compile(css, {
    base: process.cwd(),
    loadStylesheet: async (id, base) => {
      const p = require.resolve(id + (id.endsWith(".css") ? "" : "/index.css"), { paths: [base] })
      return { path: p, base, content: await readFile(p, "utf8") }
    },
    loadModule: async (id) => ({ path: id, base: process.cwd(), module: plugin }),
  })
  return c.build(candidates)
}

export const PREAMBLE = `@import "tailwindcss"; @plugin "x";`

/** Everything from `@layer utilities` on. */
export const utilities = (css: string): string => css.slice(css.indexOf("@layer utilities"))
