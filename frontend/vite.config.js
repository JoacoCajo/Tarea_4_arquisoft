import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/threads-api": {
        target: "https://threads.inf326.nursoft.dev",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/threads-api/, ""),
      },
      "/channels-api": {
        target: "https://channel-api.inf326.nur.dev",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/channels-api/, ""),
      },
      "/search-api": {
        target: "https://searchservice.inf326.nursoft.dev",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/search-api/, ""),
      },
          "/users-api": {
      target: "https://users.inf326.nursoft.dev",   // AJUSTA si la URL real es distinta
      changeOrigin: true,
      secure: false,
      rewrite: (p) => p.replace(/^\/users-api/, "")
  }
    },
  },
});