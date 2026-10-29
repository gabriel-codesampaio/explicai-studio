import { EditorContent, useEditor } from "@tiptap/react";
import { AnnotatedImage } from "@/features/annotations/annotatedImage";
import { contentExtensions } from "@/features/editor/extensions";
import type { Version } from "@/lib/api";
import { toEditorMarkdown } from "@/lib/imagePaths";

/** A versão como ela aparece na página, só para ler. */
export function VersionPreview({ slug, version }: { slug: string; version: Version }) {
  const editor = useEditor(
    {
      extensions: contentExtensions(AnnotatedImage.configure({ slug })),
      content: toEditorMarkdown(slug, version.body),
      contentType: "markdown",
      editable: false,
      editorProps: { attributes: { "aria-label": `Texto da versão ${version.note || "sem nome"}` } },
    },
    [version.id],
  );

  return (
    <div className="rounded-md border border-border bg-card px-5 py-4">
      <p className="mb-2 font-display text-2xl font-extrabold tracking-tight">{version.title || "Sem título"}</p>
      {version.body.trim() ? (
        <EditorContent editor={editor} className="editor-content [&_.tiptap]:min-h-0!" />
      ) : (
        <p className="text-sm text-muted-foreground">Esta versão não tem texto.</p>
      )}
    </div>
  );
}
