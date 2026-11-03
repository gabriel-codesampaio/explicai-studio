// Sobe o Studio já compilado (dist/) numa pasta de manuais nova e vazia, só para os testes E2E.
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudioServer } from "../dist/server/index.js";
import { e2eWorkspace } from "./workspace.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
// Sem a carência de 1 min do servidor, as imagens soltas dos testes já contam como sem uso.
process.env.EXPLICAI_ASSET_GRACE_MS = "0";
const port = Number(process.env.E2E_PORT ?? 4400);
const workspace = e2eWorkspace(port);
await rm(workspace, { recursive: true, force: true }); // sobra de uma rodada morta
await mkdir(workspace, { recursive: true });
const server = createStudioServer({ workspace, webDir: path.join(root, "..", "dist", "web") });
server.listen(port, "127.0.0.1", () => console.log(`E2E em http://localhost:${port} (manuais em ${workspace})`));

// Fora do Playwright (conferência manual): Ctrl+C ou SIGTERM apagam a pasta. Na rodada do Playwright, o teardown.mjs.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    server.close();
    rm(workspace, { recursive: true, force: true }).finally(() => process.exit(0));
  });
}
