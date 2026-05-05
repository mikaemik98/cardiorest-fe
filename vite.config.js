// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        trends: resolve(__dirname, "trends.html"),
        hrv: resolve(__dirname, "hrv.html"),
        diary: resolve(__dirname, "diary.html"),
        termisto: resolve(__dirname, "termisto.html"),
      },
    },
  },
});
