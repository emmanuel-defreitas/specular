//! Native inset lighting for GPUI.
//!
//! ```
//! use gpui::{div, px, rgb, Styled};
//! use gpui_specular::{SpecularExt, Surface};
//!
//! let tile = div()
//!     .size(px(160.0))
//!     .rounded(px(32.0))
//!     .bg(rgb(0x404040))
//!     .specular(Surface::dark());
//! ```
//!
//! Shadows paint inside the surface, below its children. This crate does not
//! implement the web package's image-overlay rim or image-tone sampling.

use gpui::{BoxShadow, Hsla, Pixels, Point, Styled, px, rgb};

/// A single inset layer. Lengths are logical pixels; alpha is in `0..=1`.
///
/// Positive Y illuminates the top edge. Positive spread grows the inner band;
/// negative spread contracts it. Color alpha is multiplied by `alpha`.
#[derive(Clone, Copy, Debug)]
pub struct Layer {
    pub color: Hsla,
    pub x: f32,
    pub y: f32,
    pub blur: f32,
    pub spread: f32,
    pub alpha: f32,
}

impl Layer {
    /// Create an inset layer with no offset, blur or spread.
    pub fn new(color: impl Into<Hsla>, alpha: f32) -> Self {
        Self {
            color: color.into(),
            x: 0.0,
            y: 0.0,
            blur: 0.0,
            spread: 0.0,
            alpha,
        }
    }

    pub fn offset(mut self, x: f32, y: f32) -> Self {
        self.x = x;
        self.y = y;
        self
    }

    pub fn blur(mut self, radius: f32) -> Self {
        self.blur = radius;
        self
    }

    pub fn spread(mut self, radius: f32) -> Self {
        self.spread = radius;
        self
    }

    /// Convert to a native inset shadow. Non-finite lengths become zero;
    /// negative blur becomes zero and alpha is clamped to `0..=1`.
    pub fn shadow(self) -> BoxShadow {
        let mut color = self.color;
        color.a = finite(color.a).clamp(0.0, 1.0) * finite(self.alpha).clamp(0.0, 1.0);
        BoxShadow::new(px(finite(self.x)), px(finite(self.y)), color)
            .blur_radius(px(finite(self.blur).max(0.0)))
            .spread_radius(px(finite(self.spread)))
            .inset()
    }

    fn rotated(mut self, sin: f32, cos: f32) -> Self {
        let (x, y) = (finite(self.x), finite(self.y));
        self.x = x * cos - y * sin;
        self.y = x * sin + y * cos;
        self
    }
}

/// Two inset layers. The highlight is painted above the shade.
#[derive(Clone, Copy, Debug)]
pub struct Surface {
    pub lit: Layer,
    pub dim: Layer,
}

impl Surface {
    pub fn new(lit: Layer, dim: Layer) -> Self {
        Self { lit, dim }
    }

    /// A soft highlight and shallow shade for a light fill.
    pub fn light() -> Self {
        Self::new(
            Layer::new(rgb(0xffffff), 0.8).offset(0.0, 2.0).blur(3.0),
            Layer::new(rgb(0x000000), 0.2).offset(0.0, -2.0).blur(3.0),
        )
    }

    /// Restrained highlight for a dark fill. This is a preset, not a global cap.
    pub fn dark() -> Self {
        Self::new(
            Layer::new(rgb(0xffffff), 0.12).offset(0.0, 2.0).blur(3.0),
            Layer::new(rgb(0x000000), 0.35).offset(0.0, -2.0).blur(3.0),
        )
    }

    /// Rotate both offsets clockwise from their configured direction.
    /// With the presets, 0° lights the top; 90° lights the right edge.
    /// Always rotate the original surface, rather than the previous frame.
    pub fn rotated(self, degrees: f32) -> Self {
        let (sin, cos) = finite(degrees).rem_euclid(360.0).to_radians().sin_cos();
        Self::new(self.lit.rotated(sin, cos), self.dim.rotated(sin, cos))
    }

    /// Native paint order is bottom to top, opposite CSS shadow order.
    pub fn shadows(self) -> Vec<BoxShadow> {
        vec![self.dim.shadow(), self.lit.shadow()]
    }
}

