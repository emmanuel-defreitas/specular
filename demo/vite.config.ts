import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `file:../..` is a symlink; without dedupe Vite finds the repo's own
    // react copy and every hook throws. Consumers installing from npm don't
    // need this.
    dedupe: ["react", "react-dom", "tailwind-merge"],
  },
})
