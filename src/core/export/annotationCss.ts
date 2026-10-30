/**
 * CSS das marcações no HTML exportado. O editor desenha o mesmo (AnnotationOverlay e AnnotationLegend):
 * mexeu aqui, confira lá. Variáveis --anotacao e --sobre-anotacao vêm do :root do export.
 */
export const ANNOTATION_CSS = `
.shot{display:block;margin:.6em 0}
.frame{position:relative;display:block;max-width:100%;width:fit-content;isolation:isolate}
.frame img{display:block;max-width:100%;height:auto;border:1px solid var(--linha);border-radius:8px}
.hl{position:absolute;border:2px solid var(--marca);border-radius:3px}
.hl::before{content:"";position:absolute;inset:0;background:var(--marca);mix-blend-mode:multiply}
.hot{position:absolute;border:2px dashed var(--anotacao);background:var(--anotacao-fundo);border-radius:3px}
.arrows{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.arrows line{stroke:var(--anotacao);stroke-linecap:round}
.arrows polygon{fill:var(--anotacao)}
.arrows .halo{stroke:#fff;stroke-opacity:.9;stroke-linejoin:round}
.arrows polygon.halo{fill:#fff}
.mk{position:absolute;transform:translate(-50%,-50%);width:32px;height:32px;border:2px dashed var(--anotacao);border-radius:50%;box-shadow:0 0 0 2px #fff,inset 0 0 0 2px #fff}
.mk::before{content:attr(data-n);position:absolute;left:-12px;top:-12px;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--anotacao);color:var(--sobre-anotacao);font:600 11px var(--mono);box-shadow:0 0 0 2px #fff}
.legend{display:grid;gap:2px;margin-top:12px;font-size:15px;line-height:1.4}
.legend .row{display:flex;align-items:baseline;gap:4px}
.legend .n{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:50%;background:var(--anotacao);color:var(--sobre-anotacao);font:600 11px var(--mono)}
.legend .n+span{margin-left:2px}
.legend .none{color:var(--grafite);font-style:italic}
`;
