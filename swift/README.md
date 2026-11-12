# Specular for SwiftUI

Native inset highlights and shades for SwiftUI, from the Specular project: the
same two layers (lit and dim) as the web plugin and `gpui-specular`, turning to
follow the pointer. It draws with SwiftUI only; there's no web view and no
global event monitor.

macOS 14, iOS 17 and visionOS 1 or later. Swift 6.

## Install

Add the repository with Swift Package Manager. The manifest sits at the
repository root and shares its version tags with the npm package:

```swift
dependencies: [
    .package(url: "https://github.com/emmanuel-defreitas/specular.git", branch: "dev"),
],
targets: [
    .target(name: "App", dependencies: [.product(name: "Specular", package: "specular")]),
]
```

Once a tagged release includes the Swift package, depend on it with
`from: "<version>"` instead of `branch:`. In Xcode, use **File › Add Package
Dependencies…** and paste the same URL.

## Light a shape

`specular` is a `Shape` modifier. It fills the shape and lights its edge:

```swift
import Specular
import SwiftUI

RoundedRectangle(cornerRadius: 32)
    .specular(fill: Color(white: 0.25))
    .frame(width: 160, height: 160)
```

Any other view can borrow a shape for the light, in the same way as
`.background(_:in:)`:

```swift
Label("Inbox", systemImage: "tray")
    .padding()
    .background(.quaternary, in: .capsule)
    .specular(in: .capsule)
```

Without a surface argument, the light follows the color scheme: `.dark` in dark
mode and `.light` otherwise. To choose one, pass it explicitly:
`.specular(.dark, fill: …)`. The dark preset uses a 12% highlight. It's a
starting point, not a cap.

## Follow the pointer

Every surface follows the pointer by default. On its own, a surface sees the
pointer only while it hovers over the surface. To keep the light tracking
anywhere in the window, add `.specularPointer()` to a container that fills the
window. It's one hover handler for every surface inside, like the web
package's single window listener:

```swift
struct Gallery: View {
    var body: some View {
        HStack(spacing: 32) {
            ForEach(0..<6) { _ in
                Circle().specular(fill: .gray).frame(width: 64, height: 64)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .specularPointer()
    }
}
```

`.specularPointer()` gives its container a rectangular content shape so hover
registers in the gaps between children. On devices without a hovering pointer,
`.specularPointer(touches: true)` also follows drags.

Each surface measures its own center, so this works for surfaces anywhere in
the container, including inside scroll views. There's no single shared center
to keep in sync.

### Light options

| `light:` | Behavior |
| --- | --- |
| `.pointer` (default) | Follows the pointer immediately, like the web and GPUI defaults. |
| `.pointer(animation: .specular)` | Eases each change. `.specular` is the web rim's 350 ms `cubic-bezier(0.22, 1, 0.36, 1)`. |
| `.fixed(.degrees(90))` | A static light, clockwise from 12 o'clock. 90° lights the right edge. |

The light always takes the short way around: it never spins through 350° to
reach 10°. Moves under 1.5° are skipped. With **Reduce Motion** on, a
pointer-driven surface stays lit from the top, as on the web.

## Configure the layers

```swift
let surface = SpecularSurface(
    lit: .init(Color(red: 0.86, green: 0.92, blue: 1), opacity: 0.14, y: 2, blur: 2),
    dim: .init(Color(red: 0.09, green: 0.13, blue: 0.17), opacity: 0.35, y: -2, blur: 3)
)

Circle().specular(surface, fill: .indigo)
```

Lengths are points. Opacity is **0–1**, as in GPUI, not the 0–100 of the
TypeScript config. Positive `y` lights the top edge, and positive `spread`
widens the inset band. `blur` uses the CSS meaning (Gaussian σ = blur / 2), so
values carry over from your Tailwind config. The color's own alpha is
multiplied by `opacity`. Opacity is clamped, negative blur becomes zero, and
non-finite lengths become zero. Rotation turns both layers, which keeps the
shade opposite the highlight.

## Helpers

The same direction maths as `gpui_specular` and the web hook, for driving the
light yourself (for example with `.fixed(angle)` from your own gesture):

- `SpecularLight.bearing(of:from:)`: 0° above the center, 90° to its right, or `nil` at the exact center.
- `SpecularLight.unwrap(_:toward:)`: shortest-arc step that keeps the angle continuous.
- `SpecularLight.dampAngle(_:toward:amount:)`: shortest-arc interpolation for frame-driven easing.
- `SpecularSurface.rotated(by:)`: always rotate the original surface, never a previously rotated one.

## Differences from the web and GPUI

- The layers are an **overlay**: they paint above the view's content, an opaque
  image included. CSS and GPUI inset shadows paint below the children. Hit
  testing and accessibility are unaffected.
- The image-overlay rim (`<Rim>`) and image-tone sampling are web-only for now.
- Native and browser blur renderers can differ slightly.

## Demo and checks

From the repository root on macOS:

```sh
swift run SpecularDemo   # move the pointer; click the square to switch themes
swift test
```

The tests cover the maths and also render real views, reading pixels back to
check which edge is lit at each angle and that the light follows the shared
pointer.

MIT. See [LICENSE](../LICENSE).
