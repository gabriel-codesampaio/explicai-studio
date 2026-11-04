import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addPage, createManual, exportManual, readManual, saveAsset, updatePage, writeAnnotations } from "../src/core/index.js";

// PDF sai do mesmo HTML; o "navegador" só grava um arquivo, e o teste olha o HTML que ele recebeu.
vi.mock("node:child_process", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:child_process")>();
  const { writeFileSync } = await import("node:fs");
  const execFile = Object.assign(() => undefined, {
    [promisify.custom]: async (_f: string, args: string[]) => {
      const out = args.find((a) => a.startsWith("--print-to-pdf="))?.slice("--print-to-pdf=".length);
      if (out) writeFileSync(out, "%PDF-1.4 falso");
      return { stdout: "", stderr: "" };
    },
  });
  return { ...real, execFile };
});

let workspace: string;
let dir: string;

function png(w: number, h: number): Uint8Array {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

const SECRET = "SEGREDO-DO-ADMIN-4711";
const files = async (d: string) => (await readdir(path.join(dir, "exportacao", d))).sort();

/** Visão geral (todos) → Cobranças (admin) → Estornos (herda admin) · Pedidos (cliente, tem print com área para Cobranças). */
async function seed() {
  const adminShot = await saveAsset(dir, "tela-admin.png", png(800, 600));
  const clientShot = await saveAsset(dir, "tela-cliente.png", png(400, 300));
  const visao = await addPage(dir, { title: "Visão geral", body: "Bem-vindo." });
  const cobr = await addPage(dir, {
    title: "Cobranças",
    audience: ["admin"],
    body: `${SECRET}\n\n![Painel](../${adminShot})\n`,
  });
  const estornos = await addPage(dir, { title: "Estornos secretos", parentId: cobr.id, body: `${SECRET} estorno` });
  const pedidos = await addPage(dir, {
    title: "Pedidos",
    audience: ["cliente", "admin"],
    body: `Veja [as cobranças](./${cobr.file.split("/").pop()}) e o painel.\n\n![Tela](../${clientShot})\n`,
  });
  await writeAnnotations(dir, clientShot, {
    version: 1,
    markers: [],
    highlights: [],
    arrows: [],
    hotspots: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, target: { type: "page", pageId: cobr.id } }],
  });
  return { visao, cobr, estornos, pedidos, adminShot, clientShot };
}

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-aud-"));
  dir = (await createManual(workspace, { title: "Sistema", language: "pt-BR" })).dir;
  vi.stubEnv("EXPLICAI_BROWSER", process.execPath);
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(workspace, { recursive: true, force: true });
});

describe("export por público", () => {
  it("cliente: nenhum rastro da página de admin em HTML, PDF e Markdown", async () => {
    await seed();
    const html = await exportManual(dir, "html", { audience: "cliente" });
    const md = await exportManual(dir, "markdown", { audience: "cliente" });
    const pdf = await exportManual(dir, "pdf", { audience: "cliente" });

    expect([html.pages, md.pages, pdf.pages]).toEqual([2, 2, 2]);
    expect(pdf.file).toMatch(/\.pdf$/);
    const outputs = [
      await readFile(path.join(dir, html.file), "utf8"),
      await readFile(path.join(dir, md.file), "utf8"),
      await readFile(path.join(dir, "exportacao/html/index.html"), "utf8"), // o que o PDF imprimiu
    ];
    for (const text of outputs) {
      for (const leak of [SECRET, "Cobranças", "Estornos", "estorno", "tela-admin", "cobrancas.md"]) {
        expect(text, leak).not.toContain(leak);
      }
      expect(text).toContain("Pedidos");
    }
    // O link virou texto; sem hotspot para a página filtrada.
    expect(outputs[0]).toContain("Veja as cobranças e o painel");
    expect(outputs[0]).not.toContain('class="hot"');
    expect(await files("html")).toContain("assets");
    expect(await readdir(path.join(dir, "exportacao/html/assets"))).toEqual(["tela-cliente.png"]);
    expect(await readdir(path.join(dir, "exportacao/markdown/assets"))).toEqual(["tela-cliente.png"]);
    for (const r of [html, md, pdf]) {
      expect(r.warnings.join("\n")).toMatch(/link para cobrancas\.md virou texto/);
      expect(r.warnings.join("\n")).toMatch(/área clicável.*removida/);
    }
  });

  it("markdown: hotspot para página filtrada some da legenda", async () => {
    await seed();
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown", { audience: "cliente" })).file), "utf8");
    expect(md).not.toMatch(/Cobran/);
    expect(md).toContain("[1 Visão geral]");
  });

  it("filha herda a restrição da mãe, também sem restrição própria", async () => {
    const s = await seed();
    const r = await exportManual(dir, "markdown", { audience: "admin" });
    expect(r.pages).toBe(4);
    const text = await readFile(path.join(dir, r.file), "utf8");
    expect(text).toContain("Estornos secretos");
    expect(s.estornos.audience).toBeUndefined();
  });

  it("filha com restrição própria precisa passar nas duas", async () => {
    const s = await seed();
    await updatePage(dir, s.estornos.id, { audience: ["cliente"] });
    const admin = await exportManual(dir, "markdown", { audience: "admin" });
    expect(admin.pages).toBe(3); // admin vê a mãe, mas a filha é só de cliente
    const cliente = await exportManual(dir, "markdown", { audience: "cliente" });
    expect(cliente.pages).toBe(2); // cliente não vê a mãe, então não vê a filha
  });

  it("sem público: tudo, como antes; público desconhecido avisa", async () => {
    await seed();
    expect((await exportManual(dir, "markdown")).pages).toBe(4);
    const r = await exportManual(dir, "markdown", { audience: "visitante" });
    expect(r.pages).toBe(1); // só a Visão geral
    expect(r.warnings.join("\n")).toMatch(/Nenhuma página cita o público "visitante"/);
  });

  it("a lista de perfis do manual acompanha o que as páginas citam", async () => {
    await seed();
    expect((await readManual(dir)).audiences).toEqual(["admin", "cliente"]);
  });
});
