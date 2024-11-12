/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
  },
  // proxy setup (only for full stack apps)
  server: {
    proxy: {
      "/api": {
        target: "http://backend:5001",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 5173
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5001',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // }
});

