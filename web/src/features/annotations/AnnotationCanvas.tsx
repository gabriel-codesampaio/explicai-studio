import { useRef, useState } from "react";
import { type Annotations, addShape, type HotspotTarget, type Point, type Tool } from "@/lib/annotations";
import { cn } from "@/lib/utils";
import { AnnotationOverlay } from "./AnnotationOverlay";

interface Props {
  src: string;
  alt: string;
  annotations: Annotations;
  tool: Tool;
  selectedId: string | null;
  /** Destino inicial de uma área clicável nova (a pessoa ajusta na lista ao lado). */
  defaultTarget: HotspotTarget;
  onChange: (next: Annotations, createdId: string | null) => void;
  onSelect: (id: string | null) => void;
}

/** Ponto do evento em coordenadas de 0 a 1 da imagem. */
function pointIn(el: HTMLElement, e: React.PointerEvent): Point {
  const r = el.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}

/** Área de desenho: clique põe marcador; arrastar desenha destaque, seta ou área clicável. */
export function AnnotationCanvas({ src, alt, annotations, tool, selectedId, defaultTarget, onChange, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ from: Point; to: Point } | null>(null);
  const drawing = tool !== "select";

  // Prévia do que está sendo desenhado, usando a mesma camada da imagem final.
  const preview =
    drag && tool !== "select" && tool !== "marker" ? addShape(annotations, tool, drag.from, drag.to, defaultTarget) : null;

  const finish = (to: Point) => {
    if (!drag || tool === "select") return;
    const next = addShape(annotations, tool, drag.from, to, defaultTarget);
    setDrag(null);
    if (!next) return;
    const created = [...next.markers, ...next.highlights, ...next.arrows, ...next.hotspots].find(
      (item) =>
        ![...annotations.markers, ...annotations.highlights, ...annotations.arrows, ...annotations.hotspots].some(
          (old) => old.id === item.id,
        ),
    );
    onChange(next, created?.id ?? null);
  };

  return (
    <div
      ref={box}
      className={cn("relative inline-block max-w-full touch-none select-none", drawing ? "cursor-crosshair" : "cursor-default")}
      onPointerDown={(e) => {
        if (!box.current) return;
        if (!drawing) return onSelect(null);
        const p = pointIn(box.current, e);
        if (tool === "marker") {
          // Marcador é um clique: entra na hora, sem esperar o botão ser solto.
          const next = addShape(annotations, "marker", p, p, defaultTarget);
          return next && onChange(next, next.markers.at(-1)?.id ?? null);
        }
        // Continua recebendo o arraste mesmo se o ponteiro sair da imagem.
        if (e.currentTarget.hasPointerCapture?.(e.pointerId) === false) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Ponteiro já liberado (ex.: evento sintético): segue sem captura.
          }
        }
        setDrag({ from: p, to: p });
      }}
      onPointerMove={(e) => {
        if (drag && box.current) setDrag({ ...drag, to: pointIn(box.current, e) });
      }}
      onPointerUp={(e) => box.current && finish(pointIn(box.current, e))}
    >
      <img src={src} alt={alt} draggable={false} className="block max-h-[70vh] max-w-full rounded-md border border-border" />
      <AnnotationOverlay
        annotations={preview ?? annotations}
        selectedId={selectedId}
        onSelect={drawing ? undefined : (id) => onSelect(id)}
      />
    </div>
  );
}
