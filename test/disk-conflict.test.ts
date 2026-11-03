import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;
let url: string;
let file: string;

const put = (body: unknown, ifMatch?: string) =>
  fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/json", ...(ifMatch === undefined ? {} : { "if-match": ifMatch }) },
    body: JSON.stringify(body),
  });

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-conflito-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
  await fetch(`${base}/api/manuals`, { method: "POST", headers: { "content-type": "application/json" }, body: '{"title":"M"}' });
  const page = await (
    await fetch(`${base}/api/manuals/m/pages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"title":"Pagina"}',
    })
  ).json();
  url = `${base}/api/manuals/m/pages/${page.id}`;
  file = path.join(workspace, "m", page.file);
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

describe("conflito com o disco", () => {
  it("GET devolve a versão e o PUT com a versão atual grava e devolve a nova", async () => {
    const { version } = await (await fetch(url)).json();
    expect(version).toMatch(/^[\d.]+-\d+$/);
    const res = await put({ body: "um" }, version);
    expect(res.status).toBe(200);
    const saved = await res.json();
    expect(saved.version).not.toBe(version);
    expect((await put({ body: "dois" }, saved.version)).status).toBe(200);
  });

  it("responde 409 com código estável e não sobrescreve a edição feita fora", async () => {
    const { version } = await (await fetch(url)).json();
    const original = await readFile(file, "utf8");
    await writeFile(file, `${original}\nEditado por fora, com bastante texto a mais.\n`);

    const res = await put({ body: "do Studio" }, version);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "disk-conflict" });
    expect(await readFile(file, "utf8")).toContain("Editado por fora");
  });

  it("409 também vale para título e status (mesma rota)", async () => {
    const { version } = await (await fetch(url)).json();
    await writeFile(file, `${await readFile(file, "utf8")}\nfora fora fora\n`);
    expect((await put({ status: "revisao" }, version)).status).toBe(409);
    expect((await put({ title: "Outro", fileName: "sync" }, version)).status).toBe(409);
  });

  it("sem If-Match segue gravando como antes", async () => {
    await writeFile(file, `${await readFile(file, "utf8")}\nfora fora fora\n`);
    expect((await put({ body: "do MCP" })).status).toBe(200);
  });
});
