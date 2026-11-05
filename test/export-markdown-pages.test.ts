import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, removePage, saveAsset, writeAnnotations } from "../src/core/index.js";

let workspace: string;
let dir: string;

function png(): Uint8Array {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(10, 16);
  b.writeUInt32BE(10, 20);
  return b;
}

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-mdpages-"));
  dir = (await createManual(workspace, { title: "Manual Teste", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const read = (rel: string) => readFile(path.join(dir, "exportacao", rel), "utf8");

describe("export Markdown: llms.txt e paginas/", () => {
  it("gera llms.txt, um .md por página e mantém manual.md", async () => {
    const shot = await saveAsset(dir, "tela.png", png());
    await writeAnnotations(dir, shot, {
      version: 1,
      markers: [{ id: "m1", x: 0.5, y: 0.5, n: 1, label: "Botão salvar" }],
      highlights: [],
      arrows: [],
      hotspots: [],
    });
    const a = await addPage(dir, { title: "Começar", body: "Texto de abertura.\n\nVeja [próxima](./usar.md).\n" });
    const b = await addPage(dir, { title: "Usar", body: `Passo.\n\n![Tela](../${shot})\n` });
    const gone = await addPage(dir, { title: "Lixo", body: "x" });
    await removePage(dir, gone.id);

    const r = await exportManual(dir, "markdown");
    expect(r.file).toBe("exportacao/markdown/manual.md");
    expect(await readdir(path.join(dir, "exportacao/markdown/paginas"))).toHaveLength(2);

    const llms = await read("markdown/llms.txt");
    expect(llms).toContain("# Manual Teste");
    expect(llms).toContain("Texto de abertura.");
    expect(llms).not.toContain("Lixo");
    const links = [...llms.matchAll(/\]\((paginas\/[^)]+\.md)\)/g)].map((m) => m[1] as string);
    expect(links).toHaveLength(2);
    for (const l of links) await stat(path.join(dir, "exportacao/markdown", l));

    const first = await read(`markdown/${links[0]}`);
    const second = await read(`markdown/${links[1]}`);
    expect(first).toContain(`](${path.posix.basename(links[1] as string)})`);
    expect(second).toContain(`![Tela](../${shot})`);
    expect(second).toContain("Botão salvar");
    await stat(path.join(dir, "exportacao/markdown", shot));
    expect(b.id).toBeTruthy();
    expect(a.id).toBeTruthy();
  });

  it("slug seguro e sem colisão: título com .. e / não sai da pasta", async () => {
    await addPage(dir, { title: "../../etc/passwd", body: "a" });
    await addPage(dir, { title: "../../etc/passwd", body: "b" });
    await addPage(dir, { title: "CON", body: "c" });
    await exportManual(dir, "markdown");
    const names = await readdir(path.join(dir, "exportacao/markdown/paginas"));
    expect(names).toHaveLength(3);
    expect(new Set(names).size).toBe(3);
    for (const n of names) expect(n).toMatch(/^[a-z0-9-]+\.md$/);
    expect((await readdir(path.join(dir, "exportacao"))).sort()).toEqual(["markdown"]);
  });

  it("respeita o público", async () => {
    await addPage(dir, { title: "Aberta", body: "ok" });
    await addPage(dir, { title: "Secreta", audience: ["admin"], body: "SEGREDO" });
    await exportManual(dir, "markdown", { audience: "cliente" });
    const llms = await read("markdown-cliente/llms.txt");
    expect(llms).not.toContain("Secreta");
    for (const n of await readdir(path.join(dir, "exportacao/markdown-cliente/paginas"))) {
      expect(await read(`markdown-cliente/paginas/${n}`)).not.toContain("SEGREDO");
    }
  });
});
