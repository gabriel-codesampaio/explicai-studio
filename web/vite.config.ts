import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Em desenvolvimento, o Vite serve o editor e repassa /api e /files para o servidor do Studio (npm run dev:server).
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: "../dist/web",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:4321",
      "/files": "http://127.0.0.1:4321",
    },
  },
});
