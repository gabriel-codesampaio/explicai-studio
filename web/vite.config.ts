import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// O servidor exige Origin igual ao Host que recebe; o proxy do Vite troca o Host, então o Origin acompanha.
const matchOriginToHost: NonNullable<ProxyOptions["configure"]> = (proxy) =>
  proxy.on("proxyReq", (req) => {
    if (req.getHeader("origin")) req.setHeader("origin", `http://${req.getHeader("host")}`);
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
