import { mkdtemp, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

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

    const saved = await (
      await fetch(`${base}/api/manuals/financeiro/pages/${pai.id}`, json("PUT", { body: "Texto **novo**" }))
    ).json();
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

  it("exclui para a lixeira, lista e restaura", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const page = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "Clientes" }))).json();

    const { trashId } = await (await fetch(`${base}/api/manuals/m/pages/${page.id}`, { method: "DELETE" })).json();
    const trash = await (await fetch(`${base}/api/manuals/m/trash`)).json();
    expect(trash).toMatchObject([{ trashId, pageId: page.id, title: "Clientes", pages: 1 }]);
    expect((await fetch(`${base}/api/manuals/m/pages/${page.id}`)).status).toBe(404);

    expect((await fetch(`${base}/api/manuals/m/trash/${trashId}/restore`, { method: "POST" })).status).toBe(200);
    expect((await (await fetch(`${base}/api/manuals/m/pages/${page.id}`)).json()).title).toBe("Clientes");
  });

  it("grava e lê marcações, e recusa marcação inválida ou fora de assets/", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    await fetch(`${base}/api/manuals/m/assets?name=tela.png`, { method: "POST", body: new Uint8Array([1]) });
    const url = `${base}/api/manuals/m/annotations?asset=assets/tela.png`;
    const ann = {
      version: 1,
      markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5, label: "Botão" }],
      highlights: [],
      arrows: [],
      hotspots: [],
    };

    expect((await fetch(url, json("PUT", ann))).status).toBe(200);
    expect(await (await fetch(url)).json()).toEqual(ann);

    const fora = { ...ann, markers: [{ ...ann.markers[0], x: 2 }] };
    expect((await fetch(url, json("PUT", fora))).status).toBe(400);
    expect((await fetch(`${base}/api/manuals/m/annotations?asset=../../segredo.png`)).status).toBe(400);
  });

  it("move página e recusa mover para dentro dela mesma", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const a = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "A" }))).json();
    const b = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "B", parentId: a.id }))).json();

    const ruim = await fetch(`${base}/api/manuals/m/pages/${a.id}/move`, json("POST", { parentId: b.id, index: 0 }));
    expect(ruim.status).toBe(400);
    expect((await ruim.json()).error).toMatch(/dentro dela mesma/);

    await fetch(`${base}/api/manuals/m/pages/${b.id}/move`, json("POST", { parentId: null, index: 0 }));
    const tree = await (await fetch(`${base}/api/manuals/m`)).json();
    expect(tree.pages.map((p: { title: string }) => p.title)).toEqual(["B", "A"]);
  });

  it("renomeia a página pela API e atualiza os links das outras", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const alvo = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "Clientes" }))).json();
    const outra = await (
      await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "Índice", body: "Veja [aqui](./clientes.md)." }))
    ).json();

    await fetch(`${base}/api/manuals/m/pages/${alvo.id}`, json("PUT", { title: "Cadastro" }));
    expect((await (await fetch(`${base}/api/manuals/m/pages/${outra.id}`)).json()).body).toBe("Veja [aqui](./cadastro.md).");
  });

  it("responde com mensagem clara para JSON inválido, corpo errado e rota que não existe", async () => {
    const quebrado = await fetch(`${base}/api/manuals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    expect(quebrado.status).toBe(400);
    expect((await quebrado.json()).error).toMatch(/JSON válido/);

    expect((await fetch(`${base}/api/manuals`, json("POST", [1, 2]))).status).toBe(400);
    expect((await fetch(`${base}/api/manuals`, json("POST", { title: "" }))).status).toBe(400);
    const nada = await fetch(`${base}/api/nada`);
    expect(nada.status).toBe(404);
    expect(nada.headers.get("content-type")).toMatch(/json/);
    expect((await fetch(`${base}/api/manuals`, { method: "PATCH" })).status).toBe(405);
  });

  it("recusa imagem acima de 20 MB e formato que não é imagem", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const grande = await fetch(`${base}/api/manuals/m/assets?name=g.png`, {
      method: "POST",
      body: new Uint8Array(21 * 1024 * 1024),
    });
    expect(grande.status).toBe(413);
    const exe = await fetch(`${base}/api/manuals/m/assets?name=virus.exe`, { method: "POST", body: new Uint8Array([1]) });
    expect(exe.status).toBe(400);
  });
});

describe("arquivos do editor", () => {
  it("serve o index.html em rotas do editor, mas nunca em chamada de API errada", async () => {
    const webDir = await mkdtemp(path.join(tmpdir(), "explicai-web-"));
    await writeFile(path.join(webDir, "index.html"), "<!doctype html><title>Studio</title>");
    const server = createStudioServer({ workspace, webDir });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://localhost:${(server.address() as AddressInfo).port}`;
    try {
      const page = await fetch(`${url}/qualquer/rota`);
      expect(page.headers.get("cache-control")).toBe("no-cache");
      expect(await page.text()).toContain("<title>Studio</title>");
      const api = await fetch(`${url}/api/nao-existe`);
      expect(api.status).toBe(404);
      expect(api.headers.get("content-type")).toMatch(/json/);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await rm(webDir, { recursive: true, force: true });
    }
  });
});

