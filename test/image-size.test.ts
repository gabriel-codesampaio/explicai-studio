import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { imageSize } from "../src/core/export/imageSize.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "explicai-svg-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function svg(tag: string) {
  const file = path.join(dir, "a.svg");
  await writeFile(file, `<?xml version="1.0"?>\n${tag}<rect/></svg>`);
  return imageSize(file);
}

describe("tamanho de SVG", () => {
  it("lê width e height", async () => {
    expect(await svg('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">')).toEqual({ w: 200, h: 100 });
    expect(await svg('<svg width="12.5" height="30">')).toEqual({ w: 12.5, h: 30 });
  });

  it("width e height ganham do viewBox", async () => {
    expect(await svg('<svg width="200" height="100" viewBox="0 0 20 10">')).toEqual({ w: 200, h: 100 });
  });

  it("sem width e height, usa o viewBox", async () => {
    expect(await svg('<svg viewBox="0 0 640 480">')).toEqual({ w: 640, h: 480 });
  });

  it("sem nenhuma medida, devolve null", async () => {
    expect(await svg("<svg>")).toBeNull();
  });
});

describe("leitura só do cabeçalho", () => {
  const jpeg = (exifBytes: number, segments = 1) => {
    const seg = Buffer.concat([Buffer.from([0xff, 0xe1, (exifBytes + 2) >> 8, (exifBytes + 2) & 0xff]), Buffer.alloc(exifBytes)]);
    const app1 = Buffer.concat(Array(segments).fill(seg));
    const sof = Buffer.from([0xff, 0xc0, 0, 17, 8, 0x01, 0xe0, 0x02, 0x80, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]);
    return Buffer.concat([Buffer.from([0xff, 0xd8]), app1, sof]);
  };

  it("JPEG com marcador SOF logo no começo", async () => {
    const file = path.join(dir, "a.jpg");
    await writeFile(file, jpeg(100));
    expect(await imageSize(file)).toEqual({ w: 640, h: 480 });
  });

  it("JPEG com EXIF maior que 64 KB: o SOF fica além do começo e ainda é achado", async () => {
    const file = path.join(dir, "b.jpg");
    await writeFile(file, jpeg(40000, 2));
    expect(await imageSize(file)).toEqual({ w: 640, h: 480 });
  });

  it("PNG grande: só o começo basta", async () => {
    const png = Buffer.alloc(200_000);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
    png.writeUInt32BE(300, 16);
    png.writeUInt32BE(200, 20);
    const file = path.join(dir, "c.png");
    await writeFile(file, png);
    expect(await imageSize(file)).toEqual({ w: 300, h: 200 });
  });
});
