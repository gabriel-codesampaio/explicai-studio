import { tmpdir } from "node:os";
import path from "node:path";

/** Pasta de manuais do e2e: fixa por porta, para o teardown do Playwright saber qual apagar. */
export const e2eWorkspace = (port) => path.join(tmpdir(), `explicai-e2e-${port}`);
