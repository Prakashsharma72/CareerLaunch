import { defineConfig } from "vite";
import react       from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Warn only when a chunk exceeds 600 KB after all splitting
    chunkSizeWarningLimit: 600,

    // Enable CSS code splitting (one CSS file per async chunk)
    cssCodeSplit: true,

    // Use esbuild minifier (faster than terser, ships with Vite)
    minify: "esbuild",

    // Target modern browsers — smaller output, no legacy polyfills
    target: "es2020",

    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy — split vendor libraries that are large
         * or shared across many routes into dedicated files that the
         * browser can cache independently.
         *
         * Chunks are created only for packages that actually exist in
         * package.json to avoid build errors.
         */
        manualChunks(id) {
          // ── React core ───────────────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ── React Router ─────────────────────────────────────────────
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run/")
          ) {
            return "vendor-router";
          }

          // ── Redux Toolkit + React-Redux ───────────────────────────────
          if (
            id.includes("node_modules/@reduxjs/toolkit") ||
            id.includes("node_modules/react-redux") ||
            id.includes("node_modules/redux/") ||
            id.includes("node_modules/reselect/") ||
            id.includes("node_modules/immer/")
          ) {
            return "vendor-redux";
          }

          // ── Framer Motion ────────────────────────────────────────────
          // Heaviest single dependency — isolate so pages that don't
          // use animation don't pay the cost.
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-framer-motion";
          }

          // ── React Icons ──────────────────────────────────────────────
          // Tree-shakeable but still a notable chunk; keep separate so
          // it can be cached across all pages that import icons.
          if (id.includes("node_modules/react-icons")) {
            return "vendor-icons";
          }

          // ── Axios ────────────────────────────────────────────────────
          if (id.includes("node_modules/axios")) {
            return "vendor-axios";
          }
        },
      },
    },
  },
});
