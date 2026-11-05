import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type Annotations,
  addShape,
  type Handle,
  type Highlight,
  type HotspotTarget,
  isTooSmall,
  moveAnnotation,
  type Point,
  type Tool,
} from "@/lib/annotations";
import { t } from "@/lib/i18n";
import { addRedaction, moveRedaction, type RedactStyle } from "@/lib/redact";
import { cn } from "@/lib/utils";
import { AnnotationOverlay } from "./AnnotationOverlay";

/** O que o editor está montando: as marcações (que vão para o JSON) e as áreas a ocultar (só na memória). */
export interface Draft {
  ann: Annotations;
  redact: Highlight[];
  /** Retângulo do recorte (no máximo um), também só na memória até aplicar. */
  crop: Highlight[];
}

interface Props {
  src: string;
  alt: string;
  draft: Draft;
  tool: Tool;
  selectedId: string | null;
  /** Destino inicial de uma área clicável nova (a pessoa ajusta na lista ao lado). */
  defaultTarget: HotspotTarget;
  redactStyle: RedactStyle;
  onChange: (next: Draft, createdId: string | null) => void;
  onSelect: (id: string | null) => void;
}

/** Ponto do evento em coordenadas de 0 a 1 da imagem. */
function pointIn(el: HTMLElement, e: React.PointerEvent): Point {
  const r = el.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}

const idsOf = (a: Annotations) => [...a.markers, ...a.highlights, ...a.arrows, ...a.hotspots].map((item) => item.id);

const draftIds = (d: Draft) => [...idsOf(d.ann), ...d.redact.map((r) => r.id), ...d.crop.map((r) => r.id)];

/** Rascunho com o `id` arrastado por (dx, dy); id que não existe num dos lados não muda nada ali. */
function moved(draft: Draft, id: string, handle: Handle, dx: number, dy: number): Draft {
  return {
    ann: moveAnnotation(draft.ann, id, handle, dx, dy),
    redact: moveRedaction(draft.redact, id, handle, dx, dy),
    crop: moveRedaction(draft.crop, id, handle, dx, dy),
  };
}

/** Rascunho com a forma desenhada entre `a` e `b`, ou null se o arraste foi curto demais. */
function drawn(draft: Draft, tool: Exclude<Tool, "select">, a: Point, b: Point, target: HotspotTarget): Draft | null {
  if (tool === "redact") {
    const redact = addRedaction(draft.redact, a, b);
    return redact && { ...draft, redact };
  }
  if (tool === "crop") {
    // Um recorte só: desenhar de novo troca o anterior.
    const crop = addRedaction([], a, b);
    return crop && { ...draft, crop };
  }
  const ann = addShape(draft.ann, tool, a, b, target);
  return ann && { ...draft, ann };
}

/**
 * Área de desenho: clique põe marcador; arrastar desenha destaque, seta, área clicável ou área a ocultar.
 * Com "Selecionar", arrastar uma marcação move, e as alças redimensionam. A mudança só é gravada
 * no rascunho ao soltar, então cada arraste é um passo do "Desfazer".
 */
export function AnnotationCanvas({ src, alt, draft, tool, selectedId, defaultTarget, redactStyle, onChange, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [drag, setDrag] = useState<{ from: Point; to: Point } | null>(null);
  const [grab, setGrab] = useState<{ id: string; handle: Handle; from: Point; to: Point } | null>(null);
  const drawing = tool !== "select";

  // Prévia do que está sendo desenhado ou movido, usando a mesma camada da imagem final.
  const preview = grab
    ? moved(draft, grab.id, grab.handle, grab.to.x - grab.from.x, grab.to.y - grab.from.y)
    : drag && tool !== "select" && tool !== "marker"
      ? drawn(draft, tool, drag.from, drag.to, defaultTarget)
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
      if (!isTooSmall(grab.from, to))
        onChange(moved(draft, grab.id, grab.handle, to.x - grab.from.x, to.y - grab.from.y), grab.id);
      return;
    }
    if (!drag || tool === "select") return;
    const next = drawn(draft, tool, drag.from, to, defaultTarget);
    setDrag(null);
    if (!next) return;
    const old = new Set(draftIds(draft));
    const created = draftIds(next).find((id) => !old.has(id));
    onChange(next, created ?? null);
  };

  const shown = preview ?? draft;

  // Imagem que não abre deixaria o canvas vazio, sem aviso: mostra o motivo e deixa tentar de novo.
  if (failedSrc === src) {
    return (
      <div role="alert" className="grid justify-items-center gap-2 text-sm text-destructive">
        <span>{t("Não foi possível carregar a imagem para marcar.")}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setFailedSrc(null);
            setAttempt((n) => n + 1);
          }}
          className="[@media(pointer:coarse)]:h-11"
        >
          {t("Tentar de novo")}
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={box}
      data-annotation-canvas
      // Foco no canvas ao clicar: Delete e setas valem ali (o teclado do editor escuta a janela toda).
      tabIndex={-1}
      className={cn(
        "relative inline-block max-w-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 touch-none select-none",
        drawing ? "cursor-crosshair" : "cursor-default",
      )}
      onPointerDown={(e) => {
        if (!box.current) return;
        if (!drawing) return onSelect(null);
        const p = pointIn(box.current, e);
        if (tool === "marker") {
          // Marcador é um clique: entra na hora, sem esperar o botão ser solto.
          const next = drawn(draft, "marker", p, p, defaultTarget);
          return next && onChange(next, next.ann.markers.at(-1)?.id ?? null);
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
      <img
        key={attempt}
        src={src}
        alt={alt}
        draggable={false}
        onError={() => setFailedSrc(src)}
        className="block max-h-[70vh] max-w-full rounded-md border border-border"
      />
      <AnnotationOverlay
        annotations={shown.ann}
        redactions={shown.redact}
        redactStyle={redactStyle}
        crops={shown.crop}
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
