import path from "node:path";
import { readAnnotations } from "./assets.js";
import { exists } from "./fs.js";
import { readManual } from "./manuals.js";
import { readPage } from "./pages.js";
import { flatten } from "./tree.js";

export type CheckKind =
  | "no-image"
  | "step-without-result"
  | "dead-link"
  | "missing-image"
  | "hotspot-missing-page"
  | "image-without-markers"
  | "marker-without-label"
  | "to-confirm";

export interface CheckFinding {
  pageId: string;
  title: string;
  kind: CheckKind;
  detail: string;
}

const IMAGE = /!\[[^\]]*\]\(([^)\s]+)\)/g;
const LINK = /(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g;
const STEP = /^\s*\d+\.\s/;
const BREAK = /^(#{1,6}\s|\s*>)/;

const decode = (t: string) => {
  try {
    return decodeURI(t);
  } catch {
    return t;
  }
};

/** Passos numerados (fora de bloco de código) cujo trecho, até o próximo passo ou título, não tem "Resultado:". */
function stepsWithoutResult(body: string): string[] {
  const out: string[] = [];
  let fence = false;
  let cur: { head: string; ok: boolean } | null = null;
  const close = () => cur && !cur.ok && out.push(cur.head);
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) continue;
    if (STEP.test(line)) {
      close();
      cur = { head: line.replace(STEP, "").trim().slice(0, 60), ok: /resultado:/i.test(line) };
    } else if (cur && /resultado:/i.test(line) && !/^\s*#/.test(line)) cur.ok = true;
    else if (cur && BREAK.test(line)) {
      close();
      cur = null;
    }
  }
  close();
  return out;
}

/** Texto sem as linhas de bloco de código: link e imagem ali são exemplo, não link do manual. */
function prose(body: string): string {
  let fence = false;
  return body
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*```/.test(line)) fence = !fence;
      return !fence && !/^\s*```/.test(line);
    })
    .join("\n");
}

/**
 * Confere o manual inteiro, só lendo: nada é corrigido. Devolve um achado por problema, na ordem das páginas.
 * "Página sem print" vale para página com passos; "A confirmar" é texto que não devia ter ficado no manual.
 */
export async function checkManual(dir: string, opts: { allowNewer?: boolean } = {}): Promise<CheckFinding[]> {
  const nodes = flatten((await readManual(dir, opts)).pages);
  const ids = new Set(nodes.map((n) => n.id));
  const files = new Set(nodes.map((n) => path.posix.basename(n.file)));
  const findings: CheckFinding[] = [];
  for (const node of nodes) {
    const page = await readPage(dir, node.id, opts);
    const add = (kind: CheckKind, detail: string) => findings.push({ pageId: page.id, title: page.title, kind, detail });
    const steps = stepsWithoutResult(page.body);
    for (const s of steps) add("step-without-result", `Passo sem "Resultado:": ${s}`);
    if (/\bA confirmar\b/.test(page.body)) add("to-confirm", 'A página contém "A confirmar".');
    const text = prose(page.body);
    const images = [...new Set([...text.matchAll(IMAGE)].map((m) => decode(m[1] as string).replace(/^(\.\.\/)+/, "")))];
    if (images.length === 0 && /^\s*\d+\.\s/m.test(page.body)) add("no-image", "A página tem passos e nenhum print.");
    for (const href of [...text.matchAll(LINK)].map((m) => m[1] as string)) {
      const m = /^(?:\.\/)?([^/#?]+\.md)(?:#.*)?$/.exec(href);
      if (m && !files.has(m[1] as string)) add("dead-link", `Link para página que não existe: ${href}`);
    }
    for (const asset of images.filter((a) => /^assets\/[^/\\]+$/.test(a))) {
      if (!(await exists(path.join(dir, asset)))) {
        add("missing-image", `Imagem não encontrada: ${asset}`);
        continue;
      }
      const ann = await readAnnotations(dir, asset).catch(() => null);
      if (ann && !ann.markers.length && !ann.highlights.length && !ann.arrows.length && !ann.hotspots.length) {
        add("image-without-markers", `Imagem sem marcação: ${asset}`);
      }
      const bare = (ann?.markers ?? []).filter((m) => !m.label?.trim()).map((m) => m.n);
      if (bare.length) add("marker-without-label", `Marcador sem descrição em ${asset}: ${bare.join(", ")}`);
      for (const h of ann?.hotspots ?? []) {
        if (h.target.type !== "url" && !ids.has(h.target.pageId)) {
          add("hotspot-missing-page", `Hotspot de ${asset} aponta para página apagada (${h.target.pageId}).`);
        }
      }
    }
  }
  return findings;
}
