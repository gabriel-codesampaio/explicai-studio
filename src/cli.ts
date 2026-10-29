#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createStudioServer } from "./server/index.js";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string", short: "p", default: "4321" },
    "no-open": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(`Uso: explicai [pasta] [--port 4321] [--no-open]

Abre o Explicaí Studio no navegador. Os manuais ficam em [pasta] (padrão: pasta atual).`);
  process.exit(0);
}

const workspace = path.resolve(positionals[0] ?? ".");
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Porta inválida: ${values.port}`);
  process.exit(1);
}

await mkdir(workspace, { recursive: true });
const webDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "web");
const server = createStudioServer({ workspace, webDir });

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error(err.code === "EADDRINUSE" ? `A porta ${port} já está em uso. Tente --port ${port + 1}.` : err.message);
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://localhost:${port}`;
  console.log(`Explicaí Studio em ${url}\nManuais em ${workspace}\nCtrl+C para sair.`);
  if (!values["no-open"]) openBrowser(url);
});

function openBrowser(url: string): void {
  const [cmd, args] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  spawn(cmd, args, { stdio: "ignore", detached: true })
    .on("error", () => {})
    .unref();
}
