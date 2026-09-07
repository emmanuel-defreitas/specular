"use client"

import { toneToAlphas, useRimTone } from "@exegia/specular/react"

import { Chip } from "../components/Code.tsx"
import { Demo } from "../components/Demo.tsx"
import { LitAvatar } from "../components/LitAvatar.tsx"
import { Section } from "../components/Section.tsx"

/** A self-contained image (no network, no CORS): a radial gradient as an SVG data URI. */
function portrait(inner: string, outer: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><radialGradient id="g" cx="42%" cy="36%" r="72%"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient></defs><rect width="128" height="128" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const IMAGES = [
  { name: "night", src: portrait("#1e293b", "#020617") },
  { name: "dusk", src: portrait("#7c6f64", "#3b2f2f") },
  { name: "noon", src: portrait("#fef3c7", "#fbbf24") },
  { name: "snow", src: portrait("#ffffff", "#e7e5e4") },
]

function Readout({ src }: { src: string }) {
  const tone = useRimTone(src)
  if (tone === null) return <Chip>measuring…</Chip>
  const { hi, lo } = toneToAlphas(tone)
  return <Chip>{`tone ${tone.toFixed(2)} → hi ${hi.toFixed(2)} lo ${lo.toFixed(2)}`}</Chip>
}

export function Tone() {
  return (
    <Section
      id="tone"
      number="06 · Tone"
      title="A rim that knows what it sits on"
      lede={
        <>
          A white highlight glares on a dark photo and vanishes on a pale one. <code className="font-mono text-[0.9em]">useRimTone(src)</code> samples the
          outer band of the image (Rec. 709 luma over a 16×16 sample) and <code className="font-mono text-[0.9em]">toneToAlphas</code> maps that to rim alphas:
          against a dark rim the highlight eases off and the shadow pushes up, against a light rim the reverse.
        </>
      }
    >
      <Demo
        title="Fixed alphas versus measured"
        description="Top row: the rim at its baked-in alphas. Bottom row: the same images with tone sampling. Watch the night and snow images in particular."
        code={`
const tone = useRimTone(src)                          // 0–1, or null while sampling
const alphas = tone === null ? undefined : toneToAlphas(tone)
<Rim angle={angle * 0.8} hi={alphas?.hi} lo={alphas?.lo} className="rounded-full" />`}
      >
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {IMAGES.map((img) => (
              <figure key={img.name} className="flex flex-col items-center gap-2">
                <LitAvatar src={img.src} alt="" className="size-20" />
                <figcaption className="text-xs text-stone-500 dark:text-neutral-500">{img.name} · fixed</figcaption>
              </figure>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {IMAGES.map((img) => (
              <figure key={img.name} className="flex flex-col items-center gap-2">
                <LitAvatar src={img.src} alt="" tone className="size-20" />
                <figcaption className="flex flex-col items-center gap-1 text-xs text-stone-500 dark:text-neutral-500">
                  <span>{img.name} · measured</span>
                  <Readout src={img.src} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Demo>
    </Section>
  )
}
