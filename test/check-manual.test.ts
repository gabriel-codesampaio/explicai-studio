import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { addPage, appendAnnotations, checkManual, createManual, saveAsset } from "../src/core/index.js";

const PNG = Uint8Array.from(
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64"),
);

describe("checkManual", () => {
  it("aponta cada defeito e deixa a página boa em paz", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    const gone = await addPage(dir, { title: "Apagada", body: "x" });
    const bare = await saveAsset(dir, "sem.png", PNG);
    const hot = await saveAsset(dir, "hot.png", PNG);
    await appendAnnotations(dir, hot, {
      hotspots: [{ x: 0, y: 0, w: 1, h: 1, target: { type: "page", pageId: "inexistente" } }],
    });
    const ok = await saveAsset(dir, "ok.png", PNG);
    await appendAnnotations(dir, ok, { markers: [{ x: 0.5, y: 0.5 }] });
    const bad = await addPage(dir, {
      title: "Ruim",
      body: `1. Clique em **A**.\n2. Clique em **B**.\nResultado: abre.\n\n[x](./nao-existe.md)\n\nA confirmar.\n\n![](../${bare})\n![](../${hot})\n![](../assets/some.png)`,
    });
    await addPage(dir, {
      title: "Boa",
      body: `1. Clique.\n   Resultado: abre.\n\n[ok](./${path.posix.basename(gone.file)})\n\n![](../${ok})`,
    });
    await addPage(dir, { title: "Sem passos", body: "Só texto." });
    const found = await checkManual(dir);
    expect(
      found
        .filter((f) => f.pageId === bad.id)
        .map((f) => f.kind)
        .sort(),
    ).toEqual([
      "dead-link",
      "hotspot-missing-page",
      "image-without-markers",
      "missing-image",
      "step-without-result",
      "to-confirm",
    ]);
    expect(found.filter((f) => !["Ruim"].includes(f.title) && f.title !== "Apagada")).toEqual([]);
  });

  it("página com passos e sem print", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    await addPage(dir, { title: "P", body: "1. Clique.\nResultado: ok." });
    expect((await checkManual(dir)).map((f) => f.kind)).toEqual(["no-image"]);
  });
});
