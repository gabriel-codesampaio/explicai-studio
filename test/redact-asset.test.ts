import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { deflateSync, inflateSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { imageSize } from "../src/core/export/imageSize.js";
import {
  addPage,
  createManual,
  insideGitRepo,
  readAnnotations,
  redactAsset,
  saveAsset,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-redact-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (const byte of b) c = (CRC[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, body: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])));
  return Buffer.concat([head, body, crc]);
}

const W = 12;
const H = 8;
/** RGBA de W×H em que cada pixel é diferente, para qualquer pixel de fora que mude aparecer. */
const pattern = () => Uint8Array.from({ length: W * H * 4 }, (_, i) => (i * 37 + (i >> 2) * 11) % 251);

function encodePng(rgba: Uint8Array, width = W, height = H, extra: Buffer[] = [], tail = Buffer.alloc(0)): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) rows.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    ...extra,
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
    tail,
  ]);
}

/** Lê os pixels RGBA de um PNG gravado sem filtro (o que encodePng produz) e lista os tipos de bloco. */
function decodePng(b: Buffer) {
  const types: string[] = [];
  const idat: Buffer[] = [];
  let end = 8;
  for (let i = 8; i < b.length; i = end) {
    const len = b.readUInt32BE(i);
    const type = b.toString("ascii", i + 4, i + 8);
    types.push(type);
    if (type === "IDAT") idat.push(b.subarray(i + 8, i + 8 + len));
    end = i + 12 + len;
    if (type === "IEND") break;
  }
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  const raw = inflateSync(Buffer.concat(idat));
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) rgba.set(raw.subarray(y * (w * 4 + 1) + 1, (y + 1) * (w * 4 + 1)), y * w * 4);
  return { w, h, rgba, types, afterIend: b.length - end };
}

/** O que o navegador faz: pinta a tarja opaca (x0..x1, y0..y1 em pixels). */
function paint(rgba: Uint8Array, x0: number, y0: number, x1: number, y1: number) {
  const out = Uint8Array.from(rgba);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) out.set([31, 41, 55, 255], (y * W + x) * 4);
  return out;
}

describe("redactAsset", () => {
  it("troca o arquivo pelo tarjado: pixels de dentro na cor da tarja, de fora iguais, sem EXIF nem bytes após o IEND", async () => {
    const original = pattern();
    const asset = await saveAsset(dir, "tela.png", encodePng(original));
    const marks = { version: 1, markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5 }], highlights: [], arrows: [], hotspots: [] };
    await writeAnnotations(dir, asset, marks);
    const page = await addPage(dir, { title: "P", body: `![tela](${asset})\n` });
    const pageBefore = await readFile(path.join(dir, page.file), "utf8");
    const trashed = path.join(dir, ".lixeira", "imagens-x", "assets");
    await mkdir(trashed, { recursive: true });
    await writeFile(path.join(trashed, "tela.png"), encodePng(original));

    const burned = paint(original, 3, 2, 9, 5);
    const sent = encodePng(burned, W, H, [chunk("eXIf", Buffer.from("Exif-secreto"))], Buffer.from("RESTO-DO-ORIGINAL"));
    await redactAsset(dir, asset, sent);

    const after = decodePng(await readFile(path.join(dir, asset)));
    expect([after.w, after.h]).toEqual([W, H]);
    expect(Array.from(after.rgba)).toEqual(Array.from(burned));
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const inside = x >= 3 && x < 9 && y >= 2 && y < 5;
        const px = Array.from(after.rgba.slice((y * W + x) * 4, (y * W + x) * 4 + 4));
        expect(px).toEqual(inside ? [31, 41, 55, 255] : Array.from(original.slice((y * W + x) * 4, (y * W + x) * 4 + 4)));
      }
    }
    expect(after.afterIend).toBe(0);
    expect(after.types).not.toContain("eXIf");
    // Temporário não sobra; o original some de assets/ e da pasta de imagens sem uso.
    expect((await readdir(path.join(dir, "assets"))).filter((f) => f.endsWith(".tmp"))).toEqual([]);
    expect(await readdir(trashed)).toEqual([]);
    // Markdown e marcações ficam como estavam.
    expect(await readFile(path.join(dir, page.file), "utf8")).toBe(pageBefore);
    expect(await readAnnotations(dir, asset)).toEqual(marks);
  });

  it("aceita imagem de outro tamanho; recusa formato trocado e SVG, sem mexer no original", async () => {
    const asset = await saveAsset(dir, "tela.png", encodePng(pattern()));
    const file = path.join(dir, asset);
    const before = await readFile(file);
    await expect(redactAsset(dir, asset, Buffer.from([0xff, 0xd8, 0xff, 0xd9]))).rejects.toThrow(/PNG/);
    const svg = await saveAsset(dir, "a.svg", Buffer.from('<svg width="1" height="1"></svg>'));
    await expect(redactAsset(dir, svg, encodePng(pattern()))).rejects.toThrow(/PNG, JPEG ou WebP/);
    expect(await readFile(file)).toEqual(before);
    expect((await readdir(path.join(dir, "assets"))).filter((f) => f.endsWith(".tmp"))).toEqual([]);
    await redactAsset(dir, asset, encodePng(new Uint8Array(4 * 4 * 4), 4, 4));
    expect(await imageSize(file)).toMatchObject({ w: 4, h: 4 });
  });

  it("recusa caminho fora de assets/", async () => {
    await expect(redactAsset(dir, "manual.json", encodePng(pattern()))).rejects.toThrow();
  });
});

describe("insideGitRepo", () => {
  it("acha .git na pasta do manual ou numa de cima", async () => {
    expect(await insideGitRepo(dir)).toBe(false);
    await mkdir(path.join(workspace, ".git"));
    expect(await insideGitRepo(dir)).toBe(true);
  });
});
