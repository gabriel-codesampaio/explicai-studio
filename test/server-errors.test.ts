import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { publicMessage, statusOf } from "../src/server/http.js";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-err-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
  await fetch(`${base}/api/manuals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "M" }),
  });
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

it("arquivo que não existe em /files/ dá 404 sem o caminho do disco", async () => {
  const res = await fetch(`${base}/files/m/assets/nao-existe.png`);
  const text = await res.text();
  expect(res.status).toBe(404);
  expect(text).not.toContain(workspace);
  expect(text).not.toMatch(/ENOENT/);
});

it("diretório em /files/ dá 404", async () => {
  const res = await fetch(`${base}/files/m/pages`);
  expect(res.status).toBe(404);
  expect(await res.text()).not.toContain(workspace);
});

it("EISDIR vira 404, e EACCES vira frase fixa sem o caminho", () => {
  const eisdir = Object.assign(new Error("EISDIR: illegal operation on a directory, read 'C:a'"), { code: "EISDIR" });
  const eacces = Object.assign(new Error("EACCES: permission denied, open 'C:a'"), { code: "EACCES" });
  expect(statusOf(eisdir)).toBe(404);
  expect(publicMessage(eisdir)).not.toContain("C:");
  expect(publicMessage(eacces)).toBe("Sem permissão para acessar o arquivo.");
  expect(publicMessage(new Error("Outro erro"))).toBe("Outro erro");
});
