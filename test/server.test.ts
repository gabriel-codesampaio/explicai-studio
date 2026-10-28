import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStudioServer } from "../src/server/server.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

const json = (method: string, body?: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

describe("API do Studio", () => {
  it("cria manual, páginas e devolve a árvore com títulos", async () => {
    const manual = await (await fetch(`${base}/api/manuals`, json("POST", { title: "Financeiro" }))).json();
    expect(manual).toMatchObject({ slug: "financeiro", language: "pt-BR" });

    const pai = await (await fetch(`${base}/api/manuals/financeiro/pages`, json("POST", { title: "Clientes" }))).json();
    await fetch(`${base}/api/manuals/financeiro/pages`, json("POST", { title: "Cadastrar", parentId: pai.id }));

    const tree = await (await fetch(`${base}/api/manuals/financeiro`)).json();
    expect(tree.pages).toMatchObject([{ title: "Clientes", children: [{ title: "Cadastrar", children: [] }] }]);

    const saved = await (await fetch(`${base}/api/manuals/financeiro/pages/${pai.id}`, json("PUT", { body: "Texto **novo**" }))).json();
    expect(saved.body).toBe("Texto **novo**");
  });

  it("recebe imagem e serve de volta", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const png = new Uint8Array([137, 80, 78, 71]);
    const up = await (await fetch(`${base}/api/manuals/m/assets?name=print.png`, { method: "POST", body: png })).json();
    expect(up.path).toBe("assets/print.png");

    const res = await fetch(`${base}/files/m/assets/print.png`);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(png);
  });

  it("responde 404 para manual que não existe e para caminho fora do workspace", async () => {
    expect((await fetch(`${base}/api/manuals/nada`)).status).toBe(404);
    expect((await fetch(`${base}/files/..%2F..%2Fetc/passwd`)).status).toBe(404);
  });

  it("recusa requisição vinda de outro site", async () => {
    const res = await fetch(`${base}/api/manuals`, { headers: { origin: "https://site-malicioso.com" } });
    expect(res.status).toBe(403);
  });
});
