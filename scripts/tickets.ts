// Lista a fila a partir dos arquivos: o índice não vive no git, então PRs paralelos não conflitam nele.
// Uso: npm run tickets            (abertos, por prioridade e ID)
//      npm run tickets -- fechados (fechados, do mais recente para o mais antigo)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "docs", "tickets");
const closed = process.argv.includes("fechados");
const dir = closed ? join(root, "fechados") : root;

const field = (text: string, name: string) => text.match(new RegExp(`^- ${name}: (.+)$`, "m"))?.[1]?.trim() ?? "?";

const rows = readdirSync(dir)
  .filter((f) => /^T-\d+.*\.md$/.test(f))
  .map((f) => {
    const text = readFileSync(join(dir, f), "utf8");
    return {
      id: Number(f.match(/^T-(\d+)/)?.[1]),
      title: text.match(/^# T-\d+: (.+)$/m)?.[1] ?? f,
      priority: field(text, "Prioridade"),
      status: field(text, "Status"),
      agent: field(text, "Agente"),
    };
  })
  .sort((a, b) => (closed ? b.id - a.id : a.priority.localeCompare(b.priority) || a.id - b.id));

for (const r of rows) console.log(`T-${r.id} | ${r.priority} | ${r.status} | ${r.agent} | ${r.title}`);
console.log(`${rows.length} ${closed ? "fechados" : "abertos"}`);
