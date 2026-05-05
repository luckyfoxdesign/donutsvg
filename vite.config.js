import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    cssMinify: false,
    sourcemap: false,
    target: "esnext",
  },
  server: {
    host: true,
    port: 3000,
  },
});
