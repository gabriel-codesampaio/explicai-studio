import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, findBrowser } from "../src/core/index.js";

// T-105: PDF com 100 imagens no Chrome de verdade. Guarda o `loading="lazy"` do HTML: se o Chrome sem janela
// deixasse de carregar as imagens fora da tela, o PDF sairia sem elas. Sem navegador na máquina, não roda.
const browser = await findBrowser();
const COUNT = 100;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type), data]);
  let c = ~0;
  for (const b of body) c = (crcTable[(c ^ b) & 255] as number) ^ (c >>> 8);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(~c >>> 0);
  return Buffer.concat([len, body, crc]);
}
/** PNG 160x100 que muda com `seed`, para o Chrome não juntar as 100 imagens numa só. */
function png(seed: number): Buffer {
  const w = 160;
  const h = 100;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w * 3; x++) raw[y * (w * 3 + 1) + 1 + x] = ((x >> 2) + y * 3 + seed * 7) & 255;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

let workspace: string;

afterAll(async () => {
  if (workspace) await rm(workspace, { recursive: true, force: true });
});

describe.skipIf(!browser)("PDF com 100 imagens", () => {
  it("todas as imagens entram no PDF", async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-pdfimg-"));
    const { dir } = await createManual(workspace, { title: "Cem imagens", language: "pt-BR" });
    await mkdir(path.join(dir, "assets"), { recursive: true });
    let body = "";
    for (let i = 0; i < COUNT; i++) {
      await writeFile(path.join(dir, "assets", `img${i}.png`), png(i));
      body += `Passo ${i + 1}.\n\n![Tela ${i + 1}](../assets/img${i}.png)\n\n`;
    }
    await addPage(dir, { title: "Passo a passo", body });
    const t0 = performance.now();
    const r = await exportManual(dir, "pdf");
    // Orçamento (docs/desempenho.md): medido 4,7 a 7,5 s; teto 30 s.
    expect(performance.now() - t0).toBeLessThan(30_000);
    expect(r.warnings).toEqual([]);
    const pdf = (await readFile(path.join(dir, r.file))).toString("latin1");
    // Uma imagem do PDF por print (o Chrome ainda grava uma máscara por imagem, daí o "pelo menos").
    expect(pdf.match(/\/Subtype\s*\/Image/g)?.length).toBeGreaterThanOrEqual(COUNT);
  }, 120_000);
});
