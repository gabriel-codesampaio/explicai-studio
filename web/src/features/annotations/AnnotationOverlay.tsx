import { Link2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { arrowShape, arrowThickness, placeMarkers } from "@/lib/annotationShapes";
import { arrowHalo, MARKER_SIZES, STROKE_SCALE, styleVars } from "@/lib/annotationStyle";
import type { Annotations, Handle, Highlight, Point, Rect } from "@/lib/annotations";
import { REDACT_CSS, type RedactStyle } from "@/lib/redact";
import { cn } from "@/lib/utils";

interface Props {
  annotations: Annotations;
  /** Áreas a ocultar do rascunho: tarja opaca com borda tracejada. Não são marcações. */
  redactions?: Highlight[];
  redactStyle?: RedactStyle;
  /** Retângulo do recorte: o que fica fora dele aparece escurecido. */
  crops?: Highlight[];
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
export function AnnotationOverlay({ annotations, redactions = [], redactStyle = "bar", crops = [], selectedId, onGrab }: Props) {
  const { ref, size } = useSize();
  const px = (p: Point) => ({ x: p.x * size.w, y: p.y * size.h });
  // Cascata item > imagem: o item só sobrescreve o que escolheu (as variáveis CSS vão no próprio elemento).
  const shapes = placeMarkers(
    annotations.markers.map(px),
    size.w,
    size.h,
    annotations.markers.map((m) => MARKER_SIZES[m.style?.size ?? annotations.style?.size ?? "m"].disc),
  );
  // Contorno do destaque e da área: a borda escolhida, ou os 2 px de sempre vezes a espessura (igual ao .hl/.hot do export).
  const border = { borderWidth: "var(--borda, calc(2px * var(--marca-espessura, 1)))" };
  const hlBorder = { ...border, borderColor: "var(--borda-destaque, var(--marca))" };
  const interactive = Boolean(onGrab);
  const pick =
    (id: string, handle: Handle = "move") =>
    (e: React.PointerEvent) => {
      if (!onGrab) return;
      e.stopPropagation();
      onGrab(id, handle, e);
    };
  const selectedRect: Rect | undefined = [...annotations.highlights, ...annotations.hotspots, ...redactions, ...crops].find(
    (r) => "id" in r && r.id === selectedId,
  );
  const selectedArrow = annotations.arrows.find((a) => a.id === selectedId);
  // Alça quadrada branca (12 px) dentro de alvo de 24 px: arrastar muda o tamanho (canto) ou a ponta da seta.
  const handle = (key: Handle, p: Point, cursor: string) => (
    <span
      key={key}
      onPointerDown={selectedId ? pick(selectedId, key) : undefined}
      className="absolute z-10 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center before:size-3 before:rounded-sm before:border-2 before:border-primary before:bg-white before:content-['']"
      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, cursor }}
    />
  );
  // Destaque e área clicável são conteúdo do manual: rounded-[3px] fixo, igual ao .hl/.hot do export (src/core/export/html.ts).
  const ring = (id: string) => (id === selectedId ? "outline-2 outline-offset-2 outline-primary" : "");

  return (
    <span
      ref={ref}
      className={cn("absolute inset-0 block", !interactive && "pointer-events-none")}
      style={styleVars(annotations.style, true)}
      aria-hidden
    >
      {crops.map((r) => {
        const [x0, y0, x1, y1] = [r.x * 100, r.y * 100, (r.x + r.w) * 100, (r.y + r.h) * 100];
        return (
          <span key={r.id} className="absolute inset-0 block">
            <span
              className="absolute inset-0 bg-black/55"
              style={{
                clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x0}% ${y0}%, ${x0}% ${y1}%, ${x1}% ${y1}%, ${x1}% ${y0}%, ${x0}% ${y0}%)`,
              }}
            />
            <span
              onPointerDown={pick(r.id)}
              data-crop
              className={cn("absolute block border-2 border-dashed border-white", ring(r.id), interactive && "cursor-move")}
              style={{ left: `${x0}%`, top: `${y0}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
            />
          </span>
        );
      })}
      {redactions.map((r) => (
        <span
          key={r.id}
          onPointerDown={pick(r.id)}
          data-redaction
          className={cn(
            "absolute block rounded-[3px] border border-dashed border-white/70",
            ring(r.id),
            interactive && "cursor-move",
          )}
          style={{
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            width: `${r.w * 100}%`,
            height: `${r.h * 100}%`,
            // Prévia do desfoque: o resultado real é pixelado e borrado nos pixels ao aplicar.
            ...(redactStyle === "blur"
              ? { backdropFilter: "blur(10px)", background: "rgb(255 255 255 / 0.15)" }
              : { background: REDACT_CSS }),
          }}
        />
      ))}
      {annotations.highlights.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn(
            "absolute block rounded-[3px] border-2 border-marca before:absolute before:inset-0 before:bg-marca before:mix-blend-multiply before:content-['']",
            ring(h.id),
            interactive && "cursor-move",
          )}
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.w * 100}%`,
            height: `${h.h * 100}%`,
            ...hlBorder,
            ...styleVars(h.style, true),
          }}
        />
      ))}
      {annotations.hotspots.map((h) => (
        <span
          key={h.id}
          onPointerDown={pick(h.id)}
          className={cn(
            "absolute block rounded-[3px] border-2 border-dashed border-anotacao",
            ring(h.id),
            interactive && "cursor-move",
          )}
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.w * 100}%`,
            height: `${h.h * 100}%`,
            ...border,
            background: "var(--preenchimento, color-mix(in srgb, var(--anotacao) 8%, transparent))",
            ...styleVars(h.style, true),
          }}
        >
          <Link2 className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-anotacao p-0.5 text-white" />
        </span>
      ))}
      {size.w > 0 && annotations.arrows.length > 0 && (
        <svg className="absolute inset-0 overflow-visible" width={size.w} height={size.h} role="presentation">
          {annotations.arrows.map((a) => {
            // Mesma espessura do export (relativa à imagem); selecionar desenha um anel, não engorda a seta.
            const eff = { ...annotations.style, ...a.style };
            const thickness = arrowThickness(Math.max(size.w, size.h), STROKE_SCALE[eff.stroke ?? "m"]);
            const { shaft, head } = arrowShape(px(a.from), px(a.to), thickness);
            const pts = head.map((p) => `${p.x},${p.y}`).join(" ");
            const halo = arrowHalo(thickness, eff.border);
            return (
              <g
                key={a.id}
                onPointerDown={pick(a.id)}
                className={cn(interactive && "cursor-move")}
                style={styleVars(a.style, true)}
              >
                {/* Faixa larga e transparente para facilitar o clique na seta. */}
                <line x1={px(a.from).x} y1={px(a.from).y} x2={px(a.to).x} y2={px(a.to).y} stroke="transparent" strokeWidth={14} />
                {a.id === selectedId && (
                  <g stroke="var(--primary)" strokeLinejoin="round" strokeLinecap="round">
                    <line x1={shaft.x1} y1={shaft.y1} x2={shaft.x2} y2={shaft.y2} strokeWidth={(halo?.shaft ?? thickness) + 6} />
                    <polygon points={pts} fill="var(--primary)" strokeWidth={(halo?.head ?? 0) + 6} />
                  </g>
                )}
                {/* Contorno branco: a seta se lê sobre print claro e escuro (igual ao .halo do export). */}
                {halo && (
                  <g stroke="#fff" strokeOpacity={0.9} strokeLinejoin="round" strokeLinecap="round">
                    <line x1={shaft.x1} y1={shaft.y1} x2={shaft.x2} y2={shaft.y2} strokeWidth={halo.shaft} />
                    <polygon points={pts} fill="#fff" strokeWidth={halo.head} />
                  </g>
                )}
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
      {size.w > 0 &&
        annotations.markers.map((m, i) => {
          const { disc, tail } = shapes[i] as (typeof shapes)[number];
          // O gancho fica no alvo (a posição gravada); o disco sai ao lado, ligado pela cauda.
          return (
            <span
              key={m.id}
              className="absolute size-0"
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, ...styleVars(m.style, true) }}
            >
              {tail && (
                <svg
                  className="absolute top-0 left-0 overflow-visible"
                  width={1}
                  height={1}
                  role="presentation"
                  onPointerDown={pick(m.id)}
                >
                  <polygon
                    points={tail.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="var(--anotacao)"
                    stroke="#fff"
                    style={{ strokeWidth: "calc(var(--borda, 1px) * 2)" }}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                  />
                </svg>
              )}
              <span
                onPointerDown={pick(m.id)}
                className={cn(
                  // O after amplia o alvo de clique para 24 px mesmo no disco pequeno (20 px).
                  "absolute grid place-items-center rounded-full bg-anotacao font-mono leading-none font-semibold text-sobre-anotacao before:content-[attr(data-n)] before:[text-box:trim-both_cap_alphabetic] after:absolute after:-inset-0.5 after:content-['']",
                  ring(m.id),
                  interactive && "cursor-move",
                )}
                style={{
                  width: "var(--disco, 24px)",
                  height: "var(--disco, 24px)",
                  margin: "calc(var(--disco, 24px) / -2) 0 0 calc(var(--disco, 24px) / -2)",
                  transform: `translate(${disc.x}px, ${disc.y}px)`,
                  fontSize: "var(--disco-fonte, 13px)",
                  boxShadow: "0 0 0 var(--borda, 2px) #fff",
                }}
                // O número vem do CSS: dentro do editor, um texto aqui entraria no conteúdo lido pelo leitor de tela.
                data-n={m.n}
              />
            </span>
          );
        })}
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
