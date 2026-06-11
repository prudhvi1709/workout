import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this repo at https://<user>.github.io/workout/,
// so the build must be base-pathed to /workout/. Override via VITE_BASE for
// custom domains or local preview if needed.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/workout/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split the heavy charting lib into its own chunk for better caching.
        manualChunks: {
          recharts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
