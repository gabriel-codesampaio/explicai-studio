import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import type { Highlight } from "@/lib/annotations";
import { t, tn } from "@/lib/i18n";
import { redactableType, redactImage } from "@/lib/redactImage";

interface Props {
  slug: string;
  asset: string;
  src: string;
  rects: Highlight[];
  /** A pasta do manual está num repositório git. */
  inGit: boolean;
  onDiscard: () => void;
  /** A imagem já foi trocada no disco. */
  onApplied: () => void;
}

/** Linha "N áreas a ocultar" com Aplicar e Descartar. Aplicar pede confirmação, porque troca o arquivo e apaga o original. */
export function RedactPanel({ slug, asset, src, rects, inGit, onDiscard, onApplied }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = () => {
    setError(null);
    if (!redactableType(asset)) {
      setError(t("Não dá para ocultar dados em SVG ou GIF. Use um print em PNG, JPEG ou WebP."));
      return;
    }
    setConfirming(true);
  };

  const apply = async () => {
    setBusy(true);
    try {
      await redactImage(slug, asset, src, rects);
      onApplied();
    } catch {
      setError(t("Não foi possível ocultar as áreas. A imagem não foi alterada."));
    } finally {
      setConfirming(false);
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-2 rounded-md border border-border p-3" aria-label={t("Ocultar dados")}>
      <h3 className="rotulo">{t("Ocultar dados")}</h3>
      <p className="text-sm">
        {rects.length === 0
          ? t("Arraste sobre o dado que deve sumir.")
          : tn(rects.length, "{n} área a ocultar", "{n} áreas a ocultar")}
      </p>
      {inGit && (
        <p role="note" className="text-sm text-muted-foreground">
          {t("Esta pasta está no git: o print original continua no histórico depois de ocultar.")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={ask} disabled={rects.length === 0}>
          {t("Aplicar ocultação")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard} disabled={rects.length === 0}>
          {t("Descartar")}
        </Button>
      </div>
      {confirming && (
        <ConfirmDialog
          title={t("Ocultar as áreas marcadas?")}
          confirmLabel={busy ? t("Ocultando…") : t("Ocultar e apagar o original")}
          busy={busy}
          onConfirm={() => void apply()}
          onCancel={() => setConfirming(false)}
        >
          <p>{t("Isto troca o print por uma versão com as áreas cobertas. O original será apagado e não dá para voltar.")}</p>
          {inGit && <p>{t("Esta pasta está no git: o original continua no histórico, e limpar o histórico é com você.")}</p>}
          <p>{t("Exportações anteriores ainda têm o original. Exporte de novo e apague os arquivos antigos.")}</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
