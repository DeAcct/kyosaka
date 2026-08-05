// vite.config.js / vite.config.ts
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  envPrefix: ["VITE_", "GEMINI_"],
  plugins: [
    VitePWA({
      includeAssets: ["favicon.svg", "robots.txt"],
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "쿄사카",
        short_name: "쿄사카",
        categories: ["travel", "schedule", "todo"],
        description: "여행계획을 읽고, 쓰고, 공유하자",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        orientation: "portrait-primary",
        launch_handler: {
          client_mode: ["focus-existing", "auto"],
        },
        edge_side_panel: {
          preferred_width: 412,
        },
        related_applications: [],
        prefer_related_applications: false,
        handle_links: "preferred",
        dir: "ltr",
        theme_color: "#2c90ff",
        lang: "ko",
        id: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any maskable",
          },
          {
            src: "/icons/favicon.svg",
            sizes: "24x24",
            type: "image/svg",
          },
        ],
        shortcuts: [
          {
            name: "일정",
            url: "/",
            description: "내가 세운 여행 계획을 조회",
          },
          {
            name: "체크리스트",
            url: "/checklist",
            description: "여행 출발 전 확인해야 할 것들",
          },
          {
            name: "갤러리",
            url: "/gallery",
            description: "여행 중 추억과 민감한 개인정보까지 안전하게",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: ".",
  server: {
    fs: {
      strict: false,
      allow: ["/"],
    },
  },
  esbuild: {
    drop: ["console", "debugger"], // 빌드 시 console 및 debugger 제거
  },
  cacheDir: ".vite",
});
