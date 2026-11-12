#if os(macOS)
import AppKit
import SwiftUI
import Testing

@testable import Specular

/// Hosts a live view so geometry and change handlers run, then moves the
/// shared pointer the way `.specularPointer()` does and reads pixels back.
/// Needs a GUI session: on a headless CI runner SwiftUI never updates an
/// offscreen window, so the pure `AimTests` cover the logic there.
@MainActor @Suite(.disabled(if: ProcessInfo.processInfo.environment["CI"] != nil, "needs a GUI session"))
struct TrackingTests {
    let pointer = SpecularPointer()
    let host: NSHostingView<AnyView>
    let window: NSWindow

    init() {
        host = NSHostingView(rootView: AnyView(
            RenderTests.Probe(light: .pointer)
                .frame(width: 100, height: 100)
                .environment(\.specularPointer, pointer)
        ))
        window = NSWindow(
            contentRect: CGRect(x: 0, y: 0, width: 100, height: 100),
            styleMask: .borderless, backing: .buffered, defer: false
        )
        window.contentView = host
    }

    func luma(at point: CGPoint) throws -> Double {
        let rep = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
        host.cacheDisplay(in: host.bounds, to: rep)
        let color = try #require(rep.colorAt(x: Int(point.x) * rep.pixelsWide / 100, y: Int(point.y) * rep.pixelsHigh / 100))
        return Double(try #require(color.usingColorSpace(.sRGB)).redComponent)
    }

    /// Whether `lit` reads brighter than `shaded`, pumping the run loop until
    /// it does or two seconds pass. Updates land a few turns after the
    /// pointer moves, later still on a slow CI runner.
    func settles(lit: CGPoint, shaded: CGPoint) throws -> Bool {
        let deadline = Date.now + 2
        repeat {
            RunLoop.main.run(until: .now + 0.02)
            if try luma(at: lit) > luma(at: shaded) + 0.2 { return true }
        } while Date.now < deadline
        return false
    }

    @Test func lightFollowsTheSharedPointer() throws {
        // The probe is 40 × 40, centered in 100 × 100: edges at 30 and 70.
        let (top, right, bottom, left) = (CGPoint(x: 50, y: 31), CGPoint(x: 69, y: 50), CGPoint(x: 50, y: 69), CGPoint(x: 31, y: 50))

        pointer.location = CGPoint(x: 500, y: 50)
        #expect(try settles(lit: right, shaded: left))

        pointer.location = CGPoint(x: 50, y: 500)
        #expect(try settles(lit: bottom, shaded: top))

        pointer.location = CGPoint(x: -500, y: 50)
        #expect(try settles(lit: left, shaded: right))
    }
}
#endif
