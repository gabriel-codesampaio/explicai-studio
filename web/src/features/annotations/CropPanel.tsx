import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { saveAnnotations } from "@/lib/annotationStore";
import type { Annotations, Highlight } from "@/lib/annotations";
import { cropAnnotations } from "@/lib/cropAnnotations";
import { cropImage, snapCrop } from "@/lib/cropImage";
import { t, tn } from "@/lib/i18n";
import { loadImage, redactableType } from "@/lib/redactImage";

interface Props {
  slug: string;
  asset: string;
  src: string;
  /** Marcações do rascunho (com o que ainda não foi salvo): são elas que seguem para a imagem recortada. */
  annotations: Annotations;
  crop: Highlight[];
  /** Há áreas a ocultar ainda não aplicadas: as duas operações não se misturam. */
  hasRedactions: boolean;
  inGit: boolean;
  onDiscard: () => void;
  /** A imagem já foi trocada no disco; recebe as marcações remapeadas. */
  onApplied: (next: Annotations) => void;
}

/** Linha "Recortar imagem" com Aplicar e Descartar. Aplicar pede confirmação e lista o que some com o recorte. */
export function CropPanel({ slug, asset, src, annotations, crop, hasRedactions, inGit, onDiscard, onApplied }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rect = crop[0];
  // Pré-visualização com o retângulo livre; ao pedir Aplicar, vale a conta com pixels inteiros (a que o recorte usa).
  const [exact, setExact] = useState<ReturnType<typeof cropAnnotations>["removed"] | null>(null);
  const removed = confirming && exact ? exact : rect ? cropAnnotations(annotations, rect).removed : null;
  const total = removed ? removed.markers + removed.highlights + removed.arrows + removed.hotspots : 0;
  const list = removed
    ? [
        removed.markers > 0 && tn(removed.markers, "{n} marcador", "{n} marcadores"),
        removed.highlights > 0 && tn(removed.highlights, "{n} destaque", "{n} destaques"),
        removed.arrows > 0 && tn(removed.arrows, "{n} seta", "{n} setas"),
        removed.hotspots > 0 && tn(removed.hotspots, "{n} área clicável", "{n} áreas clicáveis"),
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const summary = tn(total, "{n} marcação será removida", "{n} marcações serão removidas");

  const ask = async () => {
    setError(null);
    if (!rect) return;
    if (!redactableType(asset)) {
      setError(t("Não dá para recortar SVG ou GIF. Use um print em PNG, JPEG ou WebP."));
    } else if (hasRedactions) {
      setError(t("Aplique ou descarte as áreas a ocultar antes de recortar."));
    } else {
      try {
        const img = await loadImage(src);
        const snapped = snapCrop(rect, img.naturalWidth, img.naturalHeight);
        if (snapped.w === 1 && snapped.h === 1) {
          setError(t("O recorte cobre a imagem inteira. Reduza o retângulo."));
          return;
        }
        setExact(cropAnnotations(annotations, snapped).removed);
        setConfirming(true);
      } catch {
        setError(t("Não foi possível recortar. A imagem não foi alterada."));
      }
    }
  };

  const apply = async () => {
    if (!rect) return;
    setBusy(true);
    try {
      const used = await cropImage(slug, asset, src, rect);
      const next = cropAnnotations(annotations, used).annotations;
      onApplied(next);
      await saveAnnotations(slug, asset, next).catch(() =>
        setError(t("A imagem foi recortada, mas as marcações não foram gravadas. Salve de novo.")),
      );
    } catch {
      setError(t("Não foi possível recortar. A imagem não foi alterada."));
    } finally {
      setConfirming(false);
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-2 rounded-md border border-border p-3" aria-label={t("Recortar imagem")}>
      <h3 className="rotulo">{t("Recortar imagem")}</h3>
      <p className="text-sm">{rect ? t("Para ajustar o retângulo, use Selecionar (V). Depois aplique.") : t("Arraste sobre a parte que deve ficar.")}</p>
      {total > 0 && (
        <p role="note" className="text-sm text-muted-foreground">
          {summary}: {list}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => void ask()} disabled={!rect}>
          {t("Aplicar recorte")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard} disabled={!rect}>
          {t("Descartar")}
        </Button>
      </div>
      {confirming && (
        <ConfirmDialog
          title={t("Recortar a imagem?")}
          confirmLabel={busy ? t("Recortando…") : t("Recortar e apagar o original")}
          busy={busy}
          onConfirm={() => void apply()}
          onCancel={() => setConfirming(false)}
        >
          <p>{t("Isto troca o print pela parte recortada. O original será apagado e não dá para voltar.")}</p>
          {total > 0 && (
            <p>
              {summary}: {list}.
            </p>
          )}
          {inGit && <p>{t("Esta pasta está no git: o original continua no histórico, e limpar o histórico é com você.")}</p>}
          <p>{t("Exportações anteriores ainda têm o original. Exporte de novo e apague os arquivos antigos.")}</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
