import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type Annotations,
  addShape,
  findItem,
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

/** Tamanho (em fração da imagem) da forma que nasce pelo teclado: Enter cria um retângulo ou uma seta nesse porte. */
const KEY_SHAPE = { w: 0.2, h: 0.1 };
const CURSOR_STEP = 0.02;
const CURSOR_STEP_BIG = 0.1;
const CURSOR_KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const clamp01 = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

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
  // Cursor do teclado: onde o Enter cria a marcação (começa no centro e anda com as setas).
  const [cursor, setCursor] = useState<Point>({ x: 0.5, y: 0.5 });
  const [announcement, setAnnouncement] = useState("");

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

  /** Grava o rascunho novo e informa qual id nasceu nele. */
  const commit = (next: Draft) => {
    const old = new Set(draftIds(draft));
    const created = draftIds(next).find((id) => !old.has(id));
    onChange(next, created ?? null);
    return created ?? null;
  };

  /** Enter no canvas focado: cria a marcação da ferramenta ativa no cursor e a anuncia. */
  const createAtCursor = () => {
    if (tool === "select") return;
    // Perto da borda, a forma recua para caber inteira na imagem.
    const c =
      tool === "marker"
        ? cursor
        : {
            x: clamp01(cursor.x, KEY_SHAPE.w / 2, 1 - KEY_SHAPE.w / 2),
            y: clamp01(cursor.y, KEY_SHAPE.h / 2, 1 - KEY_SHAPE.h / 2),
          };
    const a = tool === "marker" ? c : { x: c.x - KEY_SHAPE.w / 2, y: c.y - KEY_SHAPE.h / 2 };
    const b = tool === "marker" ? c : { x: c.x + KEY_SHAPE.w / 2, y: c.y + KEY_SHAPE.h / 2 };
    const next = drawn(draft, tool, a, b, defaultTarget);
    if (!next) return;
    commit(next);
    const kind = {
      marker: `${t("Marcador")} ${next.ann.markers.length}`,
      highlight: t("Destaque"),
      arrow: t("Seta"),
      hotspot: t("Área clicável"),
      redact: t("Ocultar"),
      crop: t("Recortar"),
    }[tool];
    setAnnouncement(
      t("Nova marcação: {kind}, em {x}% da largura e {y}% da altura. Setas movem.", {
        kind,
        x: Math.round(c.x * 100),
        y: Math.round(c.y * 100),
      }),
    );
  };

  const onCanvasKey = (e: React.KeyboardEvent) => {
    if (!drawing || e.target !== e.currentTarget) return;
    if (e.key === "Enter") {
      e.preventDefault();
      return createAtCursor();
    }
    const dir = CURSOR_KEYS[e.key];
    // Com uma marcação selecionada, as setas a movem (o editor trata); sem ela, movem o cursor.
    if (!dir || (selectedId && findItem(draft.ann, selectedId))) return;
    e.preventDefault();
    const step = e.shiftKey ? CURSOR_STEP_BIG : CURSOR_STEP;
    setCursor({ x: clamp01(cursor.x + dir[0] * step), y: clamp01(cursor.y + dir[1] * step) });
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
    commit(next);
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
      // biome-ignore lint/a11y/noNoninteractiveTabindex: widget de teclado (Tab chega; Enter cria, setas movem o cursor ou a marcação selecionada).
      tabIndex={0}
      role="application"
      aria-label={t("Imagem para marcar")}
      aria-describedby={drawing ? "canvas-keys-hint" : undefined}
      onKeyDown={onCanvasKey}
      className={cn(
        "group relative inline-block max-w-full outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary touch-none select-none",
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
      <span id="canvas-keys-hint" className="sr-only">
        {t("Setas movem o cursor e Enter cria a marcação.")}
      </span>
      <span role="status" className="sr-only">
        {announcement}
      </span>
      {drawing && !selectedId && (
        <span
          aria-hidden
          style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
          className="pointer-events-none absolute z-10 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background/60 shadow-[0_0_0_2px_#fff] group-focus-visible:block"
        />
      )}
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
