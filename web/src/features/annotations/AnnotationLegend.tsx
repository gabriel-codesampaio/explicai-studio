import { legendRows } from "@/lib/annotationShapes";
import type { Marker } from "@/lib/annotations";
import { t } from "@/lib/i18n";

/** Legenda numerada da imagem: uma linha por marcador com descrição. Mesmo desenho do export (.legend). */
export function AnnotationLegend({ markers }: { markers: Marker[] }) {
  const rows = legendRows(markers);
  if (rows.length === 0) return null;
  return (
    <ol className="annotation-legend mt-4 grid gap-1.5 text-[15px] leading-[1.4]" aria-label={t("Legenda da imagem")}>
      {rows.map((r) => (
        <li key={r.n} className="flex items-center gap-2.5">
          <span className="inline-grid h-6 min-w-6 place-items-center px-1 rounded-full bg-anotacao font-mono text-[13px] font-semibold text-sobre-anotacao">
            {r.n}
          </span>
          <span>{r.label}</span>
        </li>
      ))}
    </ol>
  );
}
