import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@exegia/specular` is installed from `file:../..`, which npm links as a
    // symlink. Vite resolves the linked files to their real path, and from
    // there a bare `import "react"` would find the repository's own devDep
    // copy — a second React, and every hook throws. `dedupe` pins those
    // packages to this app's node_modules. A consumer installing from npm
    // does not need this.
    dedupe: ["react", "react-dom", "tailwind-merge"],
  },
})
