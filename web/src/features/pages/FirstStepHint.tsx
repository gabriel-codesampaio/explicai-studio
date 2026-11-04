import { Button } from "@/components/ui/button";
import { FIRST_STEP } from "@/features/help/firstStep";
import { t } from "@/lib/i18n";

/** Aviso da página sem texto: ensina o primeiro print e leva ao botão de exportar. Some quando a página ganha conteúdo. */
export function FirstStepHint({ onExport }: { onExport: () => void }) {
  return (
    <section
      aria-labelledby="primeiro-print"
      className="mb-5 grid gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm"
    >
      <h2 id="primeiro-print" className="font-display font-bold">
        {t(FIRST_STEP.title)}
      </h2>
      <ol className="list-decimal pl-5 text-muted-foreground">
        {FIRST_STEP.steps.map((step) => (
          <li key={step}>{t(step)}</li>
        ))}
      </ol>
      <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
        {t(FIRST_STEP.exportLine)}
        <Button type="button" variant="link" className="h-auto p-0" onClick={onExport}>
          {t(FIRST_STEP.exportButton)}
        </Button>
      </p>
    </section>
  );
}
