// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { inertWhenHidden } from "../src/lib/inertWhenHidden";

const tick = () => new Promise((r) => setTimeout(r, 0));

it("fundo fica inert com overlay aberto, sai ao fechar e volta no próximo focusin", async () => {
  inertWhenHidden();
  document.body.innerHTML = '<div id="bg"><button id="t">t</button></div><div id="m" role="menu" data-state="open"></div>';
  const bg = document.getElementById("bg") as HTMLElement;
  const menu = document.getElementById("m") as HTMLElement;

  bg.setAttribute("data-aria-hidden", "true");
  await tick();
  expect(bg.hasAttribute("inert")).toBe(true);

  menu.setAttribute("data-state", "closed");
  await tick();
  expect(bg.hasAttribute("inert")).toBe(false);

  document.dispatchEvent(new Event("focusin"));
  expect(bg.hasAttribute("inert")).toBe(true);

  bg.removeAttribute("data-aria-hidden");
  await tick();
  expect(bg.hasAttribute("inert")).toBe(false);
});
