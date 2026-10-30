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
