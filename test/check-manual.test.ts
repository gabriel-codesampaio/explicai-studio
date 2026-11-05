import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { addPage, appendAnnotations, checkManual, createManual, saveAsset } from "../src/core/index.js";

const PNG = Uint8Array.from(
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64"),
);

/** Sem os achados de conferência: cada teste daqui olha outro defeito. */
const findings = async (dir: string) => (await checkManual(dir)).filter((f) => f.kind !== "not-reviewed");

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
    await appendAnnotations(dir, ok, { markers: [{ x: 0.5, y: 0.5, label: "Botão" }] });
    const bad = await addPage(dir, {
      title: "Ruim",
      body: `1. Clique em **A**.\n2. Clique em **B**.\nResultado: abre.\n\n[x](./nao-existe.md)\n\nA confirmar.\n\n![](../${bare})\n![](../${hot})\n![](../assets/some.png)`,
    });
    await addPage(dir, {
      title: "Boa",
      body: `1. Clique.\n   Resultado: abre.\n\n[ok](./${path.posix.basename(gone.file)})\n\n![](../${ok})`,
    });
    await addPage(dir, { title: "Sem passos", body: "Só texto." });
    const found = await findings(dir);
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

  it("avisa do marcador sem descrição, um achado por imagem", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    const img = await saveAsset(dir, "a.png", PNG);
    await appendAnnotations(dir, img, {
      markers: [
        { x: 0.1, y: 0.1, label: "Ok" },
        { x: 0.2, y: 0.2 },
        { x: 0.3, y: 0.3, label: "  " },
      ],
    });
    const page = await addPage(dir, { title: "P", body: `![](../${img})` });
    expect(await findings(dir)).toEqual([
      { pageId: page.id, title: "P", kind: "marker-without-label", detail: `Marcador sem descrição em ${img}: 2, 3` },
    ]);
  });

  it("página com passos e sem print", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    await addPage(dir, { title: "P", body: "1. Clique.\nResultado: ok." });
    expect((await findings(dir)).map((f) => f.kind)).toEqual(["no-image"]);
  });

  it("aceita Resultado em citação logo depois do passo", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    const ok = await saveAsset(dir, "ok.png", PNG);
    await appendAnnotations(dir, ok, { markers: [{ x: 0.5, y: 0.5, label: "Botão" }] });
    await addPage(dir, { title: "Citação", body: `1. Clique.\n> **Resultado:** abre.\n\n![](../${ok})` });
    expect(await findings(dir)).toEqual([]);
  });

  it("ignora link e imagem dentro de bloco de código", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "expl-"));
    const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
    const ok = await saveAsset(dir, "ok.png", PNG);
    await appendAnnotations(dir, ok, { markers: [{ x: 0.5, y: 0.5, label: "Botão" }] });
    await addPage(dir, {
      title: "Código",
      body: `\`\`\`md\n[x](./nao-existe.md)\n![](../assets/some.png)\n\`\`\`\n\n1. Clique.\nResultado: ok.\n\n![](../${ok})`,
    });
    expect(await findings(dir)).toEqual([]);
  });
});
