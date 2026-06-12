// import { analyzer } from "vite-bundle-analyzer";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    port: 8099,
    host: true,
    open: true,
    proxy: {
      "/decode": {
        target: "http://8.210.203.190:8090/decode.php#",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/decode/, ""),
      },
      "/transfer": {
        target: "http://8.210.203.190:8090/transfer.php#",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/transfer/, ""),
      },
      "/decrypt": {
        target: "http://8.210.203.190:8090/decrypt.php#",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/decrypt/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    minify: "terser",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      // external: ["styled-components"], // 避免重复打包styled-components
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: (asset) => {
          if (asset.name?.endsWith(".css")) {
            return "css/[name]-[hash].css";
          } else {
            const extType = asset.name?.split(".")[1] || "";
            if (/png|jpe?g|svg|gif|webp/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return "assets/[name]-[hash].[ext]";
          }
        },
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          antd: ["antd"],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  plugins: [
    react({
      include: /\.(jsx|tsx)$/,
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              ssr: false,
              pure: true,
              minify: false,
              displayName: true,
              fileName: false,
            },
          ],
        ],
        babelrc: false,
        configFile: false,
      },
    }),
    tsconfigPaths({ loose: true }),
    legacy(),
    // analyzer(),
  ],
});
