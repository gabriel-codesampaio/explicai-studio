import { useState } from "react";
import { saveAnnotations, useAnnotations } from "@/lib/annotationStore";
import { assetPathFromSrc, emptyAnnotations, type ImageDisplay, warnsSmall } from "@/lib/annotations";
import { t } from "@/lib/i18n";

const SIZES: { id: ImageDisplay; label: () => string }[] = [
  { id: "s", label: () => t("Pequena") },
  { id: "m", label: () => t("Média") },
  { id: "full", label: () => t("Larga") },
];

/**
 * Tamanho da imagem na página e no manual exportado. Grava `display` no JSON ao lado da imagem
 * (vale em todo lugar onde ela aparece). Sem escolha gravada, Larga aparece como atual (a imagem é como sempre foi).
 */
export function ImageSizePicker({ slug, src }: { slug: string; src: string }) {
  const asset = assetPathFromSrc(src);
  const annotations = useAnnotations(slug, asset);
  const [failed, setFailed] = useState(false);
  if (!asset) return null;
  // Sem escolha gravada a imagem aparece na largura total, então "Larga" é o tamanho em uso.
  const current = annotations ? (annotations.display ?? "full") : undefined;

  const choose = (display: ImageDisplay) => {
    setFailed(false);
    saveAnnotations(slug, asset, { ...(annotations ?? emptyAnnotations()), display }).catch(() => setFailed(true));
  };

  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1 text-sm font-bold">{t("Tamanho da imagem")}</legend>
      <div className="flex flex-wrap gap-1.5">
        {SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={current === s.id}
            disabled={!annotations}
            onClick={() => choose(s.id)}
            className="min-h-11 min-w-11 rounded-md border border-border px-3 py-1 text-sm hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:font-bold aria-pressed:ring-1 aria-pressed:ring-primary disabled:opacity-50"
          >
            {s.label()}
          </button>
        ))}
      </div>
      {annotations && warnsSmall(annotations) && (
        <p role="status" className="text-xs text-muted-foreground">
          {t("Com {n} marcadores, a imagem pequena pode amontoá-los. Experimente Média.", { n: annotations.markers.length })}
        </p>
      )}
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          {t("Não foi possível salvar o tamanho.")}
        </p>
      )}
    </fieldset>
  );
}
