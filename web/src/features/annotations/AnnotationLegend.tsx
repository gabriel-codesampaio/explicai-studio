import { legendRows } from "@/lib/annotationShapes";
import { type AnnotationStyle, styleVars } from "@/lib/annotationStyle";
import type { Marker } from "@/lib/annotations";
import { t } from "@/lib/i18n";

/** Legenda numerada da imagem: uma linha por marcador com descrição. Mesmo desenho do export (.legend). */
export function AnnotationLegend({ markers, style }: { markers: Marker[]; style?: AnnotationStyle }) {
  const rows = legendRows<AnnotationStyle>(markers);
  if (rows.length === 0) return null;
  return (
    <ol
      className="annotation-legend mt-4 grid gap-1.5 text-[15px] leading-[1.4]"
      style={styleVars(style, true)}
      aria-label={t("Legenda da imagem")}
    >
      {rows.map((r) => (
        <li key={r.n} className="flex items-center gap-2.5" style={styleVars(r.style && { color: r.style.color }, true)}>
          <span className="num-chip bg-anotacao text-sobre-anotacao">{r.n}</span>
          <span>{r.label}</span>
        </li>
      ))}
    </ol>
  );
}
