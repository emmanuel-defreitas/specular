import SwiftUI

extension Shape {
    /// Fill this shape and light it with two inset layers.
    ///
    ///     Circle()
    ///         .specular(fill: .gray)
    ///         .frame(width: 160, height: 160)
    ///
    /// A `nil` surface follows the color scheme: `.dark` in dark mode,
    /// `.light` otherwise. The light follows the pointer by default.
    @MainActor
    public func specular<Fill: ShapeStyle>(
        _ surface: SpecularSurface? = nil,
        fill: Fill,
        light: SpecularLight = .pointer
    ) -> some View {
        self.fill(fill).specular(surface, in: self, light: light)
    }
}

extension View {
    /// Light this view with two inset layers clipped to `shape`.
    ///
    ///     Text("Hello")
    ///         .padding()
    ///         .background(.gray, in: .rect(cornerRadius: 16))
    ///         .specular(in: .rect(cornerRadius: 16))
    ///
    /// The layers are an overlay, so unlike a CSS inset shadow they paint
    /// above the content, an opaque image included. They never take hits.
    public func specular<S: Shape>(
        _ surface: SpecularSurface? = nil,
        in shape: S,
        light: SpecularLight = .pointer
    ) -> some View {
        modifier(SpecularModifier(surface: surface, shape: shape, light: light))
    }
}

struct SpecularModifier<S: Shape>: ViewModifier {
    let surface: SpecularSurface?
    let shape: S
    let light: SpecularLight

    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.specularPointer) private var sharedPointer

    @State private var frame: CGRect?
    @State private var localPointer: CGPoint?
    /// Continuous (unwrapped) degrees, so animation takes the short arc.
    @State private var angle: Double?

    private var follows: Bool { light.source == .pointer && !reduceMotion }

    private var pointer: CGPoint? {
        sharedPointer.map(\.location) ?? localPointer
    }

    func body(content: Content) -> some View {
        content
            .overlay {
                SpecularBezel(
                    shape: shape,
                    surface: surface ?? (colorScheme == .dark ? .dark : .light),
                    degrees: degrees
                )
                .animation(follows ? light.animation : nil, value: degrees)
            }
            .onGeometryChange(for: CGRect.self) { $0.frame(in: .global) } action: {
                frame = $0
                aim()
            }
            .onContinuousHover(coordinateSpace: .global) { phase in
                // Without a `.specularPointer()` container, track our own bounds.
                guard sharedPointer == nil, case .active(let location) = phase else { return }
                localPointer = location
            }
            .onChange(of: pointer) { aim() }
            .onChange(of: follows) { angle = nil; aim() }
    }

    private var degrees: Double {
        switch light.source {
        case .fixed(let fixed): fixed.degrees
        // Reduced motion keeps the configured top light, like the web's 0.
        case .pointer: follows ? angle ?? 0 : 0
        }
    }

    private func aim() {
        guard follows, let frame, let pointer,
              let bearing = SpecularLight.bearing(of: pointer, from: CGPoint(x: frame.midX, y: frame.midY)),
              let next = SpecularLight.unwrap(angle, toward: bearing.degrees)
        else { return }
        angle = next
    }
}

/// Draws the dim layer, then the lit layer, inside `shape`. Animatable in
/// its angle so an eased change sweeps around the rim instead of cutting
/// across it.
struct SpecularBezel<S: Shape>: View, Animatable {
    let shape: S
    let surface: SpecularSurface
    var degrees: Double

    nonisolated var animatableData: Double {
        get { degrees }
        set { degrees = newValue }
    }

    var body: some View {
        let surface = surface.rotated(by: .degrees(degrees))
        let bleed = ceil(surface.bleed)
        Canvas { context, size in
            let bounds = CGRect(origin: .zero, size: size)
            let path = shape.path(in: bounds.insetBy(dx: bleed, dy: bleed))
            context.clip(to: path)
            for layer in [surface.dim.sanitized, surface.lit.sanitized] where layer.opacity > 0 {
                context.drawLayer { group in
                    if layer.blur > 0 { group.addFilter(.blur(radius: layer.blur / 2)) }
                    // Everything outside the (spread) shape, moved by the
                    // offset: an inset shadow, the way CSS defines one.
                    var caster = Path(bounds)
                    caster.addPath(path.inset(by: layer.spread).offsetBy(dx: layer.x, dy: layer.y))
                    group.fill(
                        caster,
                        with: .color(layer.color.opacity(layer.opacity)),
                        style: FillStyle(eoFill: true)
                    )
                }
            }
        }
        // The canvas overhangs the shape so blur has room to fade.
        .padding(-bleed)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

extension Path {
    /// Offset the outline inward by `distance` (outward when negative).
    func inset(by distance: CGFloat) -> Path {
        guard distance != 0, !isEmpty else { return self }
        let band = strokedPath(StrokeStyle(lineWidth: abs(distance) * 2, lineCap: .round, lineJoin: .round))
        return distance > 0 ? subtracting(band) : union(band)
    }
}
