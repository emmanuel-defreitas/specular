// Run with `swift run SpecularDemo` (macOS).
// Move the pointer to aim the light; click a tile to switch themes.
import Specular
import SwiftUI

#if os(macOS)
import AppKit

/// A bare SwiftPM executable launches as a background process, and an
/// inactive app gets no hover events, so bring it forward once launched.
final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApplication.shared.setActivationPolicy(.regular)
        NSApplication.shared.activate()
    }
}
#endif

@main
struct SpecularDemo: App {
    #if os(macOS)
    @NSApplicationDelegateAdaptor private var appDelegate: AppDelegate
    #endif

    var body: some Scene {
        WindowGroup("Specular") {
            Demo()
        }
        .defaultSize(width: 640, height: 420)
    }
}

struct Demo: View {
    @State private var dark = true

    var body: some View {
        HStack(spacing: 48) {
            // A shape: fill and light in one call.
            RoundedRectangle(cornerRadius: 36)
                .specular(fill: dark ? Color(white: 0.25) : Color(white: 0.84))
                .frame(width: 180, height: 180)
                .overlay { Text("Click to switch theme").font(.callout) }
                .onTapGesture { dark.toggle() }

            // Any view: light it in a shape, eased.
            Circle()
                .fill(dark ? Color(white: 0.25) : Color(white: 0.84))
                .frame(width: 140, height: 140)
                .specular(in: Circle(), light: .pointer(animation: .specular))
        }
        .foregroundStyle(dark ? Color(white: 0.9) : Color(white: 0.25))
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(dark ? Color(white: 0.09) : Color(white: 0.96))
        // One tracker for the window, so the light follows outside the tiles.
        .specularPointer()
        .preferredColorScheme(dark ? .dark : .light)
    }
}
