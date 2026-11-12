import SwiftUI
import Testing

@testable import Specular

@Suite struct SurfaceTests {
    @Test func presetsLightTheTopAboveTheShade() {
        let dark = SpecularSurface.dark
        #expect(dark.lit.y == 2)
        #expect(dark.dim.y == -2)
        #expect(dark.lit.opacity == 0.12)
        #expect(SpecularSurface.light.lit.opacity == 0.8)
    }

    @Test func rotationPreservesDepthAndOpposingLayers() {
        let rotated = SpecularSurface.dark.rotated(by: .degrees(90))
        #expect(abs(rotated.lit.x + 2) < 0.0001)
        #expect(abs(rotated.lit.y) < 0.0001)
        #expect(rotated.lit.x == -rotated.dim.x)
        #expect(rotated.lit.blur == 3)
    }

    @Test func sanitizingClampsAndZeroesBadLengths() {
        let layer = SpecularSurface.Layer(.white, opacity: 5, x: .nan, y: 2, blur: -3, spread: -1).sanitized
        #expect(layer.opacity == 1)
        #expect(layer.x == 0)
        #expect(layer.blur == 0)
        #expect(layer.spread == -1)
    }

    @Test func bleedCoversBlurOffsetAndSpread() {
        let surface = SpecularSurface(
            lit: .init(.white, opacity: 1, x: 3, y: 4, blur: 2, spread: -1),
            dim: .init(.black, opacity: 1)
        )
        #expect(abs(surface.bleed - (3 + 5 + 1)) < 0.0001)
        #expect(surface.rotated(by: .degrees(37)).bleed - surface.bleed < 0.0001)
    }
}

@Suite struct LightTests {
    @Test func bearingsFollowScreenCoordinates() {
        let center = CGPoint(x: 100, y: 100)
        for (x, y, angle) in [(100.0, 0.0, 0.0), (200, 100, 90), (100, 200, 180), (0, 100, 270)] {
            #expect(SpecularLight.bearing(of: CGPoint(x: x, y: y), from: center)?.degrees == angle)
        }
        #expect(SpecularLight.bearing(of: center, from: center) == nil)
        #expect(SpecularLight.bearing(of: CGPoint(x: CGFloat.nan, y: 0), from: center) == nil)
    }

    @Test func unwrapTakesTheShortArcAndStaysContinuous() {
        #expect(SpecularLight.unwrap(nil, toward: 90) == 90)
        #expect(SpecularLight.unwrap(350, toward: 10) == 370)
        #expect(SpecularLight.unwrap(10, toward: 350) == -10)
        #expect(SpecularLight.unwrap(720, toward: 90) == 810)
        #expect(SpecularLight.unwrap(90, toward: 91) == nil)
    }

    @Test func dampingCrossesZeroOnTheShortArc() {
        #expect(SpecularLight.dampAngle(350, toward: 10, amount: 0.5) == 0)
        #expect(SpecularLight.dampAngle(10, toward: 350, amount: 0.5) == 0)
        #expect(SpecularLight.dampAngle(20, toward: 80, amount: 0) == 20)
        #expect(SpecularLight.dampAngle(20, toward: 80, amount: 1) == 80)
    }
}

@Suite struct PathTests {
    @Test func insetShrinksAndNegativeInsetGrows() {
        let square = Path(CGRect(x: 0, y: 0, width: 40, height: 40))
        #expect(square.inset(by: 5).boundingRect.insetBy(dx: -0.01, dy: -0.01).contains(CGRect(x: 5, y: 5, width: 30, height: 30)))
        #expect(abs(square.inset(by: 5).boundingRect.width - 30) < 0.01)
        #expect(abs(square.inset(by: -5).boundingRect.width - 50) < 0.01)
        #expect(square.inset(by: 0) == square)
    }
}

/// Renders the bezel and reads pixels back, so the paint direction is
/// checked end to end rather than only the offset maths.
@MainActor @Suite struct RenderTests {
    struct Probe: View {
        var light: SpecularLight

        var body: some View {
            Rectangle()
                .specular(
                    SpecularSurface(
                        lit: .init(.white, opacity: 1, y: 4, blur: 2),
                        dim: .init(.black, opacity: 1, y: -4, blur: 2)
                    ),
                    fill: Color(white: 0.5),
                    light: light
                )
                .frame(width: 40, height: 40)
                .environment(\.colorScheme, .light)
        }
    }

    func luma(_ light: SpecularLight, x: Int, y: Int) throws -> Double {
        let renderer = ImageRenderer(content: Probe(light: light))
        renderer.scale = 1
        let image = try #require(renderer.cgImage)
        let data = try #require(image.dataProvider?.data as Data?)
        let offset = y * image.bytesPerRow + x * image.bitsPerPixel / 8
        return Double(data[offset]) / 255
    }

    @Test func topIsLitAndBottomIsShadedAtZeroDegrees() throws {
        let top = try luma(.fixed(.zero), x: 20, y: 1)
        let middle = try luma(.fixed(.zero), x: 20, y: 20)
        let bottom = try luma(.fixed(.zero), x: 20, y: 38)
        #expect(top > middle + 0.2)
        #expect(bottom < middle - 0.2)
    }

    @Test func ninetyDegreesLightsTheRightEdge() throws {
        let right = try luma(.fixed(.degrees(90)), x: 38, y: 20)
        let left = try luma(.fixed(.degrees(90)), x: 1, y: 20)
        let top = try luma(.fixed(.degrees(90)), x: 20, y: 1)
        #expect(right > top + 0.2)
        #expect(left < top - 0.2)
    }
}
