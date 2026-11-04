import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, findBrowser } from "../src/core/index.js";

// T-137: PDF por público com o Chrome de verdade (sem navegador falso). Sem navegador na máquina, o teste não roda.
const browser = await findBrowser();

let workspace: string;
let dir: string;

/** O `/Count` da árvore de páginas do PDF (o Chrome grava essa árvore sem compressão). */
async function pdfPages(file: string): Promise<number> {
  const text = (await readFile(file)).toString("latin1");
  return Number(
    /\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)|\/Count\s+(\d+)[\s\S]{0,200}?\/Type\s*\/Pages/
      .exec(text)
      ?.slice(1)
      .find(Boolean),
  );
}

describe.skipIf(!browser)("PDF por público com Chrome real", () => {
  beforeAll(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-pdfreal-"));
    dir = (await createManual(workspace, { title: "Sistema", language: "pt-BR" })).dir;
    await addPage(dir, { title: "Visão geral", body: "Bem-vindo ao sistema." });
    // A página só do admin é longa de propósito: se ela entrasse no PDF do cliente, o número de páginas cresceria.
    const longa = Array.from({ length: 160 }, (_, i) => `Linha ${i + 1} da página só do admin.`).join("\n\n");
    await addPage(dir, { title: "Cobranças", audience: ["admin"], body: longa });
  }, 60_000);
  afterAll(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it("o PDF do cliente não leva a página do admin, e os dois ficam lado a lado", async () => {
    const cliente = await exportManual(dir, "pdf", { audience: "cliente" });
    const admin = await exportManual(dir, "pdf", { audience: "admin" });
    expect([cliente.pages, admin.pages]).toEqual([1, 2]);
    expect(cliente.file).toMatch(/-cliente\.pdf$/);
    expect(admin.file).toMatch(/-admin\.pdf$/);
    for (const r of [cliente, admin]) expect((await stat(path.join(dir, r.file))).size).toBeGreaterThan(1000);
    const [pc, pa] = [await pdfPages(path.join(dir, cliente.file)), await pdfPages(path.join(dir, admin.file))];
    expect(pc).toBeLessThanOrEqual(3); // capa, sumário e a página geral
    expect(pa).toBeGreaterThanOrEqual(pc + 4); // a página longa do admin só existe no PDF dele
  }, 90_000);
});
