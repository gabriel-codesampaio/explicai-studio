import { mkdtemp, readFile, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

/** Regressão do T-046: corpo que não é UTF-8 volta 400 e não grava U+FFFD em nenhuma rota. */
let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-utf8-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

const send = (method: string, url: string, body: Uint8Array | string) =>
  fetch(`${base}${url}`, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : (body as BodyInit),
  });

const latin1 = (json: string) => Buffer.from(json, "latin1");
const utf8 = (json: string) => Buffer.from(json, "utf8");

async function seed() {
  await send("POST", "/api/manuals", utf8('{"title":"M"}'));
  return (await (await send("POST", "/api/manuals/m/pages", utf8('{"title":"Início","body":"Olá"}'))).json()) as {
    id: string;
    file: string;
  };
}

describe("corpo da requisição não UTF-8", () => {
  it("POST de página em Latin-1: 400 e nenhuma página criada", async () => {
    await send("POST", "/api/manuals", utf8('{"title":"M"}'));
    const res = await send("POST", "/api/manuals/m/pages", latin1('{"title":"In\xedcio"}'));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid-utf8");
    const tree = await (await fetch(`${base}/api/manuals/m`)).json();
    expect(tree.pages).toEqual([]);
  });

  it("PUT de página em Latin-1: 400 e o arquivo continua como estava", async () => {
    const page = await seed();
    const file = path.join(workspace, "m", page.file);
    const before = await readFile(file);
    for (const body of ['{"body":"a\xe7\xe3o"}', '{"title":"Se\xe7\xe3o"}']) {
      const res = await send("PUT", `/api/manuals/m/pages/${page.id}`, latin1(body));
      expect(res.status, body).toBe(400);
    }
    expect(await readFile(file)).toEqual(before);
    expect(before.includes(Buffer.from([0xef, 0xbf, 0xbd]))).toBe(false);
  });

  it("recusa sequências inválidas: byte solto, corte no meio, forma longa demais e substituto sozinho", async () => {
    await send("POST", "/api/manuals", utf8('{"title":"M"}'));
    const inv = [
      Buffer.from([0x7b, 0x22, 0x74, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d]), // 0xFF nunca existe em UTF-8
      Buffer.from([0x7b, 0x22, 0x74, 0x22, 0x3a, 0x22, 0xc3, 0x22, 0x7d]), // 0xC3 sem o segundo byte
      Buffer.from([0x7b, 0x22, 0x74, 0x22, 0x3a, 0x22, 0xc0, 0xaf, 0x22, 0x7d]), // "/" em forma longa demais
      Buffer.from([0x7b, 0x22, 0x74, 0x22, 0x3a, 0x22, 0xed, 0xa0, 0x80, 0x22, 0x7d]), // U+D800 sozinho
    ];
    for (const body of inv) {
      const res = await send("POST", "/api/manuals", body);
      expect(res.status, body.toString("hex")).toBe(400);
      expect((await res.json()).code).toBe("invalid-utf8");
    }
    expect(await (await fetch(`${base}/api/manuals`)).json()).toHaveLength(1); // só o seed
  });

  it("aceita UTF-8 válido com acento, emoji e BOM no começo", async () => {
    const res = await send("POST", "/api/manuals", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), utf8('{"title":"Ação 🚀"}')]));
    expect(res.status).toBe(201);
    expect((await res.json()).title).toBe("Ação 🚀");
    expect(await readFile(path.join(workspace, "acao", "manual.json"), "utf8")).toContain("Ação 🚀");
  });

  it("anotações e tema também recusam Latin-1", async () => {
    await seed();
    await fetch(`${base}/api/manuals/m/assets?name=a.png`, { method: "POST", body: new Uint8Array([137, 80, 78, 71]) });
    const notes = await send(
      "PUT",
      "/api/manuals/m/annotations?asset=assets/a.png",
      latin1('{"version":1,"markers":[{"id":"m1","n":1,"x":0.5,"y":0.5,"label":"Bot\xe3o"}]}'),
    );
    expect(notes.status).toBe(400);
    expect((await notes.json()).code).toBe("invalid-utf8");
    expect((await send("PUT", "/api/manuals/m/theme", latin1('{"accent":"#2b4fe0","x":"\xe7"}'))).status).toBe(400);
  });

  it("o texto digitado no editor chega inteiro ao disco, com ida e volta pela API", async () => {
    const page = await seed();
    const body = "Cadastro ✓\r\n\r\n- ação 🚀\r\n";
    await send("PUT", `/api/manuals/m/pages/${page.id}`, utf8(JSON.stringify({ title: "Revisão 日本語", body })));
    const back = await (await fetch(`${base}/api/manuals/m/pages/${page.id}`)).json();
    expect(back).toMatchObject({ title: "Revisão 日本語", body });
  });
});
