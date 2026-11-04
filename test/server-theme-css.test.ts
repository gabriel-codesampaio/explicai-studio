import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { themeCss } from "../src/core/index.js";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-css-"));
  const server = createStudioServer({ workspace });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterEach(async () => {
  await close();
  await rm(workspace, { recursive: true, force: true });
});

const send = (method: string, body?: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

it("GET theme/css devolve o themeCss do export no escopo da amostra", async () => {
  await fetch(`${base}/api/manuals`, send("POST", { title: "Fin" }));
  const css = async () => (await (await fetch(`${base}/api/manuals/fin/theme/css`)).json()).css;
  expect(await css()).toBe("");
  const theme = { accent: "#7a3fc4", fonts: { headings: "archivo" } };
  expect((await fetch(`${base}/api/manuals/fin/theme`, send("PUT", { accent: theme.accent }))).status).toBe(200);
  expect(await css()).toBe(themeCss({ accent: theme.accent }, ".amostra-manual"));
  expect(await css()).toMatch(/^\.amostra-manual\{--accent:#7a3fc4;/);
  expect((await fetch(`${base}/api/manuals/nao-existe/theme/css`)).status).toBe(404);
});
