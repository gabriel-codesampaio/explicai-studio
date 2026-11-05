import { type DiffRow, type LineDiff, MAX_DIFF_LINES } from "@/lib/conflictDiff";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PANEL =
  "min-w-0 overflow-x-auto rounded-md border border-border bg-card font-mono text-xs leading-5 focus-visible:outline-2 focus-visible:outline-ring";

/** Uma linha de um painel. Removida/adicionada levam prefixo e texto para leitor de tela: a cor sozinha não basta. */
function Line({ text, mark }: { text: string | null; mark: "same" | "removed" | "added" }) {
  // Lado vazio do par: só segura o alinhamento com o outro painel.
  if (text === null) return <div aria-hidden className="min-h-5 bg-muted/60" />;
  return (
    <div
      className={cn(
        "flex min-h-5 w-max min-w-full whitespace-pre px-2",
        mark === "removed" && "bg-red-500/15",
        mark === "added" && "bg-emerald-500/15",
      )}
    >
      <span aria-hidden className="w-4 shrink-0 select-none font-bold">
        {mark === "removed" ? "−" : mark === "added" ? "+" : ""}
      </span>
      {mark !== "same" && <span className="sr-only">{mark === "removed" ? t("Removida:") : t("Adicionada:")} </span>}
      {text}
    </div>
  );
}

/** Diff por linha em dois painéis: a versão guardada à esquerda e o texto atual à direita. Só leitura. */
export function VersionDiff({ diff, name }: { diff: LineDiff; name: string }) {
  if (diff === null) return <p className="text-sm text-muted-foreground">{t("Sem diferenças")}</p>;
  if ("tooBig" in diff)
    return (
      <p role="alert" className="text-sm">
        {t("A página tem mais de {n} linhas e é grande demais para comparar aqui.", { n: MAX_DIFF_LINES })}
      </p>
    );
  const side = (key: "left" | "right", mark: "removed" | "added") => (r: DiffRow, i: number) => (
    <Line key={i} text={r[key]} mark={r.changed ? mark : "same"} />
  );
  return (
    <div className="grid gap-2">
      {diff.coarse && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("São muitas mudanças: o trecho que difere aparece todo como removido e adicionado.")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {/* Painel rolável precisa de foco para rolar pelo teclado. */}
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: região rolável em foco, para rolar pelo teclado */}
        <section tabIndex={0} aria-label={t("Versão guardada: {nome}", { nome: name })} className={PANEL}>
          {diff.rows.map(side("left", "removed"))}
        </section>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: região rolável em foco, para rolar pelo teclado */}
        <section tabIndex={0} aria-label={t("Texto atual da página")} className={PANEL}>
          {diff.rows.map(side("right", "added"))}
        </section>
      </div>
    </div>
  );
}
