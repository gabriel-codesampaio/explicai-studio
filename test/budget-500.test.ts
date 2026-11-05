import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { addPage, createManual, readPageTree, updatePage } from "../src/core/index.js";

// T-423: orçamento de abrir e salvar com 500 páginas (medidas e tetos em docs/desempenho.md).
let ws: string;
let dir: string;
const ids: string[] = [];
const body = "Parágrafo de exemplo com **negrito** e `código`.\n\n".repeat(40);

beforeAll(async () => {
  ws = await mkdtemp(path.join(tmpdir(), "explicai-500-"));
  dir = (await createManual(ws, { title: "Manual grande", language: "pt-BR" })).dir;
  for (let i = 0; i < 500; i++) {
    const parentId = i % 10 === 0 ? null : (ids[i - (i % 10)] as string);
    ids.push((await addPage(dir, { title: `Página ${i}`, body, parentId })).id);
  }
}, 120_000);
afterAll(() => rm(ws, { recursive: true, force: true }));

/** Mediana de 5 rodadas: um tropeço do disco ou da CPU não derruba o teste. */
async function median(run: () => Promise<unknown>): Promise<number> {
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t = performance.now();
    await run();
    times.push(performance.now() - t);
  }
  return times.sort((a, b) => a - b)[2] as number;
}

it("abrir: ler a árvore com 500 páginas em até 500 ms", async () => {
  expect(await median(() => readPageTree(dir))).toBeLessThan(500);
});

it("salvar o corpo de uma página em um manual de 500 páginas leva até 100 ms", async () => {
  let n = 0;
  expect(await median(() => updatePage(dir, ids[250] as string, { body: body + n++ }, { fileName: "keep" }))).toBeLessThan(100);
});

it("salvar com título novo (renomeia o arquivo) leva até 1 s", async () => {
  let n = 0;
  expect(
    await median(() => updatePage(dir, ids[251] as string, { title: `Outro título ${n++}` }, { fileName: "sync" })),
  ).toBeLessThan(1000);
});
