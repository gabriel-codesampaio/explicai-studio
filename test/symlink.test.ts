import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual } from "../src/core/index.js";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let outside: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-link-"));
  outside = await mkdtemp(path.join(tmpdir(), "explicai-link-fora-"));
  await writeFile(path.join(outside, "segredo.png"), "CONTEUDO-SECRETO");
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
  await rm(outside, { recursive: true, force: true });
});

describe("link simbólico que sai da pasta do manual (junction no Windows, sem precisar de permissão)", () => {
  it("/files/ recusa o link e continua servindo arquivo normal", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    await rm(path.join(dir, "assets"), { recursive: true, force: true });
    await symlink(outside, path.join(dir, "assets"), "junction"); // junction: no Windows não exige permissão de administrador
    await writeFile(path.join(dir, "ok.png"), "ok");
    const server = createStudioServer({ workspace });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      const bad = await fetch(`${base}/files/m/assets/segredo.png`);
      expect(bad.status).toBe(400);
      expect(await bad.text()).not.toContain("CONTEUDO-SECRETO");
      expect(await (await fetch(`${base}/files/m/ok.png`)).text()).toBe("ok");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("a exportação não copia imagem que é link para fora do manual", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    await rm(path.join(dir, "assets"), { recursive: true, force: true });
    await symlink(outside, path.join(dir, "assets"), "junction"); // junction: no Windows não exige permissão de administrador
    await addPage(dir, { title: "P", body: "![x](../assets/segredo.png)" });
    await expect(exportManual(dir, "html")).rejects.toThrow(/fora do manual/);
  });
});
