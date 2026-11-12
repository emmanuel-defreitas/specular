import SwiftUI

/// Where a specular surface takes its light from.
public struct SpecularLight: Sendable {
    enum Source: Sendable, Equatable {
        case pointer
        case fixed(Angle)
    }

    let source: Source
    let animation: Animation?

    /// Follow the pointer immediately, like the web and GPUI defaults.
    public static let pointer = SpecularLight(source: .pointer, animation: nil)

    /// Follow the pointer, easing each change with `animation`.
    /// `.specular` matches the web rim's 350 ms ease-out.
    public static func pointer(animation: Animation?) -> SpecularLight {
        SpecularLight(source: .pointer, animation: animation)
    }

    /// A static light `angle` clockwise from 12 o'clock.
    public static func fixed(_ angle: Angle) -> SpecularLight {
        SpecularLight(source: .fixed(angle), animation: nil)
    }

    /// Below this a move is skipped: the bezel cannot show a sub-degree change.
    public static let angleEpsilon: Double = 1.5

    /// Bearing from `center` to `pointer`: 0° up, 90° right, in screen
    /// coordinates (y grows downward). Both points must share a coordinate
    /// space. `nil` at the exact center or for non-finite coordinates.
    public static func bearing(of pointer: CGPoint, from center: CGPoint) -> Angle? {
        let x = pointer.x - center.x
        let y = pointer.y - center.y
        guard x.isFinite, y.isFinite, x != 0 || y != 0 else { return nil }
        return .degrees(wrap(atan2(x, -y) * 180 / .pi))
    }

    /// Step from `last` toward `bearing` along the shortest arc. The result is
    /// continuous (it may exceed 360 or go negative), so an animation never
    /// spins the long way round. `nil` when the move is under `angleEpsilon`.
    public static func unwrap(_ last: Double?, toward bearing: Double) -> Double? {
        guard let last else { return bearing }
        let delta = wrap(bearing - wrap(last) + 180) - 180
        guard abs(delta) >= angleEpsilon else { return nil }
        return last + delta
    }

    /// Interpolate along the shortest arc; `amount` is clamped to `0...1`.
    /// For frame-driven smoothing, call per frame with
    /// `1 - exp(-dt / 0.12)` for a 120 ms response.
    public static func dampAngle(_ current: Double, toward target: Double, amount: Double) -> Double {
        let current = wrap(finite(current))
        let delta = wrap(wrap(finite(target)) - current + 180) - 180
        return wrap(current + delta * finite(amount).clamped(to: 0...1))
    }

    static func wrap(_ degrees: Double) -> Double {
        let r = degrees.truncatingRemainder(dividingBy: 360)
        return r < 0 ? r + 360 : r
    }
}

extension Animation {
    /// The web rim's transition: 350 ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
    public static let specular = Animation.timingCurve(0.22, 1, 0.36, 1, duration: 0.35)
}

/// The pointer location shared by every surface under `.specularPointer()`,
/// in the global coordinate space. One hover handler drives them all.
@MainActor @Observable
final class SpecularPointer {
    var location: CGPoint?
}

extension EnvironmentValues {
    @Entry var specularPointer: SpecularPointer? = nil
}

struct SpecularPointerModifier: ViewModifier {
    let touches: Bool
    @State private var pointer = SpecularPointer()

    func body(content: Content) -> some View {
        content
            .environment(\.specularPointer, pointer)
            .contentShape(Rectangle())
            .onContinuousHover(coordinateSpace: .global) { phase in
                // The light stays where the pointer left, as on the web.
                if case .active(let location) = phase { pointer.location = location }
            }
            .simultaneousGesture(
                DragGesture(minimumDistance: 0, coordinateSpace: .global)
                    .onChanged { pointer.location = $0.location },
                isEnabled: touches
            )
    }
}

extension View {
    /// Track the pointer across this whole view for every `.specular`
    /// surface inside it, so their light keeps following outside their own
    /// bounds. Apply it to a container that fills the window.
    ///
    /// The container gets a rectangular content shape so hover registers in
    /// its gaps. Pass `touches: true` to also follow drags, for devices
    /// without a hovering pointer.
    public func specularPointer(touches: Bool = false) -> some View {
        modifier(SpecularPointerModifier(touches: touches))
    }
}
