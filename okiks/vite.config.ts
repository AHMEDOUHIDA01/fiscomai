import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: { globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"] },
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "OKIKS — تعلّم الإنجليزية",
        short_name: "OKIKS",
        description: "Apprends l'anglais à la marocaine, avec Okiko le fennec.",
        theme_color: "#2A4BD7",
        background_color: "#F6EFE3",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
