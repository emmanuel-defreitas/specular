# gpui-specular

Native inset highlights and shadows for GPUI, from the Specular project.
A small, synchronous styling library: no web view, CSS engine, global listener,
or animation runtime.

## Install

Add these dependencies to a consuming application:

```toml
[dependencies]
gpui = { package = "gpui-pre", version = "=0.3.8", default-features = false }
gpui-specular = "0.1.0"
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

For a new macOS app, also add `gpui_platform = { package = "gpui-pre-platform", version = "=0.3.8", default-features = false, features = ["font-kit"] }` to `[dependencies]`. Existing apps can keep their matching GPUI platform setup.

Store the angle in your view. Handle mouse movement on the surrounding container, calculate the bearing to the **surface center**, then call `cx.notify()` to render the updated angle. The complete `src/main.rs` below centers the tile in the window; move the mouse to aim the light, and click the tile to switch themes.

```rust
use gpui::{
    App, Bounds, Context, MouseMoveEvent, Window, WindowBounds, WindowOptions, div, point,
    prelude::*, px, rgb, size,
};
use gpui_specular::{SpecularExt, Surface, pointer_angle};

struct Demo {
    angle: f32,
    dark: bool,
}

impl Render for Demo {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let surface = if self.dark {
            Surface::dark()
        } else {
            Surface::light()
        };
        div()
            .id("bezel-demo")
            .size_full()
            .flex()
            .items_center()
            .justify_center()
            .bg(rgb(if self.dark { 0x171717 } else { 0xf5f5f4 }))
            .on_mouse_move(cx.listener(|this, event: &MouseMoveEvent, window, cx| {
                let viewport = window.viewport_size();
                let center = point(viewport.width / 2.0, viewport.height / 2.0);
                if let Some(angle) = pointer_angle(event.position, center) {
                    this.angle = angle;
                    cx.notify();
                }
            }))
            .child(
                div()
                    .id("surface")
                    .size(px(180.0))
                    .rounded(px(36.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .bg(rgb(if self.dark { 0x404040 } else { 0xd6d3d1 }))
                    .text_color(rgb(if self.dark { 0xe5e5e5 } else { 0x404040 }))
                    .specular(surface.rotated(self.angle))
                    .on_click(cx.listener(|this, _, _, cx| {
                        this.dark = !this.dark;
                        cx.notify();
                    }))
                    .child("Click to switch theme"),
            )
    }
}

fn main() {
    gpui_platform::application().run(|cx: &mut App| {
        cx.on_window_closed(|cx, _| {
            if cx.windows().is_empty() {
                cx.quit();
            }
        })
        .detach();
        let bounds = Bounds::centered(None, size(px(520.0), px(420.0)), cx);
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                ..Default::default()
            },
            |_, cx| {
                cx.new(|_| Demo {
                    angle: 0.0,
                    dark: true,
                })
            },
        )
        .expect("open the Specular demo window");
        cx.activate(true);
    });
}
```

Run your app with `cargo run`. To try the checked-in example from this repository:

```bash
cargo run -p gpui-specular --example bezel
```

**Coordinate rule:** `event.position` and the surface center must both be in window coordinates. `window.viewport_size() / 2` works here only because the tile is centered in a full-window container. For tiles elsewhere, use their actual layout bounds; do not reuse the window center. Attaching the handler to the surrounding container lets tracking continue outside the tile.

`pointer_angle` returns 0° above the center and 90° to its right. At the exact center it returns `None`, so the example preserves the previous angle. Always call `.rotated(angle)` on the original surface, not on the previous frame's rotated surface.

**Optional smoothing:** the example tracks immediately. For gradual motion, store a target angle on mouse movement and call `damp_angle(current, target, amount)` on animation frames. Use `amount = 1.0 - (-dt_seconds / 0.12).exp()` for a 120 ms response, call `cx.notify()`, and request the next frame only until settled. Updating only on mouse events will stop easing as soon as the pointer stops. Your app owns frame scheduling and reduced-motion preferences; keep the surface static when motion is disabled.

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
