import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { HttpError } from "../src/server/http.js";
import { assertLocalRequest } from "../src/server/security.js";

const req = (headers: Record<string, string | undefined>) => ({ headers }) as unknown as IncomingMessage;
const codeOf = (headers: Record<string, string | undefined>) => {
  try {
    assertLocalRequest(req(headers));
    return "ok";
  } catch (err) {
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(403);
    return (err as HttpError).code;
  }
};

describe("assertLocalRequest", () => {
  it("aceita Host local, com e sem porta", () => {
    for (const host of ["localhost", "localhost:4321", "127.0.0.1:4321", "[::1]:4321", "[::1]"]) {
      expect(codeOf({ host }), host).toBe("ok");
    }
  });

  it("recusa Host de outro nome (DNS rebinding)", () => {
    for (const host of [
      "evil.com",
      "localhost.evil.com",
      "localhost.evil.com:4321",
      "evil.localhost.com",
      "127.0.0.1.evil.com",
      "0.0.0.0:4321",
      "192.168.0.10:4321",
      "",
    ]) {
      expect(codeOf({ host }), host).toBe("forbidden-host");
    }
    expect(codeOf({})).toBe("forbidden-host");
  });

  it("recusa Host com credenciais ou lixo no lugar da porta", () => {
    for (const host of ["localhost@evil.com", "evil.com#localhost", "localhost:4321@evil.com", "localhost:abc"]) {
      expect(codeOf({ host }), host).toBe("forbidden-host");
    }
  });

  it("aceita Origin local e a ausência de Origin (curl, MCP)", () => {
    for (const origin of ["http://localhost:5173", "http://127.0.0.1:4321", "http://[::1]:4321", "http://localhost"]) {
      expect(codeOf({ host: "localhost:4321", origin }), origin).toBe("ok");
    }
    expect(codeOf({ host: "localhost:4321" })).toBe("ok");
  });

  it("recusa Origin null, de outro site e com nome parecido com localhost", () => {
    for (const origin of [
      "null",
      "https://evil.com",
      "http://localhost.evil.com",
      "http://localhost.evil.com:4321",
      "http://evil.com/localhost",
      "http://localhost:4321.evil.com",
      "http://localhost@evil.com",
      "https://localhost:4321",
      "file://",
    ]) {
      expect(codeOf({ host: "localhost:4321", origin }), origin).toBe("forbidden-origin");
    }
  });

  it("Host local não salva Origin de fora", () => {
    expect(codeOf({ host: "127.0.0.1:4321", origin: "http://evil.com" })).toBe("forbidden-origin");
  });
});
