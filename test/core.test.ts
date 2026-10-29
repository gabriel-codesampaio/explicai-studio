import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  createManual,
  flatten,
  listManuals,
  movePage,
  readAnnotations,
  readManual,
  readPage,
  removePage,
  saveAsset,
  slugify,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("slugify", () => {
  it("tira acentos e símbolos", () => {
    expect(slugify("Cadastro de Clientes — Visão Geral!")).toBe("cadastro-de-clientes-visao-geral");
  });
  it("tem um valor padrão quando não sobra nada", () => {
    expect(slugify("???")).toBe("sem-titulo");
  });
});

describe("manual", () => {
  it("cria, lista e não sobrescreve um manual com o mesmo título", async () => {
    const a = await createManual(workspace, { title: "Financeiro", language: "pt-BR" });
    const b = await createManual(workspace, { title: "Financeiro", language: "pt-BR" });
    expect(path.basename(a.dir)).toBe("financeiro");
    expect(path.basename(b.dir)).toBe("financeiro-2");
    expect((await listManuals(workspace)).map((m) => m.meta.title)).toEqual(["Financeiro", "Financeiro"]);
  });

  it("rejeita título vazio", async () => {
    await expect(createManual(workspace, { title: "  ", language: "pt-BR" })).rejects.toThrow(/vazio/);
  });
});

describe("páginas", () => {
  it("grava Markdown com frontmatter e lê de volta sem perda", async () => {
    const { dir } = await createManual(workspace, { title: "Financeiro", language: "pt-BR" });
    const body = "# Clientes\n\n1. Clique em **Novo cliente**.\n2. Preencha o CPF.\n";
    const page = await addPage(dir, { title: "Cadastrar cliente", body });

    expect(page.file).toBe("pages/cadastrar-cliente.md");
    const raw = await readFile(path.join(dir, page.file), "utf8");
    expect(raw).toContain(`id: ${page.id}`);
    expect(raw).toContain("title: Cadastrar cliente");
    expect(await readPage(dir, page.id)).toEqual(page);
  });

  it("renomeia o arquivo quando o título muda e mantém o id", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Nova página" });
    const updated = await updatePage(dir, page.id, { title: "Cadastrar cliente", body: "texto" });

    expect(updated.file).toBe("pages/cadastrar-cliente.md");
    expect(await readPage(dir, page.id)).toMatchObject({ title: "Cadastrar cliente", body: "texto", file: updated.file });
    await expect(readFile(path.join(dir, page.file), "utf8")).rejects.toThrow();
  });

  it("atualiza os links das outras páginas quando um arquivo é renomeado", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const alvo = await addPage(dir, { title: "Clientes" });
    const outra = await addPage(dir, {
      title: "Índice",
      body: "Veja [clientes](./clientes.md), a [seção](clientes.md#cadastro) e [outra](./clientes-antigos.md).",
    });

    await updatePage(dir, alvo.id, { title: "Cadastro de clientes" });
    expect((await readPage(dir, outra.id)).body).toBe(
      "Veja [clientes](./cadastro-de-clientes.md), a [seção](./cadastro-de-clientes.md#cadastro) e [outra](./clientes-antigos.md).",
    );
  });

  it("não renomeia quando o título muda só em maiúsculas ou acentos", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Visao geral" });
    expect((await updatePage(dir, page.id, { title: "Visão Geral" })).file).toBe(page.file);
  });

  it("monta a árvore, move e remove com as subpáginas", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    const a1 = await addPage(dir, { title: "A1", parentId: a.id });

    const order = async () => flatten((await readManual(dir)).pages).map((n) => n.id);
    expect(await order()).toEqual([a.id, a1.id, b.id]);

    await movePage(dir, b.id, { parentId: null, index: 0 });
    expect(await order()).toEqual([b.id, a.id, a1.id]);

    await expect(movePage(dir, a.id, { parentId: a1.id, index: 0 })).rejects.toThrow(/dentro dela mesma/);

    await removePage(dir, a.id);
    expect(await order()).toEqual([b.id]);
    await expect(readFile(path.join(dir, a1.file), "utf8")).rejects.toThrow();
  });
});

describe("imagens e anotações", () => {
  const valid = {
    version: 1,
    markers: [{ id: "m1", n: 1, x: 0.8, y: 0.1, label: "Novo cliente" }],
    highlights: [{ id: "h1", x: 0.1, y: 0.2, w: 0.5, h: 0.1 }],
    arrows: [{ id: "a1", from: { x: 0.1, y: 0.1 }, to: { x: 0.2, y: 0.2 } }],
    hotspots: [{ id: "s1", x: 0.7, y: 0.05, w: 0.2, h: 0.1, target: { type: "url", href: "https://example.com" } }],
  };

  it("salva a imagem e as anotações ao lado dela", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const asset = await saveAsset(dir, "Tela Clientes.PNG", new Uint8Array([1, 2, 3]));
    expect(asset).toBe("assets/tela-clientes.png");

    expect(await readAnnotations(dir, asset)).toMatchObject({ markers: [], hotspots: [] });
    await writeAnnotations(dir, asset, valid);
    expect(await readAnnotations(dir, asset)).toEqual(valid);
    expect(await readFile(path.join(dir, `${asset}.json`), "utf8")).toContain('"n": 1');
  });

  it("recusa caminho fora do manual", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    await expect(readAnnotations(dir, "../../segredo.png")).rejects.toThrow(/fora do manual/);
    await expect(writeAnnotations(dir, "pages/x.png", valid)).rejects.toThrow(/assets/);
  });

  it("recusa anotação inválida", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const asset = await saveAsset(dir, "a.png", new Uint8Array([1]));
    const withTarget = (href: string) => ({ ...valid, hotspots: [{ ...valid.hotspots[0], target: { type: "url", href } }] });

    await expect(writeAnnotations(dir, asset, withTarget("javascript:alert(1)"))).rejects.toThrow(/http/);
    await expect(writeAnnotations(dir, asset, { ...valid, markers: [{ ...valid.markers[0], x: 1.5 }] })).rejects.toThrow(/entre 0 e 1/);
    await expect(
      writeAnnotations(dir, asset, { ...valid, highlights: [{ id: "m1", x: 0, y: 0, w: 0.1, h: 0.1 }] }),
    ).rejects.toThrow(/repetido/);
    await expect(writeAnnotations(dir, asset, { ...valid, hotspots: [{ ...valid.hotspots[0], x: 0.9 }] })).rejects.toThrow(/borda/);
  });

  it("recusa formato de imagem desconhecido", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    await expect(saveAsset(dir, "virus.exe", new Uint8Array([1]))).rejects.toThrow(/não suportado/);
  });
});
