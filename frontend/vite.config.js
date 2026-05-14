import { defineConfig } from "vite";
import { resolve } from "node:path";

// Multi-page build so Vercel can serve /portal.html, /payment.html, etc.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        portal: resolve(__dirname, "portal.html"),
        payment: resolve(__dirname, "payment.html"),
      },
    },
  },
});

