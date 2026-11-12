// swift-tools-version: 6.0
// SwiftUI port of Specular. The manifest sits at the repository root because
// SwiftPM resolves git dependencies from there; the sources live in swift/.
import PackageDescription

let package = Package(
    name: "Specular",
    platforms: [.macOS(.v14), .iOS(.v17), .visionOS(.v1)],
    products: [
        .library(name: "Specular", targets: ["Specular"])
    ],
    targets: [
        .target(name: "Specular", path: "swift/Sources/Specular"),
        .executableTarget(
            name: "SpecularDemo",
            dependencies: ["Specular"],
            path: "swift/Examples/SpecularDemo"
        ),
        .testTarget(
            name: "SpecularTests",
            dependencies: ["Specular"],
            path: "swift/Tests/SpecularTests"
        ),
    ]
)
