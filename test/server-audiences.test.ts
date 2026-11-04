import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-aud-"));
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

it("API de públicos: cria, renomeia e remove; valida entrada, 404 e 409", async () => {
  await fetch(`${base}/api/manuals`, send("POST", { title: "Fin" }));
  const url = `${base}/api/manuals/fin/audiences`;
  expect((await fetch(url, send("POST", { name: " Admin " }))).status).toBe(201);
  expect((await fetch(url, send("POST", { name: "admin" }))).status).toBe(409);
  expect((await fetch(url, send("POST", { name: 3 }))).status).toBe(400);
  expect((await fetch(url, send("POST", { name: "" }))).status).toBe(400);
  const page = await (await fetch(`${base}/api/manuals/fin/pages`, send("POST", { title: "P", audience: ["Admin"] }))).json();
  const ren = await fetch(`${url}/Admin`, send("PATCH", { name: "Gestão" }));
  expect(await ren.json()).toEqual({ name: "Gestão", pages: 1 });
  expect((await fetch(`${url}/Admin`, send("PATCH", { name: "x" }))).status).toBe(404);
  expect((await fetch(`${url}/Gest%C3%A3o`, send("PATCH", {}))).status).toBe(400);
  const del = await fetch(`${url}/Gest%C3%A3o`, send("DELETE"));
  expect(await del.json()).toEqual({ freed: [{ id: page.id, title: "P" }] });
  expect((await (await fetch(`${base}/api/manuals/fin`)).json()).audiences).toEqual([]);
});