/// Fluent styling for any GPUI [`Styled`] element.
pub trait SpecularExt: Styled + Sized {
    /// Replace this element's shadow list with the two inset layers.
    /// Set its background and corner radius with the normal GPUI methods.
    fn specular(self, surface: Surface) -> Self {
        self.shadow(surface.shadows())
    }
}
impl<T: Styled> SpecularExt for T {}

/// Bearing from the element center to the pointer: 0° up, 90° right.
/// Both points must use the same coordinate system (normally window pixels).
/// At the exact center, or for non-finite coordinates, returns `None`.
pub fn pointer_angle(pointer: Point<Pixels>, center: Point<Pixels>) -> Option<f32> {
    let x = f32::from(pointer.x - center.x);
    let y = f32::from(pointer.y - center.y);
    if !x.is_finite() || !y.is_finite() || (x == 0.0 && y == 0.0) {
        return None;
    }
    Some(x.atan2(-y).to_degrees().rem_euclid(360.0))
}

/// Interpolate along the shortest arc. `amount` is clamped to `0..=1`.
/// For animation, call on each frame, notify the view, and stop when settled.
/// To respect reduced motion, pass the configured static angle instead.
pub fn damp_angle(current: f32, target: f32, amount: f32) -> f32 {
    let current = finite(current).rem_euclid(360.0);
    let target = finite(target).rem_euclid(360.0);
    let delta = (target - current + 180.0).rem_euclid(360.0) - 180.0;
    (current + delta * finite(amount).clamp(0.0, 1.0)).rem_euclid(360.0)
}

fn finite(value: f32) -> f32 {
    if value.is_finite() { value } else { 0.0 }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::point;

    #[test]
    fn shadows_are_inset_and_highlight_is_topmost() {
        let surface = Surface::dark();
        let shadows = surface.shadows();
        assert!(shadows.iter().all(|shadow| shadow.inset));
        assert_eq!(shadows[0].offset.y, px(-2.0));
        assert_eq!(shadows[1].offset.y, px(2.0));
        assert_eq!(shadows[1].color.a, 0.12);
    }

    #[test]
    fn rotation_preserves_depth_and_opposing_layers() {
        let rotated = Surface::dark().rotated(90.0);
        assert!((rotated.lit.x + 2.0).abs() < 0.0001);
        assert!(rotated.lit.y.abs() < 0.0001);
        assert_eq!(rotated.lit.x, -rotated.dim.x);
        assert_eq!(rotated.lit.blur, 3.0);
    }

    #[test]
    fn conversion_sanitizes_lengths_and_multiplies_alpha() {
        let layer = Layer::new(rgb(0xffffff).alpha(0.5), 0.4)
            .offset(f32::NAN, 2.0)
            .blur(-3.0)
            .spread(-1.0);
        let shadow = layer.shadow();
        assert_eq!(shadow.color.a, 0.2);
        assert_eq!(shadow.offset.x, px(0.0));
        assert_eq!(shadow.blur_radius, px(0.0));
        assert_eq!(shadow.spread_radius, px(-1.0));
        assert_eq!(Layer::new(rgb(0xffffff), 5.0).shadow().color.a, 1.0);
    }

    #[test]
    fn pointer_bearings_follow_screen_coordinates() {
        let center = point(px(100.0), px(100.0));
        for (x, y, angle) in [
            (100.0, 0.0, 0.0),
            (200.0, 100.0, 90.0),
            (100.0, 200.0, 180.0),
            (0.0, 100.0, 270.0),
        ] {
            assert_eq!(pointer_angle(point(px(x), px(y)), center), Some(angle));
        }
        assert_eq!(pointer_angle(center, center), None);
    }

    #[test]
    fn damping_crosses_zero_on_the_short_arc() {
        assert_eq!(damp_angle(350.0, 10.0, 0.5), 0.0);
        assert_eq!(damp_angle(10.0, 350.0, 0.5), 0.0);
        assert_eq!(damp_angle(20.0, 80.0, 0.0), 20.0);
        assert_eq!(damp_angle(20.0, 80.0, 1.0), 80.0);
    }
}
