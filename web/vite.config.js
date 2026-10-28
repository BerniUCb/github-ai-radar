import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the domain root on Vercel (Root Directory: web), so the default
// base "/" and output dir web/dist are what the Vercel Vite preset expects.
export default defineConfig({
  plugins: [react()],
});
