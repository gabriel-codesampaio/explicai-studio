import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// O servidor exige Origin igual ao Host que recebe, e o proxy do Vite troca o Host. Só o Origin do próprio Vite
// (localhost ou 127.0.0.1 na 5173) é reescrito; qualquer outro segue intacto e o servidor o recusa (defesa CSRF).
const VITE_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):5173$/;
const matchOriginToHost: NonNullable<ProxyOptions["configure"]> = (proxy) =>
  proxy.on("proxyReq", (req) => {
    if (VITE_ORIGIN.test(String(req.getHeader("origin")))) req.setHeader("origin", `http://${req.getHeader("host")}`);
  });

// Em desenvolvimento, o Vite serve o editor e repassa /api e /files para o servidor do Studio (npm run dev:server).
export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": `${__dirname}src` },
  },
  build: {
    outDir: "../dist/web",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:4321", configure: matchOriginToHost },
      "/files": { target: "http://127.0.0.1:4321", configure: matchOriginToHost },
    },
  },
});
