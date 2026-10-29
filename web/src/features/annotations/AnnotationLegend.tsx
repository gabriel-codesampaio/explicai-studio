import type { Marker } from "@/lib/annotations";

/** Legenda numerada que acompanha a imagem: um item por marcador, na ordem dos números. */
export function AnnotationLegend({ markers }: { markers: Marker[] }) {
  if (markers.length === 0) return null;
  return (
    <ol className="mt-2 grid gap-1 text-[15px]" aria-label="Legenda da imagem">
      {[...markers]
        .sort((a, b) => a.n - b.n)
        .map((m) => (
          <li key={m.id} className="flex items-start gap-2">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-anotacao font-mono text-[11px] font-semibold text-white">
              {m.n}
            </span>
            <span className={m.label ? "" : "text-muted-foreground italic"}>{m.label || "Sem descrição"}</span>
          </li>
        ))}
    </ol>
  );
}