describe("API de versões", () => {
  it("guarda, lista, escolhe para o manual e restaura", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const page = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "P", body: "um" }))).json();
    const url = `${base}/api/manuals/m/pages/${page.id}`;

    const saved = await fetch(`${url}/versions`, json("POST", { note: "Primeira" }));
    expect(saved.status).toBe(201);
    const v1 = await saved.json();
    await fetch(url, json("PUT", { body: "dois" }));

    expect(await (await fetch(`${url}/versions`)).json()).toMatchObject([{ id: v1.id, note: "Primeira" }]);
    expect(await (await fetch(`${url}/versions/${v1.id}`)).json()).toMatchObject({ body: "um" });

    expect((await fetch(`${url}/published`, json("PUT", { versionId: v1.id }))).status).toBe(200);
    expect((await fetch(`${url}/published`, json("PUT", {}))).status).toBe(400);
    expect((await fetch(`${url}/published`, json("PUT", { versionId: "nao-existe" }))).status).toBe(404);

    const restored = await (await fetch(`${url}/versions/${v1.id}/restore`, json("POST"))).json();
    expect(restored.body).toBe("um");
  });
});

describe("API de exportação", () => {
  it("exporta em HTML e Markdown, recusa formato desconhecido e grava a cor do manual", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "P", body: "Texto." }));

    const html = await (await fetch(`${base}/api/manuals/m/export`, json("POST", { format: "html" }))).json();
    expect(html).toMatchObject({
      format: "html",
      file: "exportacao/html/index.html",
      url: "/files/m/exportacao/html/index.html",
    });
    const page = await fetch(`${base}${html.url}`);
    expect(page.headers.get("content-type")).toContain("text/html");
    expect(await page.text()).toContain("Texto.");

    const md = await (await fetch(`${base}/api/manuals/m/export`, json("POST", { format: "markdown" }))).json();
    expect(md.file).toBe("exportacao/markdown/manual.md");
    expect((await fetch(`${base}/api/manuals/m/export`, json("POST", { format: "docx" }))).status).toBe(400);

    expect((await fetch(`${base}/api/manuals/m/theme`, json("PUT", { accent: "#7a3fc4" }))).status).toBe(200);
    expect((await (await fetch(`${base}/api/manuals/m`)).json()).theme).toEqual({ accent: "#7a3fc4" });
    expect((await fetch(`${base}/api/manuals/m/theme`, json("PUT", { accent: "roxo" }))).status).toBe(400);
    const low = await fetch(`${base}/api/manuals/m/theme`, json("PUT", { accent: "#ffd43b" }));
    expect(await low.json()).toMatchObject({ code: "low-contrast", params: { label: "destaque", min: 4.5 } });
    await fetch(`${base}/api/manuals/m/theme`, json("PUT", { accent: null }));
    expect((await (await fetch(`${base}/api/manuals/m`)).json()).theme).toEqual({});
  });
});

describe("API do fluxo de aprovação", () => {
  it("muda o status pela página e recusa status desconhecido", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const page = await (await fetch(`${base}/api/manuals/m/pages`, json("POST", { title: "P" }))).json();
    const url = `${base}/api/manuals/m/pages/${page.id}`;
    expect((await (await fetch(url, json("PUT", { status: "aprovado" }))).json()).status).toBe("aprovado");
    expect((await (await fetch(`${base}/api/manuals/m`)).json()).pages[0].status).toBe("aprovado");
    expect((await fetch(url, json("PUT", { status: "pronto" }))).status).toBe(400);
  });
});

describe("API de imagens sem uso", () => {
  it("conta e move para a lixeira as imagens que nenhuma página usa", async () => {
    await fetch(`${base}/api/manuals`, json("POST", { title: "M" }));
    const png = new Uint8Array([137, 80, 78, 71]);
    await fetch(`${base}/api/manuals/m/assets?name=sobra.png`, { method: "POST", body: png });
    expect(await (await fetch(`${base}/api/manuals/m/assets/unused`)).json()).toEqual({ count: 1 });
    const cleaned = await (await fetch(`${base}/api/manuals/m/assets/clean`, json("POST"))).json();
    expect(cleaned.moved).toBe(1);
    expect(await (await fetch(`${base}/api/manuals/m/assets/unused`)).json()).toEqual({ count: 0 });
  });
});

describe("API de fontes", () => {
  it("lista as fontes do manual e serve só os arquivos da lista", async () => {
    const list = await (await fetch(`${base}/api/fonts`)).json();
    expect(list.map((f: { id: string }) => f.id)).toContain("lora");
    const ok = await fetch(`${base}/api/fonts/lora-latin-wght-normal.woff2`);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("font/woff2");
    expect((await fetch(`${base}/api/fonts/OFL-lora.txt`)).status).toBe(404);
    expect((await fetch(`${base}/api/fonts/..%2Fpackage.json`)).status).toBe(404);
  });
});
