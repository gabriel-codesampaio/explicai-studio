import { mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let port: number;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-sec-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = (server.address() as AddressInfo).port;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

/** O fetch normaliza a URL e o Host; aqui vai o que o cliente escreveu, byte a byte. */
function raw(requestPath: string, headers: Record<string, string> = {}) {
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: requestPath, headers: { host: `localhost:${port}`, ...headers } },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

describe("servidor local: Host e Origin", () => {
  it("recusa Host de outro nome com 403 (DNS rebinding)", async () => {
    for (const host of ["evil.com", "localhost.evil.com", `localhost.evil.com:${port}`]) {
      const res = await raw("/api/manuals", { host });
      expect(res.status, host).toBe(403);
      expect(JSON.parse(res.body).code).toBe("forbidden-host");
    }
  });

  it("recusa Origin null e localhost.evil.com, mas deixa passar o editor em localhost", async () => {
    for (const origin of ["null", "http://localhost.evil.com"]) {
      const res = await raw("/api/manuals", { origin });
      expect(res.status, origin).toBe(403);
      expect(JSON.parse(res.body).code).toBe("forbidden-origin");
    }
    expect((await raw("/api/manuals", { origin: `http://localhost:${port}` })).status).toBe(200);
    expect((await raw("/api/manuals", { origin: "http://localhost:3000" })).status).toBe(403);
  });

  it("não serve arquivo do manual para Host de fora", async () => {
    expect((await raw("/files/m/manual.json", { host: "evil.com" })).status).toBe(403);
  });
});

describe("servidor local: caminho malformado", () => {
  it("%-escape inválido na URL vira 400, não 500", async () => {
    for (const p of ["/api/manuals/%E0%A4%A", "/api/manuals/%", "/api/manuals/%zz/pages", "/files/m/%FF"]) {
      const res = await raw(p);
      expect(res.status, p).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.code, p).toBe("malformed-url");
      expect(body.error, p).toMatch(/endereço/i);
    }
  });

  it("quem abre no navegador com um endereço malformado recebe a página de erro em HTML, também 400", async () => {
    const res = await raw("/%", { accept: "text/html" });
    expect(res.status).toBe(400);
    expect(res.body).toMatch(/<html/i);
  });

  it("..%2f no nome do manual não sai do workspace", async () => {
    const res = await raw("/api/manuals/..%2f..%2fetc/pages");
    expect([400, 404]).toContain(res.status);
  });
});

describe("servidor local: arquivos de /files/ e corpo JSON", () => {
  const base = () => `http://127.0.0.1:${port}`;
  const CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  const mk = () =>
    fetch(`${base()}/api/manuals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "M" }),
    });
  const up = (name: string, body: string) => fetch(`${base()}/api/manuals/m/assets?name=${name}`, { method: "POST", body });

  it("SVG e outros tipos não raster de /files/ saem com CSP e sandbox; PNG e o app não", async () => {
    await mk();
    await up("a.svg", "<svg xmlns='http://www.w3.org/2000/svg'><script>1</script></svg>");
    await up("b.png", "x");
    const svg = await fetch(`${base()}/files/m/assets/a.svg`);
    expect(svg.headers.get("content-security-policy")).toBe(CSP);
    expect(svg.headers.get("content-type")).toBe("image/svg+xml");
    expect((await fetch(`${base()}/files/m/manual.json`)).headers.get("content-security-policy")).toBe(CSP);
    expect((await fetch(`${base()}/files/m/assets/b.png`)).headers.get("content-security-policy")).toBeNull();
    expect((await fetch(`${base()}/`)).headers.get("content-security-policy")).toBeNull();
  });

  it("arquivos de /files/ saem com ETag, 304 em If-None-Match e cache só nas imagens de assets/", async () => {
    await mk();
    await up("b.png", "x");
    await up("a.svg", "<svg xmlns='http://www.w3.org/2000/svg'/>");
    const png = await fetch(`${base()}/files/m/assets/b.png`);
    const etag = png.headers.get("etag");
    expect(etag).toBeTruthy();
    expect(await png.text()).toBe("x");
    expect(png.headers.get("cache-control")).toBe("private, max-age=3600");
    expect(png.headers.get("x-content-type-options")).toBe("nosniff");
    const again = await fetch(`${base()}/files/m/assets/b.png`, { headers: { "if-none-match": etag as string } });
    expect(again.status).toBe(304);
    expect(await again.text()).toBe("");
    expect((await fetch(`${base()}/files/m/assets/b.png`, { headers: { "if-none-match": '"outro"' } })).status).toBe(200);
    // SVG e manual.json continuam revalidando e com CSP; 304 também leva CSP.
    const svg = await fetch(`${base()}/files/m/assets/a.svg`);
    expect(svg.headers.get("cache-control")).toBe("no-cache");
    expect(svg.headers.get("content-security-policy")).toBe(CSP);
    const mj = await fetch(`${base()}/files/m/manual.json`);
    expect(mj.headers.get("cache-control")).toBe("no-cache");
    expect(mj.headers.get("etag")).toBeTruthy();
    const mj304 = await fetch(`${base()}/files/m/manual.json`, {
      headers: { "if-none-match": mj.headers.get("etag") as string },
    });
    expect(mj304.status).toBe(304);
    expect(mj304.headers.get("content-security-policy")).toBe(CSP);
    expect((await fetch(`${base()}/files/m/assets/nao-existe.png`)).status).toBe(404);
  });

  it("recusa corpo com content-type que não é JSON (text/plain não faz preflight) com 415", async () => {
    for (const type of ["text/plain", "application/x-www-form-urlencoded"]) {
      const res = await fetch(`${base()}/api/manuals`, {
        method: "POST",
        headers: { "content-type": type },
        body: JSON.stringify({ title: "X" }),
      });
      expect(res.status, type).toBe(415);
      const body = await res.json();
      expect(body.code).toBe("unsupported-media-type");
      expect(body.error).toMatch(/application\/json/);
    }
    expect((await (await fetch(`${base()}/api/manuals`)).json()).length).toBe(0);
  });

  it("aceita application/json com charset", async () => {
    const res = await fetch(`${base()}/api/manuals`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ title: "Y" }),
    });
    expect(res.status).toBe(201);
  });
});
