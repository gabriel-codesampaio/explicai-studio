import type { Editor } from "@tiptap/react";
import { ListTree } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Heading } from "./headings";

interface Props {
  editor: Editor;
  headings: Heading[];
  /** Depois de ir até um título (ex.: fechar o popover). */
  onNavigate?: () => void;
}

/** Índice "Nesta página": leva até o título no clique. */
export function PageOutline({ editor, headings, onNavigate }: Props) {
  const go = (h: Heading) => {
    editor
      .chain()
      .focus()
      .setTextSelection(h.pos + 1)
      .run();
    (editor.view.nodeDOM(h.pos) as HTMLElement | null)?.scrollIntoView({ block: "start" });
    onNavigate?.();
  };

  return (
    <nav aria-label="Nesta página" className="text-[13px]">
      <p className="mb-2 font-bold text-muted-foreground">Nesta página</p>
      <ul className="grid gap-0.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.pos}>
            <button
              type="button"
              onClick={() => go(h)}
              className="-ml-px block w-full truncate border-l-2 border-transparent py-1 pr-2 text-left text-muted-foreground hover:border-primary hover:text-foreground"
              style={{ paddingLeft: `${0.75 * h.level}rem` }}
            >
              {h.text || "Título vazio"}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** O mesmo índice em telas sem espaço para a coluna da direita: um botão que abre a lista. */
export function PageOutlineButton(props: Omit<Props, "onNavigate">) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted xl:hidden"
        >
          <ListTree className="size-3.5" aria-hidden /> Nesta página
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[60vh] w-72 overflow-y-auto p-3">
        <PageOutline {...props} onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
