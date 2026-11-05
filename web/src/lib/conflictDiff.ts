import type { Page, PagePatch } from "./api";

export interface ConflictDiff {
  /** Trecho do arquivo no disco que difere do texto da pessoa. */
  disk: string;
  /** Trecho do texto da pessoa que difere do disco. */
  mine: string;
  /** Quantas linhas estão no trecho que difere (o maior dos dois lados). */
  lines: number;
}

/** Tira o começo e o fim iguais e devolve só o miolo que difere; null se os dois textos são iguais. */
export function textDiff(mine: string, disk: string): ConflictDiff | null {
  if (mine === disk) return null;
  const a = mine.split("\n");
  const b = disk.split("\n");
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  return {
    mine: a.slice(start, endA).join("\n"),
    disk: b.slice(start, endB).join("\n"),
    lines: Math.max(endA - start, endB - start),
  };
}

/** O que mudou entre o que a pessoa ia gravar (`pending`) e a página no disco: o corpo, ou o título se só ele mudou. */
export function conflictDiff(pending: PagePatch | undefined, disk: Page): ConflictDiff | null {
  if (!pending) return null;
  const body = pending.body === undefined ? null : textDiff(pending.body, disk.body);
  if (body) return body;
  return pending.title === undefined ? null : textDiff(pending.title, disk.title);
}

/** Uma linha dos dois painéis: `left` é a versão guardada, `right` o texto atual; só um lado preenchido = removida/adicionada. */
export interface DiffRow {
  left: string | null;
  right: string | null;
  changed: boolean;
}

/** Acima disto (linhas de um dos lados) não comparamos: o painel avisa em vez de travar. */
export const MAX_DIFF_LINES = 10000;
/** Máximo de linhas editadas (removidas + adicionadas) que o diff acompanha. Acima, o miolo que difere vira tudo removido + tudo adicionado. */
export const MAX_EDITS = 2000;

export type LineDiff = { rows: DiffRow[]; coarse: boolean } | { tooBig: true } | null;

/** Diff por linha, alinhado em linhas para dois painéis. null = textos iguais. */
export function lineDiff(saved: string, current: string): LineDiff {
  if (saved === current) return null;
  const a = saved.split("\n");
  const b = current.split("\n");
  if (a.length > MAX_DIFF_LINES || b.length > MAX_DIFF_LINES) return { tooBig: true };
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const same = (line: string): DiffRow => ({ left: line, right: line, changed: false });
  const rows: DiffRow[] = a.slice(0, start).map(same);
  const fine = myersOps(midA, midB);
  const coarse = fine === null;
  const ops = fine ?? coarseOps(midA, midB);
  // Cada bloco de removidas/adicionadas vira linhas lado a lado.
  let del: string[] = [];
  let add: string[] = [];
  const flush = () => {
    for (let i = 0; i < Math.max(del.length, add.length); i++)
      rows.push({ left: del[i] ?? null, right: add[i] ?? null, changed: true });
    del = [];
    add = [];
  };
  for (const op of ops) {
    if (op.kind === "same") {
      flush();
      rows.push(same(op.line));
    } else (op.kind === "del" ? del : add).push(op.line);
  }
  flush();
  rows.push(...a.slice(endA).map(same));
  return { rows, coarse };
}

type Op = { kind: "same" | "del" | "add"; line: string };

const coarseOps = (a: string[], b: string[]): Op[] => [
  ...a.map((line): Op => ({ kind: "del", line })),
  ...b.map((line): Op => ({ kind: "add", line })),
];

/** Myers O(ND): custo proporcional ao número de linhas que mudam. Passou de MAX_EDITS, devolve null (o chamador cai no modo grosso). */
function myersOps(a: string[], b: string[]): Op[] | null {
  const n = a.length;
  const m = b.length;
  const off = MAX_EDITS + 1;
  const v = new Int32Array(2 * off + 1);
  const trace: Int32Array[] = [];
  let found = false;
  for (let d = 0; d <= MAX_EDITS && !found; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && (v[off + k - 1] ?? 0) < (v[off + k + 1] ?? 0))
          ? (v[off + k + 1] ?? 0)
          : (v[off + k - 1] ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[off + k] = x;
      if (x >= n && y >= m) {
        found = true;
        break;
      }
    }
  }
  if (!found) return null;
  const ops: Op[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d] as Int32Array;
    const k = x - y;
    const prevK = k === -d || (k !== d && (vd[off + k - 1] ?? 0) < (vd[off + k + 1] ?? 0)) ? k + 1 : k - 1;
    const px = vd[off + prevK] ?? 0;
    const py = px - prevK;
    while (x > px && y > py && d > 0) {
      x--;
      y--;
      ops.push({ kind: "same", line: a[x] as string });
    }
    if (d === 0) {
      while (x > 0) {
        x--;
        y--;
        ops.push({ kind: "same", line: a[x] as string });
      }
    } else if (x === px) {
      y--;
      ops.push({ kind: "add", line: b[y] as string });
    } else {
      x--;
      ops.push({ kind: "del", line: a[x] as string });
    }
  }
  return ops.reverse();
}
