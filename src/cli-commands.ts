import { parseArgs } from "node:util";
import { checkManual, ExplicaiError, type ExportFormat, exportManual } from "./core/index.js";

export const SUBCOMMANDS = ["check", "export"] as const;

export const CHECK_USAGE = `Uso: explicai check <pasta>

Confere o manual em <pasta>: link morto, imagem que falta, passo sem resultado e outros.
Sai com 1 se achar algo, 0 se estiver limpo.`;

export const EXPORT_USAGE = `Uso: explicai export <pasta> --format html|pdf|md

Exporta o manual em <pasta> para <pasta>/exportacao. O PDF precisa de Chrome, Edge ou Chromium
instalado (ou o caminho em EXPLICAI_BROWSER).`;

export interface CliIo {
  out: (text: string) => void;
  err: (text: string) => void;
  /** Troca o export nos testes (PDF depende de navegador instalado). */
  exportManual?: typeof exportManual;
}

const FORMATS: Record<string, ExportFormat> = { html: "html", pdf: "pdf", md: "markdown" };

export function isSubcommand(arg: string | undefined): boolean {
  return (SUBCOMMANDS as readonly string[]).includes(arg ?? "");
}

/** Roda `explicai check|export` e devolve o código de saída: 0 ok, 1 achado ou erro. */
export async function runSubcommand(argv: string[], io: CliIo): Promise<number> {
  const [name, ...rest] = argv;
  const usage = name === "check" ? CHECK_USAGE : EXPORT_USAGE;
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(name, rest);
  } catch {
    io.err(`Opção inválida.\n\n${usage}`);
    return 1;
  }
  const { values, positionals } = parsed;
  if (values.help) {
    io.out(usage);
    return 0;
  }
  const dir = positionals[0];
  if (!dir || positionals.length > 1) {
    io.err(`Informe a pasta do manual.\n\n${usage}`);
    return 1;
  }
  try {
    if (name === "check") return await check(dir, io);
    const format = FORMATS[values.format ?? ""];
    if (!format) {
      io.err(`Informe --format html, pdf ou md.\n\n${usage}`);
      return 1;
    }
    const result = await (io.exportManual ?? exportManual)(dir, format);
    for (const w of result.warnings) io.err(`Aviso: ${w}`);
    io.out(`${result.file} (${result.pages} páginas)`);
    return 0;
  } catch (e) {
    const enoent = (e as NodeJS.ErrnoException).code === "ENOENT";
    io.err(enoent ? `Não achei um manual em ${dir} (falta o manual.json).` : e instanceof ExplicaiError ? e.message : String(e));
    return 1;
  }
}

function parse(name: string | undefined, args: string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h", default: false },
      ...(name === "export" ? { format: { type: "string" as const } } : {}),
    },
  }) as { values: { help?: boolean; format?: string }; positionals: string[] };
}

async function check(dir: string, io: CliIo): Promise<number> {
  const findings = await checkManual(dir);
  for (const f of findings) io.out(`${f.title}: ${f.detail}`);
  io.out(findings.length ? `${findings.length} achado(s).` : "Nenhum achado.");
  return findings.length ? 1 : 0;
}
