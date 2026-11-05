import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Window } from "happy-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NORMALIZE_SRC, TOC_SEARCH_SCRIPT } from "../src/core/export/tocSearch.js";
import { addPage, createManual, exportManual } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-busca-"));
  dir = (await createManual(workspace, { title: "Sistema", language: "pt-BR" })).dir;
});
afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

async function html(opts?: { audience?: string }): Promise<string> {
  const r = await exportManual(dir, "html", opts);
  return readFile(path.join(dir, r.file), "utf8");
}
const scriptOf = (doc: string) => /<script>([\s\S]*?)<\/script>/.exec(doc)?.[1] ?? "";

/** Carrega o HTML exportado no DOM e roda o script inline, como o navegador faria. */
function open(doc: string) {
  const win = new Window();
  const document = win.document as unknown as Document;
  document.documentElement.innerHTML = doc.replace(/^<!doctype html>\s*<html[^>]*>/i, "").replace(/<\/html>\s*$/, "");
  new Function("document", scriptOf(doc))(document);
  const input = document.querySelector<HTMLInputElement>("#toc-q") as HTMLInputElement;
  const type = (v: string) => {
    input.value = v;
    input.dispatchEvent(new win.Event("input") as unknown as Event);
  };
  const visible = () => [...document.querySelectorAll<HTMLElement>(".toc li:not([hidden])")].map((l) => l.textContent?.trim());
  return { win, document, input, type, visible, status: () => document.querySelector("[role=status]")?.textContent };
}

describe("busca no sumário do HTML exportado", () => {
  it("normaliza sem acento nem caixa", () => {
    const norm = new Function(`${NORMALIZE_SRC};return norm`)();
    expect(norm("Cobrança ÁÉÍ Ção")).toBe("cobranca aei cao");
  });

  it("campo nasce hidden (sem JS segue legível) e o script o mostra; um só script, sem eval nem innerHTML", async () => {
    await addPage(dir, { title: "Visão geral", body: "Bem-vindo." });
    const doc = await html();
    expect(doc).toMatch(/<div class="toc-search" hidden/);
    expect(doc.match(/<script/g)).toHaveLength(1);
    expect(doc).not.toMatch(/<script[^>]*\ssrc=/);
    const js = scriptOf(doc);
    expect(js).toBe(TOC_SEARCH_SCRIPT);
    expect(js).not.toMatch(/\beval\b|new Function|innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
    expect(doc).toMatch(/<label for="toc-q">Buscar no manual<\/label>/);
    expect(doc).toContain('aria-live="polite"');
    expect(open(doc).input.closest<HTMLElement>(".toc-search")?.hidden).toBe(false);
  });

  it("filtra o sumário e destaca seções, com e sem acento", async () => {
    await addPage(dir, { title: "Cobranças", body: "Estorno da cobrança." });
    await addPage(dir, { title: "Pedidos", body: "Lista de pedidos." });
    const { document, type, visible, status } = open(await html());
    type("COBRANCA");
    expect(visible()).toEqual(["1 Cobranças"]);
    expect([...document.querySelectorAll(".page.hit")].map((p) => p.querySelector(".page-title")?.textContent)).toEqual([
      "1 Cobranças",
    ]);
    expect(status()).toBe("1 página com esse termo");
    type("cobrança");
    expect(visible()).toEqual(["1 Cobranças"]);
    type("zzz");
    expect(visible()).toEqual([]);
    expect(status()).toBe("Nenhuma página com esse termo");
    type("");
    expect(visible()).toHaveLength(2);
    expect(document.querySelectorAll(".hit")).toHaveLength(0);
    expect(status()).toBe("");
  });

  it("termo com HTML vira texto: nada é inserido na página", async () => {
    await addPage(dir, { title: "A", body: "x" });
    const { win, document, type } = open(await html());
    const text = document.querySelector("main")?.textContent;
    type('<img src=x onerror="window.__x=1">');
    expect((win as unknown as { __x?: number }).__x).toBeUndefined();
    expect(document.querySelectorAll("img")).toHaveLength(0);
    expect(document.querySelector("main")?.textContent).toBe(text);
  });

  it("respeita o público: página de admin não entra no sumário nem na busca", async () => {
    await addPage(dir, { title: "Pública", body: "ok" });
    await addPage(dir, { title: "Segredo", audience: ["admin"], body: "tokenultrasecreto" });
    const doc = await html({ audience: "cliente" });
    expect(doc).not.toMatch(/tokenultrasecreto|Segredo/);
    const { type, status } = open(doc);
    type("tokenultrasecreto");
    expect(status()).toBe("Nenhuma página com esse termo");
  });

  it("textos em inglês quando o manual é em inglês", async () => {
    const en = (await createManual(workspace, { title: "Guide", language: "en" })).dir;
    await addPage(en, { title: "Intro", body: "hello" });
    const r = await exportManual(en, "html");
    const doc = await readFile(path.join(en, r.file), "utf8");
    expect(doc).toContain("Search the manual");
    const { type, status } = open(doc);
    type("hello");
    expect(status()).toBe("1 page with this term");
  });

  it("o sumário inteiro some no PDF (campo incluso)", async () => {
    expect(await html()).toContain(".layout{display:block}.toc,.page-nav{display:none}");
  });
});
