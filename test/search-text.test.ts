import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { addPage, createManual, foldText, removePage, searchBodies } from "../src/core/index.js";

let ws: string;
let dir: string;

beforeAll(async () => {
  ws = await mkdtemp(path.join(tmpdir(), "explicai-busca-"));
  dir = (await createManual(ws, { title: "Busca", language: "pt-BR" })).dir;
  await addPage(dir, { title: "Pagamentos", body: "Para pagar o Boleto, abra a tela de cobrança." });
  await addPage(dir, { title: "Antigo", body: "O boleto antigo some." });
  await addPage(dir, { title: "Outra", body: "Sem relação." });
});
afterAll(() => rm(ws, { recursive: true, force: true }));

it("foldText tira acento e caixa", () => {
  expect(foldText("AÇÃO Índice")).toBe("acao indice");
});

it("acha o termo ignorando acento e caixa, com o trecho original", async () => {
  const hits = await searchBodies(dir, "COBRANCA");
  expect(hits).toHaveLength(1);
  expect(hits[0]?.title).toBe("Pagamentos");
  expect(hits[0]?.match).toBe("cobrança");
  expect(hits[0]?.before.endsWith("abra a tela de ")).toBe(true);
});

it("acha com acento na busca e sem acento no texto", async () => {
  expect((await searchBodies(dir, "cobrança")).map((h) => h.title)).toEqual(["Pagamentos"]);
});

it("respeita o limite e a ordem da árvore", async () => {
  expect((await searchBodies(dir, "boleto")).map((h) => h.title)).toEqual(["Pagamentos", "Antigo"]);
  expect(await searchBodies(dir, "boleto", { limit: 1 })).toHaveLength(1);
});

it("ignora página da lixeira", async () => {
  const [antigo] = await searchBodies(dir, "antigo");
  await removePage(dir, antigo?.id as string);
  expect((await searchBodies(dir, "boleto")).map((h) => h.title)).toEqual(["Pagamentos"]);
});

it("trecho curto, com reticências cortadas pela interface", async () => {
  const d = (await createManual(ws, { title: "Longo", language: "pt-BR" })).dir;
  await addPage(d, { title: "L", body: `${"a ".repeat(200)}ALVO${" b".repeat(200)}` });
  const [hit] = await searchBodies(d, "alvo");
  expect((hit?.before.length ?? 0) + (hit?.after.length ?? 0)).toBeLessThanOrEqual(130);
});

it("trecho sem sintaxe Markdown (negrito, código, tabela, link, imagem)", async () => {
  const d = (await createManual(ws, { title: "Md", language: "pt-BR" })).dir;
  await addPage(d, {
    title: "M",
    body: "Gere o **boleto** em `cobrança`.\n\n| A | B |\n|---|---|\n| x | y |\n\nVeja [cobrança](https://x.com/a) e ![print](a.png) fim.",
  });
  const [hit] = await searchBodies(d, "cobranca");
  expect(hit?.before).toBe("Gere o boleto em ");
  expect(hit?.after).toContain("A B x y Veja cobrança");
  expect(hit?.after).not.toMatch(/[*`|#[\]()]/);
});
