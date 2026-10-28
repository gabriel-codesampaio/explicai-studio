import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeHref } from "@/lib/links";
import { AnchoredPopover } from "./AnchoredPopover";

interface Props {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}

function selectionRect(editor: Editor): DOMRect {
  const { from, to } = editor.state.selection;
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to);
  return new DOMRect(start.left, start.top, Math.max(end.right - start.left, 1), end.bottom - start.top);
}

export function LinkPopover({ editor, open, onClose }: Props) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [href, setHref] = useState(current);
  const [lastOpen, setLastOpen] = useState(false);
  // Ao abrir, começa com o link que já está no texto.
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setHref(current);
  }

  const close = () => {
    onClose();
    editor.commands.focus();
  };
  const apply = () => {
    const value = normalizeHref(href);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (value) chain.setLink({ href: value }).run();
    else chain.unsetLink().run();
    onClose();
  };

  return (
    <AnchoredPopover open={open} onClose={close} getRect={() => selectionRect(editor)} label="Editar link">
      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <label htmlFor="link-href" className="text-sm font-bold">
          Endereço do link
        </label>
        <Input id="link-href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://… ou #secao" />
        <div className="flex justify-between gap-2 pt-1">
          {current ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                onClose();
              }}
            >
              Remover link
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm">
            Aplicar
          </Button>
        </div>
      </form>
    </AnchoredPopover>
  );
}
