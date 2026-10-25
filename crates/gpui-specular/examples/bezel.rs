//! Run with `cargo run -p gpui-specular --example bezel`.
//! Click the surface to toggle light/dark. Move the pointer to aim the inset light.
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
