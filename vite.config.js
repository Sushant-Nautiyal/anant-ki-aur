import { defineConfig } from "vite";

export default defineConfig({
  // Required for GitHub Pages subpath deployments.
  // Never use absolute asset paths in this app.
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false
  }
});
