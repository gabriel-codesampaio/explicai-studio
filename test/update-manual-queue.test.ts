import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, flatten, readManual } from "../src/core/index.js";
import { updateManual } from "../src/core/manuals.js";

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-queue-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("updateManual: fila por pasta", () => {
  it("10 addPage simultâneos deixam 10 nós na árvore", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    await Promise.all(Array.from({ length: 10 }, (_, i) => addPage(dir, { title: `Página ${i}`, parentId: null, index: 0 })));
    expect(flatten((await readManual(dir)).pages)).toHaveLength(10);
  });

  it("falha no meio não trava as seguintes e o erro chega a quem chamou", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const boom = updateManual(dir, () => {
      throw new Error("boom");
    });
    const ok = updateManual(dir, (meta) => meta.title);
    await expect(boom).rejects.toThrow("boom");
    await expect(ok).resolves.toBe("M");
  });

  it("pastas diferentes não se bloqueiam", async () => {
    const a = await createManual(workspace, { title: "A", language: "pt-BR" });
    const b = await createManual(workspace, { title: "B", language: "pt-BR" });
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const slow = updateManual(a.dir, async (meta) => {
      await gate;
      return meta.title;
    });
    await expect(updateManual(b.dir, (meta) => meta.title)).resolves.toBe("B");
    release();
    await slow;
  });
});
