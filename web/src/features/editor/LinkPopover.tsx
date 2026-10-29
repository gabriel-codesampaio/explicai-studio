import type { Editor } from "@tiptap/react";
import { FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { checkHref, pageHref } from "@/lib/links";
import { fold } from "@/lib/text";
import { flattenItems } from "@/lib/tree";
import { AnchoredPopover } from "./AnchoredPopover";

interface Props {
  editor: Editor;
  open: boolean;
  onClose: () => void;
  /** Páginas do manual, sugeridas enquanto se digita. */
  pages: TreeItem[];
}

function selectionRect(editor: Editor): DOMRect {
  const { from, to } = editor.state.selection;
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to);
  return new DOMRect(start.left, start.top, Math.max(end.right - start.left, 1), end.bottom - start.top);
}

export function LinkPopover({ editor, open, onClose, pages }: Props) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [text, setText] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [lastOpen, setLastOpen] = useState(false);
  // Ao abrir, começa com o link que já está no texto.
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setText(current);
      setError(null);
    }
  }

  const query = fold(text.trim());
  const suggestions =
    query && !/[/:.#]/.test(query)
      ? flattenItems(pages)
          .filter((p) => fold(p.title).includes(query))
          .slice(0, 5)
      : [];

  const setLink = (href: string) => {
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    onClose();
  };
  const apply = () => {
    const result = checkHref(text);
    if (result.ok) setLink(result.href);
    else setError(result.error);
  };
  const close = () => {
    onClose();
    editor.commands.focus();
  };

  return (
    <AnchoredPopover open={open} onClose={close} getRect={() => selectionRect(editor)} label={t("Editar link")}>
      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const first = suggestions[0];
          if (first && !error && suggestions.length === 1) setLink(pageHref(first.file));
          else apply();
        }}
      >
        <label htmlFor="link-href" className="text-sm font-bold">
          {t("Link para uma página ou endereço")}
        </label>
        <Input
          id="link-href"
          value={text}
          aria-invalid={error !== null}
          aria-describedby={error ? "link-error" : undefined}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder={t("Nome da página ou https://…")}
        />
        {error && (
          <p id="link-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        {suggestions.length > 0 && (
          <ul aria-label={t("Páginas do manual")} className="grid gap-0.5">
            {suggestions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setLink(pageHref(p.file))}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{p.title || t("Sem título")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between gap-2 pt-1">
          {current ? (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setLink("")}>
              {t("Remover link")}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm">
            {t("Aplicar")}
          </Button>
        </div>
      </form>
    </AnchoredPopover>
  );
}
