import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project Pages live under /<repo>/, so assets must be prefixed with the repo
// name. The build is emitted straight into ../docs, which GitHub Pages serves.
export default defineConfig({
  base: "/github-ai-radar/",
  plugins: [react()],
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
