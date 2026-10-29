import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useAnnotations } from "@/lib/annotationStore";
import { assetPathFromSrc } from "@/lib/annotations";
import { AnnotationLegend } from "./AnnotationLegend";
import { AnnotationOverlay } from "./AnnotationOverlay";

/**
 * Como a imagem aparece no editor: o print, as marcações por cima e a legenda embaixo.
 * As marcações ficam no JSON ao lado da imagem; o Markdown continua sendo só `![alt](src)`.
 */
export function ImageView({ node, extension, selected }: NodeViewProps) {
  const src = node.attrs.src as string;
  const alt = (node.attrs.alt as string | null) ?? "";
  const slug = (extension.options as { slug: string }).slug;
  const asset = assetPathFromSrc(src);
  const annotations = useAnnotations(slug, asset);

  return (
    <NodeViewWrapper as="span" className="my-2 block" data-drag-handle>
      <span className="relative inline-block max-w-full align-top">
        <img src={src} alt={alt} draggable={false} className={selected ? "ProseMirror-selectednode" : undefined} />
        {annotations && <AnnotationOverlay annotations={annotations} />}
      </span>
      {annotations && <AnnotationLegend markers={annotations.markers} />}
    </NodeViewWrapper>
  );
}
