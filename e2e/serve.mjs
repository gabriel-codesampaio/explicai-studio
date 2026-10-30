// Sobe o Studio já compilado (dist/) numa pasta de manuais nova e vazia, só para os testes E2E.
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudioServer } from "../dist/server/index.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = await mkdtemp(path.join(tmpdir(), "explicai-e2e-"));
const server = createStudioServer({ workspace, webDir: path.join(root, "..", "dist", "web") });
const port = Number(process.env.E2E_PORT ?? 4400);
server.listen(port, "127.0.0.1", () => console.log(`E2E em http://localhost:${port} (manuais em ${workspace})`));
