import { t } from "@/lib/i18n";

/** Faixa fixa no topo da página de um manual de formato mais novo: ele abre só para leitura. */
export function FormatNewerNotice({ version }: { version: number }) {
  return (
    <p role="status" className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
      {t(
        "Este manual usa o formato {version}, mais novo que o deste Studio. Ele está aberto só para leitura e não será alterado. Atualize o Studio (npx explicai@latest) para editar.",
        { version },
      )}
    </p>
  );
}
