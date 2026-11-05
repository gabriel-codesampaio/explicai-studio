import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-busca-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});
afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

const post = (url: string, body: unknown) =>
  fetch(`${base}${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

it("GET /search acha o termo sem acento, sem lixeira, e vazio sem consulta", async () => {
  await post("/api/manuals", { title: "Fin" });
  await post("/api/manuals/fin/pages", { title: "A", body: "Gerar o boleto aqui" });
  const b = await (await post("/api/manuals/fin/pages", { title: "B", body: "boleto velho" })).json();
  await fetch(`${base}/api/manuals/fin/pages/${b.id}`, { method: "DELETE" });
  const hits = await (await fetch(`${base}/api/manuals/fin/search?q=BOLETO`)).json();
  expect(hits.map((h: { title: string }) => h.title)).toEqual(["A"]);
  expect(await (await fetch(`${base}/api/manuals/fin/search`)).json()).toEqual([]);
});

it("GET /search funciona em manual de formato mais novo e não grava nada", async () => {
  await post("/api/manuals", { title: "Novo" });
  await post("/api/manuals/novo/pages", { title: "A", body: "achei isto" });
  const file = path.join(workspace, "novo", "manual.json");
  await writeFile(file, JSON.stringify({ ...JSON.parse(await readFile(file, "utf8")), version: 99 }));
  const before = await readFile(file, "utf8");
  expect((await (await fetch(`${base}/api/manuals/novo/search?q=achei`)).json()).length).toBe(1);
  expect(await readFile(file, "utf8")).toBe(before);
});

it("GET /search em manual inexistente dá 404 sem caminho absoluto", async () => {
  const res = await fetch(`${base}/api/manuals/nada/search?q=ab`);
  expect(res.status).toBe(404);
  expect(JSON.stringify(await res.json())).not.toContain(workspace);
});
