import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TEXT_COLORS } from "../src/core/export/textColors.js";
import { splitFrontmatter } from "../src/core/frontmatter.js";
import {
  addPage,
  createManual,
  exportManual,
  FONTS,
  listVersions,
  PAGE_STATUSES,
  parseAnnotations,
  publishVersion,
  readManual,
  removePage,
  saveAsset,
  saveVersion,
  setManualTheme,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

/**
 * Contrato: o que docs/manual-format.md promete tem de ser o que o código grava e aceita.
 * Os exemplos são lidos do próprio documento, então mudar um sem o outro quebra aqui.
 */
const DOC = await readFile(new URL("../docs/manual-format.md", import.meta.url), "utf8");

/** Blocos de código da seção `## <heading>` (ou `### <heading>`), na ordem. */
function blocks(heading: string, lang: string): string[] {
  const start = DOC.search(new RegExp(`^#{2,3} ${heading}\\s*$`, "m"));
  expect(start, `seção ${heading}`).toBeGreaterThanOrEqual(0);
  const rest = DOC.slice(DOC.indexOf("\n", start));
  const end = rest.search(/^#{2,3} /m);
  const section = end < 0 ? rest : rest.slice(0, end);
  return [...section.matchAll(new RegExp(`\`\`\`${lang}\\n([\\s\\S]*?)\`\`\``, "g"))].map((m) => m[1] ?? "");
}

/** O exemplo do documento usa reticências nos ids (`3f2c…`); troca por um id de verdade para ler. */
const concrete = (s: string) => s.replace(/"([0-9a-f]{4})…"/g, '"$1-0000"');

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-contract-"));
  dir = (await createManual(workspace, { title: "Financeiro", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const exists = (p: string) =>
  stat(p).then(
    () => true,
    () => false,
  );

describe("manual.json", () => {
  it("o exemplo do documento tem os mesmos campos que o código grava", async () => {
    const example = JSON.parse(concrete(blocks("manual.json", "json")[0] ?? "")) as Record<string, unknown>;
    const pai = await addPage(dir, { title: "Visão geral" });
    const filha = await addPage(dir, { title: "Cadastrar cliente", parentId: pai.id });
    await saveVersion(dir, filha.id, "v");
    const versionId = (await listVersions(dir, filha.id))[0]?.id ?? "";
    await publishVersion(dir, filha.id, versionId);

    const actual = JSON.parse(await readFile(path.join(dir, "manual.json"), "utf8")) as Record<string, unknown>;
    expect(Object.keys(actual).sort()).toEqual(Object.keys(example).sort());
    expect(actual.version).toBe(1);
    expect(example.version).toBe(1);

    type Node = { id: string; file: string; published?: string; children: Node[] };
    const exNode = (example.pages as Node[])[0] as Node;
    const acNode = (actual.pages as Node[])[0] as Node;
    expect(Object.keys(acNode).sort()).toEqual(Object.keys(exNode).sort());
    // O filho do exemplo tem `published`; o do código também, depois de publicar a versão.
    const exChild = exNode.children[0] as Node;
    const acChild = acNode.children[0] as Node;
    expect(Object.keys(acChild).sort()).toEqual(Object.keys(exChild).sort());
    expect(acChild.published).toBe(versionId);
    expect(exChild.published).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
    expect(acChild.published).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
    expect(acNode.file).toMatch(/^pages\/[^/]+\.md$/);
  });

  it("o exemplo do documento é um manual.json que o Studio abre", async () => {
    const { dir: other } = await createManual(workspace, { title: "Outro", language: "pt-BR" });
    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(other, "manual.json"), concrete(blocks("manual.json", "json")[0] ?? ""));
    const meta = await readManual(other);
    expect(meta.title).toBe("Financeiro");
    expect(meta.pages[0]?.children[0]?.file).toBe("pages/cadastrar-cliente.md");
  });

  it("a ordem do array é a ordem das páginas", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    const c = await addPage(dir, { title: "C", index: 0 });
    expect((await readManual(dir)).pages.map((n) => n.id)).toEqual([c.id, a.id, b.id]);
  });

  it("o título da página fica só no frontmatter, não no manual.json", async () => {
    await addPage(dir, { title: "Título secreto" });
    expect(await readFile(path.join(dir, "manual.json"), "utf8")).not.toContain("Título secreto");
  });
});

describe("página", () => {
  it("o exemplo do documento é uma página válida", () => {
    const example = blocks("Página", "markdown")[0] ?? "";
    const { data, body } = splitFrontmatter(concrete(example).replace(/^id: (\w+)…/m, "id: $1-0000"));
    expect(Object.keys(data).sort()).toEqual(["id", "title"]);
    expect(data.title).toBe("Cadastrar cliente");
    expect(body).toContain("![Tela de clientes](../assets/tela-clientes.png)");
  });

  it("grava id e título no frontmatter, e status só quando não é rascunho", async () => {
    const page = await addPage(dir, { title: "Cadastrar cliente", body: "texto" });
    let raw = await readFile(path.join(dir, page.file), "utf8");
    expect(raw).toBe(`---\nid: ${page.id}\ntitle: Cadastrar cliente\n---\n\ntexto`);

    await updatePage(dir, page.id, { status: "aprovado" });
    raw = await readFile(path.join(dir, page.file), "utf8");
    expect(splitFrontmatter(raw).data).toEqual({ id: page.id, title: "Cadastrar cliente", status: "aprovado" });

    await updatePage(dir, page.id, { status: "rascunho" });
    expect(splitFrontmatter(await readFile(path.join(dir, page.file), "utf8")).data).not.toHaveProperty("status");
  });

  it("os status do documento são os do código", () => {
    const section = DOC.slice(DOC.indexOf("O frontmatter pode ter `status`"));
    const documented = [...(section.split("\n")[0] ?? "").matchAll(/`(\w+)`/g)].map((m) => m[1]).filter((s) => s !== "status");
    expect([...documented].sort()).toEqual([...PAGE_STATUSES].filter((s) => s !== "rascunho").sort());
  });

  it("o arquivo acompanha o título e o id não muda", async () => {
    const page = await addPage(dir, { title: "Cadastrar cliente" });
    expect(page.file).toBe("pages/cadastrar-cliente.md");
    const renamed = await updatePage(dir, page.id, { title: "Novo cliente" });
    expect(renamed.file).toBe("pages/novo-cliente.md");
    expect(splitFrontmatter(await readFile(path.join(dir, renamed.file), "utf8")).data.id).toBe(page.id);
    expect(await exists(path.join(dir, page.file))).toBe(false);
  });

  it("link para outra página é ./arquivo.md e acompanha a renomeação", async () => {
    const alvo = await addPage(dir, { title: "Cadastro" });
    const origem = await addPage(dir, { title: "Origem", body: "[Cadastro](./cadastro.md) e [seção](./cadastro.md#campos)" });
    await updatePage(dir, alvo.id, { title: "Cadastro de clientes" });
    const raw = await readFile(path.join(dir, origem.file), "utf8");
    expect(raw).toContain("[Cadastro](./cadastro-de-clientes.md)");
    expect(raw).toContain("[seção](./cadastro-de-clientes.md#campos)");
  });
});

describe("pastas", () => {
  it("cria pages/ e assets/ e usa as pastas do documento para o resto", async () => {
    expect((await readdir(dir)).sort()).toEqual(["assets", "manual.json", "pages"]);
    const page = await addPage(dir, { title: "P" });
    await saveVersion(dir, page.id, "");
    await removePage(dir, (await addPage(dir, { title: "Q" })).id);
    await exportManual(dir, "html");
    await exportManual(dir, "markdown");
    expect((await readdir(dir)).sort()).toEqual([".lixeira", ".versoes", "assets", "exportacao", "manual.json", "pages"]);
    expect((await readdir(path.join(dir, "exportacao"))).sort()).toEqual(["html", "markdown"]);
    expect(await exists(path.join(dir, "exportacao/html/index.html"))).toBe(true);
    expect(await exists(path.join(dir, "exportacao/markdown/manual.md"))).toBe(true);
    expect(await exists(path.join(dir, "exportacao/html/fonts"))).toBe(true);
  });

  it("versões: .versoes/<id da página>/<data>.md com savedAt e note no frontmatter", async () => {
    const page = await addPage(dir, { title: "Cadastrar cliente", body: "Texto naquele momento." });
    const v = await saveVersion(dir, page.id, "Revisado pelo suporte");
    const file = path.join(dir, ".versoes", page.id, `${v.id}.md`);
    const { data, body } = splitFrontmatter(await readFile(file, "utf8"));
    expect(Object.keys(data).sort()).toEqual(["id", "note", "savedAt", "title"]);
    expect(data).toMatchObject({ id: page.id, title: "Cadastrar cliente", note: "Revisado pelo suporte" });
    expect(new Date(String(data.savedAt)).toISOString()).toBe(data.savedAt);
    expect(body).toBe("Texto naquele momento.");
  });

  it("lixeira: .lixeira/<id>/pages/ com entry.json que guarda a posição", async () => {
    const pai = await addPage(dir, { title: "Pai" });
    await addPage(dir, { title: "Filha", parentId: pai.id });
    await removePage(dir, pai.id);
    const [trashId] = await readdir(path.join(dir, ".lixeira"));
    expect((await readdir(path.join(dir, ".lixeira", trashId ?? "", "pages"))).sort()).toEqual(["filha.md", "pai.md"]);
    const entry = JSON.parse(await readFile(path.join(dir, ".lixeira", trashId ?? "", "entry.json"), "utf8"));
    expect(entry).toMatchObject({ parentId: null, index: 0, node: { id: pai.id, file: "pages/pai.md" } });
  });

  it("exportação em PDF fica em exportacao/<titulo>.pdf (nome calculado como no documento)", async () => {
    expect(DOC).toContain("`exportacao/<titulo>.pdf`");
    const { slugify } = await import("../src/core/index.js");
    expect(slugify("Financeiro Pro")).toBe("financeiro-pro");
  });
});

describe("theme", () => {
  it("o exemplo do documento é aceito, e o manual.json guarda exatamente o que ele diz", async () => {
    const theme = JSON.parse(`{${blocks("theme", "json")[0]}}`).theme as Record<string, unknown>;
    await setManualTheme(dir, theme);
    expect((await readManual(dir)).theme).toEqual(theme);
  });

  it("as fontes do documento são as do código, com a coluna Texto certa", () => {
    const rows = [...DOC.matchAll(/^\| `([a-z0-9-]+)`[^|]*\|[^|]*\| (sim|não) \| sim \|$/gm)].map(
      (m) => [m[1], m[2] === "sim"] as const,
    );
    expect(rows.map(([id]) => id).sort()).toEqual(FONTS.map((f) => f.id).sort());
    for (const [id, text] of rows) expect(FONTS.find((f) => f.id === id)?.italic, id).toBe(text);
  });

  it("o padrão das fontes e das cores é o que o documento diz", () => {
    expect(DOC).toContain("Atkinson Hyperlegible Next e Archivo");
    expect(DOC).toContain("`#151a33`");
    expect(DOC).toContain("`#2b4fe0`");
    expect(DOC).toContain("`#ffd43b`");
  });
});

describe("cor do texto e anotações", () => {
  it("a paleta do documento é a do código", () => {
    const line = DOC.split("\n").find((l) => l.includes("nome de uma cor da paleta")) ?? "";
    const names = [...line.matchAll(/`([a-z]+)`/g)].map((m) => m[1]).filter((n) => n && n !== "span");
    expect(names.filter((n) => Object.hasOwn(TEXT_COLORS, n ?? "")).sort()).toEqual(Object.keys(TEXT_COLORS).sort());
  });

  it("o exemplo de anotações do documento é aceito e volta igual", async () => {
    const example = JSON.parse(concrete(blocks("Anotações da imagem", "json")[0] ?? ""));
    const asset = await saveAsset(dir, "tela.png", new Uint8Array([137, 80, 78, 71]));
    const saved = await writeAnnotations(dir, asset, example);
    expect(saved).toEqual(parseAnnotations(example));
    expect(saved).toMatchObject(example);
    expect(await exists(path.join(dir, `${asset}.json`))).toBe(true);
    expect(JSON.parse(await readFile(path.join(dir, `${asset}.json`), "utf8")).version).toBe(1);
  });

  it("anotações recusam coordenada fora de 0 a 1, id repetido e destino url que não é http/mailto", async () => {
    const asset = await saveAsset(dir, "tela.png", new Uint8Array([137, 80, 78, 71]));
    const base = { version: 1, markers: [], highlights: [], arrows: [], hotspots: [] };
    const marker = { id: "m1", n: 1, x: 0.5, y: 0.5 };
    await expect(writeAnnotations(dir, asset, { ...base, markers: [{ ...marker, x: 1.5 }] })).rejects.toThrow();
    await expect(writeAnnotations(dir, asset, { ...base, markers: [marker, { ...marker, n: 2 }] })).rejects.toThrow();
    const hot = { id: "s1", x: 0, y: 0, w: 0.1, h: 0.1 };
    await expect(
      writeAnnotations(dir, asset, { ...base, hotspots: [{ ...hot, target: { type: "url", href: "javascript:alert(1)" } }] }),
    ).rejects.toThrow();
    await expect(
      writeAnnotations(dir, asset, { ...base, hotspots: [{ ...hot, target: { type: "url", href: "https://a.com" } }] }),
    ).resolves.toBeTruthy();
  });

  it("nenhum caminho sai da pasta do manual (regra do documento)", async () => {
    await expect(writeAnnotations(dir, "../fora.png", { version: 1 })).rejects.toThrow();
    await expect(writeAnnotations(dir, "pages/a.md", { version: 1 })).rejects.toThrow();
  });
});
