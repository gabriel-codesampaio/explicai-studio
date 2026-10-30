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
    expect((await raw("/api/manuals", { origin: "http://localhost:5173" })).status).toBe(200);
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
      expect(JSON.parse(res.body).error).toBeTruthy();
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
