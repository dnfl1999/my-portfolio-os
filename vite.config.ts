import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const githubPagesBase = "/my-portfolio-os/";
const base = process.env.GITHUB_ACTIONS === "true" ? githubPagesBase : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "My Portfolio OS",
        short_name: "Portfolio OS",
        description: "엑셀을 대체하는 개인 투자 포트폴리오 대시보드",
        theme_color: "#0f172a",
        background_color: "#f3f4f6",
        display: "standalone",
        orientation: "portrait",
        start_url: githubPagesBase,
        scope: githubPagesBase,
        lang: "ko-KR",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
