import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createStudioServer } from "../src/server/index.js";

let workspace: string;
let base: string;
let close: () => Promise<void>;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-srv-new-"));
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

it("manual de formato mais novo: lista, abre com newerFormat, recusa gravação com 409 e não regrava", async () => {
  await fetch(`${base}/api/manuals`, send("POST", { title: "Fin" }));
  const page = await (await fetch(`${base}/api/manuals/fin/pages`, send("POST", { title: "P", body: "oi" }))).json();
  const file = path.join(workspace, "fin", "manual.json");
  await writeFile(file, JSON.stringify({ ...JSON.parse(await readFile(file, "utf8")), version: 2 }));
  const before = await readFile(file, "utf8");

  expect(await (await fetch(`${base}/api/manuals`)).json()).toHaveLength(1);
  const detail = await (await fetch(`${base}/api/manuals/fin`)).json();
  expect(detail).toMatchObject({ title: "Fin", newerFormat: 2 });
  expect(detail.pages).toHaveLength(1);
  expect((await (await fetch(`${base}/api/manuals/fin/pages/${page.id}`)).json()).body).toContain("oi");

  const put = await fetch(`${base}/api/manuals/fin/pages/${page.id}`, send("PUT", { title: "X" }));
  expect(put.status).toBe(409);
  expect(await put.json()).toMatchObject({ code: "format-newer", params: { version: 2, supported: 1 } });
  expect((await fetch(`${base}/api/manuals/fin/pages`, send("POST", { title: "Y" }))).status).toBe(409);
  expect(await readFile(file, "utf8")).toBe(before);
});

it("manual no formato atual não leva newerFormat", async () => {
  await fetch(`${base}/api/manuals`, send("POST", { title: "Fin" }));
  expect(await (await fetch(`${base}/api/manuals/fin`)).json()).not.toHaveProperty("newerFormat");
});
