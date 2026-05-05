import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default {
  plugins: [svelte()],
  build: {
    cssMinify: false,
  },
  server: {
    host: true,
    port: 3000, // change to your desired port
    strictPort: true, // (optional) fails if port is taken
    hmr: true, // HMR is enabled by default in Vite, but you can explicitly set this
  },
};
