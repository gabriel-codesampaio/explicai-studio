/**
 * CSS das marcações no HTML exportado. O editor desenha o mesmo (AnnotationOverlay e AnnotationLegend):
 * mexeu aqui, confira lá. Variáveis --anotacao e --sobre-anotacao vêm do :root do export.
 */
export const ANNOTATION_CSS = `
.shot{display:block;margin:.6em 0}
.shot-s{--shot-w:40%}.shot-m{--shot-w:70%}.shot-full{--shot-w:100%}
.frame{position:relative;display:block;max-width:var(--shot-w,100%);width:fit-content;isolation:isolate}
.frame img{display:block;max-width:100%;height:auto;border:1px solid var(--linha);border-radius:8px}
.hl{position:absolute;border:2px solid var(--marca);border-radius:3px}
.hl::before{content:"";position:absolute;inset:0;background:var(--marca);mix-blend-mode:multiply}
.hot{position:absolute;border:2px dashed var(--anotacao);background:var(--anotacao-fundo);border-radius:3px}
.arrows{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.arrows line{stroke:var(--anotacao);stroke-linecap:round}
.arrows polygon{fill:var(--anotacao)}
.arrows .halo{stroke:#fff;stroke-opacity:.9;stroke-linejoin:round}
.arrows polygon.halo{fill:#fff}
.mk{position:absolute;width:0;height:0}
.mk .tail{position:absolute;left:0;top:0;overflow:visible}
.mk .tail polygon{fill:var(--anotacao);stroke:#fff;stroke-width:2;stroke-linejoin:round;paint-order:stroke}
.mk .disc{position:absolute;left:-12px;top:-12px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--anotacao);box-shadow:0 0 0 2px #fff;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.mk .disc::before{content:attr(data-n);color:var(--sobre-anotacao);font:600 13px/1 var(--mono)}
.legend{display:grid;gap:6px;margin-top:16px;font-size:15px;line-height:1.4}
.legend .row{display:flex;align-items:center;gap:10px;break-inside:avoid}
.legend .n{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 4px;border-radius:12px;background:var(--anotacao);color:var(--sobre-anotacao);font:600 13px var(--mono);print-color-adjust:exact;-webkit-print-color-adjust:exact}
`;

/** Só entra no export quando alguma imagem tem `style`: manual sem ele sai byte a byte como sempre. */
export const ANNOTATION_STYLE_CSS = `
.hl,.hot{border-width:calc(2px*var(--marca-espessura,1))}
.mk .disc{left:calc(var(--disco,24px)/-2);top:calc(var(--disco,24px)/-2);width:var(--disco,24px);height:var(--disco,24px)}
.mk .disc::before{font-size:var(--disco-fonte,13px)}
`;

/** Só entra quando alguma imagem tem `style.border`; as variáveis vêm do `.shot` (styleVars). */
export const ANNOTATION_BORDER_CSS = `
.hl,.hot{border-width:var(--borda,calc(2px*var(--marca-espessura,1)))}
.hl{border-color:var(--borda-destaque,var(--marca))}
.mk .disc{box-shadow:0 0 0 var(--borda,2px) #fff}
.mk .tail polygon{stroke-width:calc(var(--borda,1px)*2)}
`;
