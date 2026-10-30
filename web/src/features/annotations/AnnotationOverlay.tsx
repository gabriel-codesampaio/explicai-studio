import { Link2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { arrowShape } from "@/lib/annotationShapes";
import type { Annotations, Handle, Point, Rect } from "@/lib/annotations";
import { cn } from "@/lib/utils";

interface Props {
  annotations: Annotations;
  selectedId?: string | null;
  /**
   * No editor de marcações, apertar numa marcação (ou numa alça dela) começa a mover ou redimensionar.
   * Na página, a camada só mostra.
   */
  onGrab?: (id: string, handle: Handle, e: React.PointerEvent) => void;
}

/** Tamanho real da camada em pixels, para desenhar setas e retângulos sem deformar. */
function useSize() {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

/**
 * Camada sobre a imagem: destaques em marca-texto, áreas clicáveis tracejadas, setas e marcadores
 * numerados em cobalto. Coordenadas de 0 a 1 viram pixels pelo tamanho atual da imagem.
 */
export function AnnotationOverlay({ annotations, selectedId, onGrab }: Props) {
  const { ref, size } = useSize();
  const px = (p: Point) => ({ x: p.x * size.w, y: p.y * size.h });
  const interactive = Boolean(onGrab);
  const pick =
    (id: string, handle: Handle = "move") =>
    (e: React.PointerEvent) => {
      if (!onGrab) return;
      e.stopPropagation();
      onGrab(id, handle, e);
    };
  const selectedRect: Rect | undefined = [...annotations.highlights, ...annotations.hotspots].find(
    (r) => "id" in r && r.id === selectedId,
  );
  const selectedArrow = annotations.arrows.find((a) => a.id === selectedId);
  // Alça quadrada branca: arrastar muda o tamanho (canto) ou a ponta da seta.
  const handle = (key: Handle, p: Point, cursor: string) => (
    <span
      key={key}
      onPointerDown={selectedId ? pick(selectedId, key) : undefined}
      className="absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-primary bg-white"
      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, cursor }}
    />
  );
  // Destaque e área clicável são conteúdo do manual: rounded-[3px] fixo, igual ao .hl/.hot do export (src/core/export/html.ts).
  const ring = (id: string) => (id === selectedId ? "outline-2 outline-offset-2 outline-primary" : "");

  return (
    <span ref={ref} className={cn("absolute inset-0 block", !interactive && "pointer-events-none")} aria-hidden>
      {annotations.highlights.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn(
            "absolute block rounded-[3px] border-2 border-marca before:absolute before:inset-0 before:bg-marca before:mix-blend-multiply before:content-['']",
            ring(h.id),
            interactive && "cursor-move",
          )}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        />
      ))}
      {annotations.hotspots.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn(
            "absolute block rounded-[3px] border-2 border-dashed border-anotacao bg-anotacao/8",
            ring(h.id),
            interactive && "cursor-move",
          )}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        >
          <Link2 className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-anotacao p-0.5 text-white" />
        </span>
      ))}
      {size.w > 0 && annotations.arrows.length > 0 && (
        <svg className="absolute inset-0 overflow-visible" width={size.w} height={size.h} role="presentation">
          {annotations.arrows.map((a) => {
            const thickness = a.id === selectedId ? 5 : 3.5;
            const { shaft, head } = arrowShape(px(a.from), px(a.to), thickness);
            const pts = head.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <g key={a.id} onPointerDown={pick(a.id)} className={cn(interactive && "cursor-move")}>
                {/* Faixa larga e transparente para facilitar o clique na seta. */}
                <line x1={px(a.from).x} y1={px(a.from).y} x2={px(a.to).x} y2={px(a.to).y} stroke="transparent" strokeWidth={14} />
                {/* Contorno branco: a seta se lê sobre print claro e escuro (igual ao .halo do export). */}
                <g stroke="#fff" strokeOpacity={0.9} strokeLinejoin="round" strokeLinecap="round">
                  <line x1={shaft.x1} y1={shaft.y1} x2={shaft.x2} y2={shaft.y2} strokeWidth={thickness * 2.2} />
                  <polygon points={pts} fill="#fff" strokeWidth={thickness * 1.2} />
                </g>
                <line
                  x1={shaft.x1}
                  y1={shaft.y1}
                  x2={shaft.x2}
                  y2={shaft.y2}
                  stroke="var(--anotacao)"
                  strokeWidth={thickness}
                  strokeLinecap="round"
                />
                <polygon points={pts} fill="var(--anotacao)" />
              </g>
            );
          })}
        </svg>
      )}
      {annotations.markers.map((m) => (
        <span
          key={m.id}
          onPointerDown={pick(m.id)}
          className={cn(
            "absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-anotacao shadow-[0_0_0_2px_#fff,inset_0_0_0_2px_#fff]",
            "before:absolute before:-top-3 before:-left-3 before:grid before:size-5 before:place-items-center before:rounded-full before:bg-anotacao before:font-mono before:text-[11px] before:font-semibold before:text-sobre-anotacao before:shadow-[0_0_0_2px_#fff] before:content-[attr(data-n)]",
            ring(m.id),
            interactive && "cursor-move",
          )}
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
          // O número vem do CSS: dentro do editor, um texto aqui entraria no conteúdo lido pelo leitor de tela.
          data-n={m.n}
        />
      ))}
      {interactive &&
        selectedRect && [
          handle("nw", { x: selectedRect.x, y: selectedRect.y }, "nwse-resize"),
          handle("ne", { x: selectedRect.x + selectedRect.w, y: selectedRect.y }, "nesw-resize"),
          handle("sw", { x: selectedRect.x, y: selectedRect.y + selectedRect.h }, "nesw-resize"),
          handle("se", { x: selectedRect.x + selectedRect.w, y: selectedRect.y + selectedRect.h }, "nwse-resize"),
        ]}
      {interactive && selectedArrow && [handle("from", selectedArrow.from, "move"), handle("to", selectedArrow.to, "move")]}
    </span>
  );
}
