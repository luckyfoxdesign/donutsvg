import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    cssMinify: true,
    sourcemap: false,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          smui: [
            "@smui/button",
            "@smui/icon-button",
            "@smui/list",
            "@smui/menu",
            "@smui/menu-surface",
            "@smui/paper",
            "@smui/snackbar",
            "@smui/tab",
            "@smui/tab-bar",
            "@smui/textfield",
          ],
          canvg: ["canvg"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 3000,
  },
});
