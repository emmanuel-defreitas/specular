import SwiftUI

/// Two inset layers: a highlight painted above a shade.
///
/// Mirrors `gpui_specular::Surface`. Lengths are points; opacity is `0...1`.
/// Positive `y` lights the top edge, so the presets light the top at 0°.
public struct SpecularSurface: Hashable, Sendable {
    /// A single inset layer.
    ///
    /// The layer paints `color` inside the shape, cast by the shape's own
    /// edge moved by (`x`, `y`). Positive `spread` grows the band; negative
    /// spread contracts it. `blur` is the CSS blur radius (Gaussian σ = blur / 2).
    /// The color's own alpha is multiplied by `opacity`.
    public struct Layer: Hashable, Sendable {
        public var color: Color
        public var x: CGFloat
        public var y: CGFloat
        public var blur: CGFloat
        public var spread: CGFloat
        public var opacity: Double

        public init(
            _ color: Color,
            opacity: Double,
            x: CGFloat = 0,
            y: CGFloat = 0,
            blur: CGFloat = 0,
            spread: CGFloat = 0
        ) {
            self.color = color
            self.opacity = opacity
            self.x = x
            self.y = y
            self.blur = blur
            self.spread = spread
        }

        /// Non-finite lengths become zero, negative blur becomes zero and
        /// opacity is clamped to `0...1`.
        var sanitized: Layer {
            Layer(
                color,
                opacity: finite(opacity).clamped(to: 0...1),
                x: finite(x),
                y: finite(y),
                blur: max(finite(blur), 0),
                spread: finite(spread)
            )
        }

        func rotated(sin: CGFloat, cos: CGFloat) -> Layer {
            var layer = self
            let (x, y) = (finite(x), finite(y))
            layer.x = x * cos - y * sin
            layer.y = x * sin + y * cos
            return layer
        }
    }

    public var lit: Layer
    public var dim: Layer

    public init(lit: Layer, dim: Layer) {
        self.lit = lit
        self.dim = dim
    }

    /// A soft highlight and shallow shade for a light fill.
    public static let light = SpecularSurface(
        lit: Layer(.white, opacity: 0.8, y: 2, blur: 3),
        dim: Layer(.black, opacity: 0.2, y: -2, blur: 3)
    )

    /// Restrained highlight for a dark fill. This is a preset, not a global cap.
    public static let dark = SpecularSurface(
        lit: Layer(.white, opacity: 0.12, y: 2, blur: 3),
        dim: Layer(.black, opacity: 0.35, y: -2, blur: 3)
    )

    /// Rotate both offsets clockwise from their configured direction.
    /// With the presets, 0° lights the top and 90° lights the right edge.
    /// Always rotate the original surface, never a previously rotated one.
    public func rotated(by angle: Angle) -> SpecularSurface {
        let radians = finite(angle.degrees).truncatingRemainder(dividingBy: 360) * .pi / 180
        let (sin, cos) = (CGFloat(Foundation.sin(radians)), CGFloat(Foundation.cos(radians)))
        return SpecularSurface(lit: lit.rotated(sin: sin, cos: cos), dim: dim.rotated(sin: sin, cos: cos))
    }

    /// Room a layer needs outside the shape so its blur never meets the
    /// canvas edge. Independent of rotation, which preserves offset length.
    var bleed: CGFloat {
        [lit.sanitized, dim.sanitized]
            .map { $0.blur * 1.5 + hypot($0.x, $0.y) + abs($0.spread) }
            .max() ?? 0
    }
}

func finite<T: BinaryFloatingPoint>(_ value: T) -> T {
    value.isFinite ? value : 0
}

extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
