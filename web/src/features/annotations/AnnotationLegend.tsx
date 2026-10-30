import { legendRows } from "@/lib/annotationShapes";
import type { Marker } from "@/lib/annotations";
import { t } from "@/lib/i18n";

/** Legenda numerada da imagem: uma linha por descrição; marcadores sem descrição em sequência dividem uma. Mesmo desenho do export (.legend). */
export function AnnotationLegend({ markers }: { markers: Marker[] }) {
  if (markers.length === 0) return null;
  return (
    <ol className="mt-3 grid gap-0.5 text-[15px] leading-[1.4]" aria-label={t("Legenda da imagem")}>
      {legendRows(markers).map((r) => (
        <li key={r.numbers[0]} className="flex items-baseline gap-1">
          {r.numbers.map((n) => (
            <span
              key={n}
              className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-anotacao font-mono text-[11px] font-semibold text-sobre-anotacao"
            >
              {n}
            </span>
          ))}
          <span className={r.label ? "ml-0.5" : "ml-0.5 text-muted-foreground italic"}>{r.label || t("Sem descrição")}</span>
        </li>
      ))}
    </ol>
  );
}
