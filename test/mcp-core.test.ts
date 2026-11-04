import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { addPage, appendAnnotations, createManual, ExplicaiError, readPage, updatePage } from "../src/core/index.js";

const PNG = Uint8Array.from(
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64"),
);

async function setup() {
  const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
  const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
  const { saveAsset } = await import("../src/core/index.js");
  return { dir, asset: await saveAsset(dir, "a.png", PNG) };
}

describe("appendAnnotations", () => {
  it("atribui id e n e acumula entre chamadas", async () => {
    const { dir, asset } = await setup();
    await appendAnnotations(dir, asset, {
      markers: [
        { x: 0.1, y: 0.2 },
        { x: 0.3, y: 0.4, label: "ok" },
      ],
    });
    const a = await appendAnnotations(dir, asset, {
      markers: [{ x: 0.5, y: 0.5 }],
      highlights: [{ x: 0, y: 0, w: 0.5, h: 0.5 }],
    });
    expect(a.markers.map((m) => m.n)).toEqual([1, 2, 3]);
    expect(new Set(a.markers.map((m) => m.id)).size).toBe(3);
    expect(a.highlights).toHaveLength(1);
  });
  it("recusa coordenada fora de 0..1 e não grava", async () => {
    const { dir, asset } = await setup();
    await expect(appendAnnotations(dir, asset, { markers: [{ x: 2, y: 0 }] })).rejects.toThrow();
    expect((await appendAnnotations(dir, asset, {})).markers).toHaveLength(0);
  });
});

describe("rev", () => {
  it("readPage devolve rev; updatePage com rev velho recusa", async () => {
    const { dir } = await setup();
    const p = await addPage(dir, { title: "A", body: "x" });
    const { rev } = await readPage(dir, p.id);
    expect(rev).toMatch(/^[0-9a-f]{16}$/);
    await updatePage(dir, p.id, { body: "y" }, { ifRev: rev });
    await expect(updatePage(dir, p.id, { body: "z" }, { ifRev: rev })).rejects.toBeInstanceOf(ExplicaiError);
    expect((await readPage(dir, p.id)).body).toBe("y");
  });

  it("duas gravações com o mesmo rev ao mesmo tempo: só uma passa", async () => {
    const { dir } = await setup();
    const p = await addPage(dir, { title: "A", body: "x" });
    const r = await Promise.allSettled([
      updatePage(dir, p.id, { body: "y" }, { ifRev: p.rev }),
      updatePage(dir, p.id, { body: "z" }, { ifRev: p.rev }),
    ]);
    expect(r.map((x) => x.status).sort()).toEqual(["fulfilled", "rejected"]);
  });

  it("beforeWrite roda só depois do rev conferido", async () => {
    const { dir } = await setup();
    const p = await addPage(dir, { title: "A", body: "x" });
    let calls = 0;
    const beforeWrite = async () => void calls++;
    await expect(updatePage(dir, p.id, { body: "y" }, { ifRev: "velho", beforeWrite })).rejects.toBeInstanceOf(ExplicaiError);
    expect(calls).toBe(0);
    await updatePage(dir, p.id, { body: "y" }, { ifRev: p.rev, beforeWrite });
    expect(calls).toBe(1);
  });
});
