import { mkdtemp, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { errorPage } from "../src/server/errorPage.js";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let webDir: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-err-ws-"));
  webDir = await mkdtemp(path.join(tmpdir(), "explicai-err-web-"));
  const server = createStudioServer({ workspace, webDir });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
  await rm(webDir, { recursive: true, force: true });
});

const html = { headers: { accept: "text/html,application/xhtml+xml", "accept-language": "pt-BR,pt;q=0.9" } };

describe("página de erro do servidor", () => {
  it("sem o editor compilado, o navegador recebe uma página HTML explicando o que fazer", async () => {
    const res = await fetch(`${base}/`, html);
    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("<h1");
    expect(body).toContain("npm run build");
    expect(body).toContain("web-missing");
    expect(body).not.toMatch(/<script\s+src=|<link[^>]+href="http/);
  });

  it("traz a marca, o marca-texto, o tema do sistema e o código copiável", async () => {
    const body = await (await fetch(`${base}/`, html)).text();
    expect(body).toContain('aria-label="Explicaí Studio"');
    expect(body).toContain("<mark>não foi encontrado</mark>");
    expect(body).toContain("prefers-color-scheme:dark");
    expect(body).toContain("HTTP 500 web-missing");
    expect(body).toContain("clipboard");
    expect(body).toContain("<title>O editor não foi encontrado · Explicaí Studio</title>");
  });

  it("segue o idioma do navegador", async () => {
    const res = await fetch(`${base}/`, { headers: { accept: "text/html", "accept-language": "en-US,en;q=0.9" } });
    expect(await res.text()).toContain("The editor was not found");
  });

  it("chamada de API continua recebendo JSON, mesmo pedindo HTML", async () => {
    const res = await fetch(`${base}/api/manuals/nada`, html);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("a página 404 destaca o que não foi achado, nas duas línguas", () => {
    expect(errorPage(404, "not-found", "pt")).toContain("<mark>não encontrada</mark>");
    expect(errorPage(404, "not-found", "en")).toContain("<mark>not found</mark>");
  });

  it("declara as fontes da marca servidas pelo próprio servidor, sem CDN", async () => {
    const body = await (await fetch(`${base}/`, html)).text();
    const urls = [...body.matchAll(/url\((\/api\/fonts\/[^)]+)\)/g)].map((m) => m[1] as string);
    expect(urls).toContain("/api/fonts/archivo-latin-wght-normal.woff2");
    expect(urls).toContain("/api/fonts/atkinson-hyperlegible-next-latin-400-normal.woff2");
    expect(body).toContain('font-family:"Archivo"');
    expect(body).not.toMatch(/url\(https?:/);
    for (const url of urls) {
      const res = await fetch(`${base}${url}`);
      expect(res.status, url).toBe(200);
      await res.arrayBuffer();
    }
  });

  it("com o editor no lugar, o index.html sai normalmente", async () => {
    await writeFile(path.join(webDir, "index.html"), "<!doctype html><title>Studio</title>");
    const res = await fetch(`${base}/#/qualquer`, html);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("<title>Studio</title>");
  });

  it("acesso recusado também vira página legível no navegador", async () => {
    const res = await fetch(`${base}/`, { headers: { ...html.headers, origin: "https://site-malicioso.com" } });
    expect(res.status).toBe(403);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("forbidden-origin");
  });
});
