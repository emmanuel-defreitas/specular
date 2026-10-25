# gpui-specular

Native inset highlights and shadows for GPUI, from the Specular project.
A small, synchronous styling library: no web view, CSS engine, global listener,
or animation runtime.

## Use locally

This crate is not published yet. From a consuming application:

```toml
[dependencies]
gpui = { package = "gpui-pre", version = "=0.3.8", default-features = false }
gpui-specular = { path = "../specular/crates/gpui-specular" }
```

Use the same GPUI package/version in the application. Rust types from a different
GPUI package or Git revision are not interchangeable. The library targets
`gpui-pre 0.3.8` because it provides native `BoxShadow::inset` support. Your app
continues to own its platform backend and theme.

## Apply a bezel

```rust
use gpui::{div, px, rgb, Styled};
use gpui_specular::{SpecularExt, Surface};

let tile = div()
    .size(px(160.0))
    .rounded(px(32.0))
    .bg(rgb(0x404040))
    .specular(Surface::dark());
```

`Surface::light()` and `Surface::dark()` provide restrained starting points.
The dark preset uses a 12% highlight. The library does not detect your theme or
cap custom alpha values at 20%; your application selects the surface.
`.specular(...)` replaces the element's existing shadow list. It leaves fill,
size, radius, content and event handling to GPUI. Shadows paint below children,
so an opaque image child can cover the effect.

## Configure the layers

```rust
use gpui::rgb;
use gpui_specular::{Layer, Surface};

let surface = Surface::new(
    Layer::new(rgb(0xdbeafe), 0.14)
        .offset(0.0, 2.0)
        .blur(2.0)
        .spread(0.0),
    Layer::new(rgb(0x17212b), 0.35)
        .offset(0.0, -2.0)
        .blur(3.0),
);
```

Lengths are logical pixels. Alpha is **0–1**, unlike the TypeScript config's
0–100 percentages. Positive Y exposes the top edge; negative Y exposes the
bottom. Positive spread grows the inset band. Color alpha is multiplied by layer
alpha. Conversion clamps alpha and negative blur and replaces non-finite lengths
with zero. `surface.shadows()` returns native `Vec<BoxShadow>` in GPUI paint order
(dim first, lit last), if you prefer to compose the list yourself.

## Follow the pointer

Calculate a bearing from the pointer and the surface center using **the same
window coordinate system**:

```rust
use gpui::{point, px};
use gpui_specular::{pointer_angle, Surface};

let pointer = point(px(200.0), px(100.0));
let center = point(px(100.0), px(100.0));
let angle = pointer_angle(pointer, center).unwrap_or(0.0);
let surface = Surface::dark().rotated(angle);
```

With the presets, 0° lights the top and 90° lights the right. Rotation preserves
configured offset lengths and rotates both layers together. At the exact center,
`pointer_angle` returns `None`; keep the previous angle. Rotate the original
surface on every render, not the previous frame's result.

For smooth tracking, `damp_angle(current, target, amount)` interpolates along the
shortest arc, including across 360°. Drive it from your app's animation frames,
notify the view while unsettled, and stop requesting frames once settled. For
frame-rate-independent damping, use `amount = 1.0 - (-dt_seconds / 0.12).exp()`.
The app owns animation scheduling and reduced-motion behavior; use a static
surface when motion is disabled.

## Native example and checks

From the repository root on macOS:

```sh
cargo run -p gpui-specular --example bezel
```

Move the pointer around the centered tile; click it to switch themes. The example
uses immediate pointer tracking and closes cleanly when its window closes.
On Linux, select a platform backend, for example `--features x11` (native system
libraries are also required). Linux and Windows are not validated by the macOS
checks.

```sh
cargo test -p gpui-specular
cargo clippy -p gpui-specular --all-targets -- -D warnings
cargo fmt --all --check
```

This first crate covers inset lighting and direction helpers. It does not yet
provide React-style masked rim overlays or image-tone sampling. Native and browser
blur renderers can differ slightly.

MIT. See [LICENSE](LICENSE).
