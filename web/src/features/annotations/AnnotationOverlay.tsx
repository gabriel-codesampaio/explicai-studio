import { Link2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { Annotations, Point } from "@/lib/annotations";
import { cn } from "@/lib/utils";

interface Props {
  annotations: Annotations;
  selectedId?: string | null;
  /** No editor de marcações, clicar numa marcação seleciona. Na página, a camada só mostra. */
  onSelect?: (id: string) => void;
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

/** Ponta da seta: triângulo na direção de `from` para `to`, em pixels. */
function arrowHead(from: Point, to: Point, size = 12): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const wing = (a: number) => `${to.x - size * Math.cos(angle + a)},${to.y - size * Math.sin(angle + a)}`;
  return `${to.x},${to.y} ${wing(0.45)} ${wing(-0.45)}`;
}

/**
 * Camada sobre a imagem: destaques em marca-texto, áreas clicáveis tracejadas, setas e marcadores
 * numerados em cobalto. Coordenadas de 0 a 1 viram pixels pelo tamanho atual da imagem.
 */
export function AnnotationOverlay({ annotations, selectedId, onSelect }: Props) {
  const { ref, size } = useSize();
  const px = (p: Point) => ({ x: p.x * size.w, y: p.y * size.h });
  const interactive = Boolean(onSelect);
  const pick = (id: string) => (e: React.PointerEvent) => {
    if (!onSelect) return;
    e.stopPropagation();
    onSelect(id);
  };
  const ring = (id: string) => (id === selectedId ? "outline-2 outline-offset-2 outline-primary" : "");

  return (
    <span ref={ref} className={cn("absolute inset-0 block", !interactive && "pointer-events-none")} aria-hidden>
      {annotations.highlights.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn("absolute block rounded-[3px] border-2 border-marca bg-marca/25 mix-blend-multiply dark:bg-marca/30 dark:mix-blend-normal", ring(h.id))}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        />
      ))}
      {annotations.hotspots.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn("absolute block rounded-[3px] border-2 border-dashed border-primary bg-primary/8", ring(h.id))}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        >
          <Link2 className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-primary p-0.5 text-primary-foreground" />
        </span>
      ))}
      {size.w > 0 && annotations.arrows.length > 0 && (
        <svg className="absolute inset-0 overflow-visible" width={size.w} height={size.h} role="presentation">
          {annotations.arrows.map((a) => {
            const from = px(a.from);
            const to = px(a.to);
            return (
              <g key={a.id} onPointerDown={pick(a.id)} className={cn(interactive && "cursor-pointer")}>
                {/* Faixa larga e transparente para facilitar o clique na seta. */}
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={14} />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--cobalto)"
                  strokeWidth={a.id === selectedId ? 5 : 3.5}
                  strokeLinecap="round"
                />
                <polygon points={arrowHead(from, to)} fill="var(--cobalto)" />
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
            "absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary font-mono text-[13px] font-semibold text-primary-foreground shadow-[0_0_0_2px_var(--superficie),0_2px_6px_rgb(21_26_51/0.35)]",
            ring(m.id),
          )}
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
        >
          {m.n}
        </span>
      ))}
    </span>
  );
}
