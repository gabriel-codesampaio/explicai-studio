import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { ExplicaiError } from "../errors.js";
import { exists } from "../fs.js";

const run = promisify(execFile);

/** Onde costumam ficar Chrome, Edge e Chromium. EXPLICAI_BROWSER aponta outro. */
function candidates(): string[] {
  const env = process.env;
  const custom = env.EXPLICAI_BROWSER ? [env.EXPLICAI_BROWSER] : [];
  if (process.platform === "win32") {
    const roots = [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA].filter(Boolean) as string[];
    return custom.concat(
      roots.flatMap((r) => [
        path.join(r, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(r, "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(r, "Chromium", "Application", "chrome.exe"),
      ]),
    );
  }
  if (process.platform === "darwin") {
    return custom.concat([
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]);
  }
  const dirs = (env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"];
  return custom.concat(names.flatMap((n) => dirs.map((d) => path.join(d, n))));
}

export async function findBrowser(): Promise<string | null> {
  for (const file of candidates()) if (await exists(file)) return file;
  return null;
}

/**
 * Imprime o HTML exportado em PDF com o Chrome (ou Edge) da máquina, sem janela.
 * Usa um perfil temporário: com o perfil normal, um Chrome já aberto "engolia" o pedido.
 */
export async function printPdf(htmlFile: string, pdfFile: string): Promise<void> {
  const browser = await findBrowser();
  if (!browser) {
    throw new ExplicaiError(
      "no-browser",
      "Para gerar o PDF, o Explicaí usa o Chrome, o Edge ou o Chromium da sua máquina, e nenhum foi encontrado. " +
        "Instale um deles ou informe o caminho na variável EXPLICAI_BROWSER.",
    );
  }
  const profile = await mkdtemp(path.join(tmpdir(), "explicai-pdf-"));
  try {
    await run(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profile}`,
        "--no-pdf-header-footer",
        `--print-to-pdf=${pdfFile}`,
        pathToFileURL(htmlFile).href,
      ],
      { timeout: 120_000 },
    );
  } finally {
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
  if (!(await exists(pdfFile))) throw new Error("O navegador terminou sem gerar o PDF.");
}
