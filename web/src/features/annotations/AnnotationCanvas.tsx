import { useRef, useState } from "react";
import {
  type Annotations,
  addShape,
  type Handle,
  type HotspotTarget,
  isTooSmall,
  moveAnnotation,
  type Point,
  type Tool,
} from "@/lib/annotations";
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

/**
 * Área de desenho: clique põe marcador; arrastar desenha destaque, seta ou área clicável.
 * Com "Selecionar", arrastar uma marcação move, e as alças redimensionam. A mudança só é gravada
 * no rascunho ao soltar, então cada arraste é um passo do "Desfazer".
 */
export function AnnotationCanvas({ src, alt, annotations, tool, selectedId, defaultTarget, onChange, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ from: Point; to: Point } | null>(null);
  const [grab, setGrab] = useState<{ id: string; handle: Handle; from: Point; to: Point } | null>(null);
  const drawing = tool !== "select";

  // Prévia do que está sendo desenhado ou movido, usando a mesma camada da imagem final.
  const preview = grab
    ? moveAnnotation(annotations, grab.id, grab.handle, grab.to.x - grab.from.x, grab.to.y - grab.from.y)
    : drag && tool !== "select" && tool !== "marker"
      ? addShape(annotations, tool, drag.from, drag.to, defaultTarget)
      : null;

  /** Continua recebendo o arraste mesmo se o ponteiro sair da imagem. */
  const capture = (e: React.PointerEvent) => {
    if (box.current?.hasPointerCapture?.(e.pointerId) === false) {
      try {
        box.current.setPointerCapture(e.pointerId);
      } catch {
        // Ponteiro já liberado (ex.: evento sintético): segue sem captura.
      }
    }
  };

  const finish = (to: Point) => {
    if (grab) {
      setGrab(null);
      // Clique sem arrastar só seleciona.
      if (!isTooSmall(grab.from, to)) {
        onChange(moveAnnotation(annotations, grab.id, grab.handle, to.x - grab.from.x, to.y - grab.from.y), grab.id);
      }
      return;
    }
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
        capture(e);
        setDrag({ from: p, to: p });
      }}
      onPointerMove={(e) => {
        if (!box.current) return;
        if (grab) setGrab({ ...grab, to: pointIn(box.current, e) });
        else if (drag) setDrag({ ...drag, to: pointIn(box.current, e) });
      }}
      onPointerUp={(e) => box.current && finish(pointIn(box.current, e))}
    >
      <img src={src} alt={alt} draggable={false} className="block max-h-[70vh] max-w-full rounded-md border border-border" />
      <AnnotationOverlay
        annotations={preview ?? annotations}
        selectedId={selectedId}
        onGrab={
          drawing
            ? undefined
            : (id, handle, e) => {
                if (!box.current) return;
                onSelect(id);
                capture(e);
                const p = pointIn(box.current, e);
                setGrab({ id, handle, from: p, to: p });
              }
        }
      />
    </div>
  );
}
