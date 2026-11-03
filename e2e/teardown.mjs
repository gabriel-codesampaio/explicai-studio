import { rm } from "node:fs/promises";
import { e2eWorkspace } from "./workspace.mjs";

// O Playwright derruba o servidor à força (sem sinal no Windows): quem apaga a pasta é este teardown.
export default async function teardown() {
  await rm(e2eWorkspace(process.env.E2E_PORT ?? 4400), { recursive: true, force: true });
}
