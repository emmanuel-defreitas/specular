#if os(macOS)
import AppKit
import SwiftUI
import Testing

@testable import Specular

/// Hosts a live view so geometry and change handlers run, then moves the
/// shared pointer the way `.specularPointer()` does and reads pixels back.
@MainActor @Suite struct TrackingTests {
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
        for _ in 0..<5 { RunLoop.main.run(until: .now + 0.02) }
        let rep = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
        host.cacheDisplay(in: host.bounds, to: rep)
        let color = try #require(rep.colorAt(x: Int(point.x) * rep.pixelsWide / 100, y: Int(point.y) * rep.pixelsHigh / 100))
        return Double(try #require(color.usingColorSpace(.sRGB)).redComponent)
    }

    @Test func lightFollowsTheSharedPointer() throws {
        // The probe is 40 × 40, centered in 100 × 100: edges at 30 and 70.
        pointer.location = CGPoint(x: 50, y: -500)
        #expect(try luma(at: CGPoint(x: 50, y: 31)) > luma(at: CGPoint(x: 50, y: 69)) + 0.2)

        pointer.location = CGPoint(x: 500, y: 50)
        #expect(try luma(at: CGPoint(x: 69, y: 50)) > luma(at: CGPoint(x: 31, y: 50)) + 0.2)

        pointer.location = CGPoint(x: 50, y: 500)
        #expect(try luma(at: CGPoint(x: 50, y: 69)) > luma(at: CGPoint(x: 50, y: 31)) + 0.2)
    }
}
#endif
