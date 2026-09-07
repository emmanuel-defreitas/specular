import { Demo } from "../components/Demo.tsx"
import { Section } from "../components/Section.tsx"
import { Swatch } from "../components/Swatch.tsx"

export function Direction() {
  return (
    <Section
      id="direction"
      number="02 · Direction"
      title="The letter names the edge the light enters from"
      lede={
        <>
          <code className="font-mono text-[0.9em]">bezel-lit-t-2</code> lights the top edge two pixels deep;{" "}
          <code className="font-mono text-[0.9em]">bezel-dim-b-1</code> shades the bottom one pixel deep. <code className="font-mono text-[0.9em]">t</code>/
          <code className="font-mono text-[0.9em]">b</code> write the same variable, as do <code className="font-mono text-[0.9em]">l</code>/
          <code className="font-mono text-[0.9em]">r</code>: pick one per layer per axis. Opposite edges of one layer overwrite, they do not add — two layers
          is how you light two edges.
        </>
      }
    >
      <Demo
        title="Where is the lamp?"
        description="Every disc has the same two layers. Only the offsets change."
        code={`
<div class="bezel-lit-t-2 bezel-dim-b-1" />   <!-- lamp above (the config default) -->
<div class="bezel-lit-b-2 bezel-dim-t-1" />   <!-- lamp below -->
<div class="bezel-lit-l-2 bezel-dim-r-1" />   <!-- lamp to the left -->
<div class="bezel-lit-r-2 bezel-dim-l-1" />   <!-- lamp to the right -->
<div class="bezel-lit-t-2 bezel-lit-l-2 bezel-dim-b-1 bezel-dim-r-1" />   <!-- top-left: both axes -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-8">
          <Swatch classes="bezel-lit-t-2 bezel-dim-b-1" label="above" />
          <Swatch classes="bezel-lit-b-2 bezel-dim-t-1" label="below" />
          <Swatch classes="bezel-lit-l-2 bezel-dim-r-1" label="left" />
          <Swatch classes="bezel-lit-r-2 bezel-dim-l-1" label="right" />
          <Swatch classes="bezel-lit-t-2 bezel-lit-l-2 bezel-dim-b-1 bezel-dim-r-1" label="top-left" />
        </div>
      </Demo>

      <Demo
        title="Depth, and decimals"
        description="N is a bare integer, a decimal, or an arbitrary length. Deeper offsets read as a thicker lip; on a square corner they show as a crisp step."
        code={`
<div class="bezel-lit-t-1 bezel-dim-b-0.5" />
<div class="bezel-lit-t-2 bezel-dim-b-1" />
<div class="bezel-lit-t-4 bezel-dim-b-2" />
<div class="bezel-lit-t-8 bezel-dim-b-4" />
<div class="bezel-lit-t-[0.5rem] bezel-dim-b-[0.25rem]" />`}
      >
        <div className="flex flex-wrap items-start justify-around gap-8">
          <Swatch classes="bezel-lit-t-1 bezel-dim-b-0.5" shape="size-20 rounded-xl" />
          <Swatch classes="bezel-lit-t-2 bezel-dim-b-1" shape="size-20 rounded-xl" />
          <Swatch classes="bezel-lit-t-4 bezel-dim-b-2" shape="size-20 rounded-xl" />
          <Swatch classes="bezel-lit-t-8 bezel-dim-b-4" shape="size-20 rounded-xl" />
          <Swatch classes="bezel-lit-t-[0.5rem] bezel-dim-b-[0.25rem]" shape="size-20 rounded-xl" />
        </div>
      </Demo>

      <Demo
        title="Spread: from a hairline to a ring"
        description={
          <>
            <code className="font-mono">spread</code> is the knob that grows a one-edge highlight into a full inner ring. With the offset at zero the ring
            is uniform; with an offset it is a ring that is brighter on one side. <code className="font-mono">bezel-spread-N</code> sets every layer at
            once.
          </>
        }
        code={`
<div class="bezel-lit-t-0 bezel-lit-spread-1 bezel-dim/0" />          <!-- white hairline ring -->
<div class="bezel-lit-t-0 bezel-lit-spread-3 bezel-dim/0" />          <!-- thicker -->
<div class="bezel-lit-t-2 bezel-lit-spread-1 bezel-dim-b-1" />        <!-- ring, brighter at the top -->
<div class="bezel-lit/0 bezel-dim-b-0 bezel-dim-spread-2 bezel-dim/35" /> <!-- dark inner ring -->
<div class="bezel-spread-2" />                                        <!-- both layers spread -->`}
      >
        <div className="flex flex-wrap items-start justify-around gap-8">
          <Swatch classes="bezel-lit-t-0 bezel-lit-spread-1 bezel-dim/0" label="hairline" />
          <Swatch classes="bezel-lit-t-0 bezel-lit-spread-3 bezel-dim/0" label="thick ring" />
          <Swatch classes="bezel-lit-t-2 bezel-lit-spread-1 bezel-dim-b-1" label="lit ring" />
          <Swatch classes="bezel-lit/0 bezel-dim-b-0 bezel-dim-spread-2 bezel-dim/35" label="dark ring" />
          <Swatch classes="bezel-spread-2" label="all layers" />
        </div>
      </Demo>
    </Section>
  )
}
