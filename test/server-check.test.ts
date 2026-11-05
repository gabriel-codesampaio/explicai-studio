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
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-check-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});
afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

const post = (body: unknown) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

it("GET /check devolve os achados com o id da página certa", async () => {
  await fetch(`${base}/api/manuals`, post({ title: "Chk" }));
  const bad = await (
    await fetch(`${base}/api/manuals/chk/pages`, post({ title: "Ruim", body: "1. Clique.\n\nA confirmar." }))
  ).json();
  await fetch(`${base}/api/manuals/chk/pages`, post({ title: "Boa", body: "Só texto." }));
  const res = await fetch(`${base}/api/manuals/chk/check`);
  expect(res.status).toBe(200);
  const found = ((await res.json()) as { pageId: string; title: string; kind: string }[]).filter(
    (f) => f.kind !== "not-reviewed",
  );
  expect(found.map((f) => f.kind).sort()).toEqual(["no-image", "step-without-result", "to-confirm"]);
  expect(found.every((f) => f.pageId === bad.id && f.title === "Ruim")).toBe(true);
});

it("manual sem problema devolve lista vazia", async () => {
  await fetch(`${base}/api/manuals`, post({ title: "Ok" }));
  await fetch(`${base}/api/manuals/ok/pages`, post({ title: "P", body: "Texto." }));
  const found = (await (await fetch(`${base}/api/manuals/ok/check`)).json()) as { kind: string }[];
  expect(found.filter((f) => f.kind !== "not-reviewed")).toEqual([]);
});

// Formato mais novo: a checagem é só leitura, então lista os achados e não grava nada.
it("manual de formato mais novo lista os achados e não grava nada", async () => {
  await fetch(`${base}/api/manuals`, post({ title: "Fin" }));
  await fetch(`${base}/api/manuals/fin/pages`, post({ title: "P", body: "A confirmar." }));
  const file = path.join(workspace, "fin", "manual.json");
  await writeFile(file, JSON.stringify({ ...JSON.parse(await readFile(file, "utf8")), version: 2 }));
  const before = await readFile(file, "utf8");
  const res = await fetch(`${base}/api/manuals/fin/check`);
  expect(res.status).toBe(200);
  expect(((await res.json()) as { kind: string }[]).filter((f) => f.kind !== "not-reviewed")).toMatchObject([
    { kind: "to-confirm" },
  ]);
  expect(await readFile(file, "utf8")).toBe(before);
});

it("manual inexistente dá 404 sem caminho absoluto", async () => {
  const res = await fetch(`${base}/api/manuals/nada/check`);
  expect(res.status).toBe(404);
  expect(JSON.stringify(await res.json())).not.toContain(workspace);
});
