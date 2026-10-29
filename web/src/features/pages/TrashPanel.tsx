import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api, errorMessage, type TrashItem } from "@/lib/api";
import { ago } from "@/lib/time";

interface Props {
  slug: string;
  onRestore: (trashId: string, pageId: string) => Promise<void>;
}

/** Botão "Lixeira" da barra lateral: lista o que foi excluído neste manual e restaura. */
export function TrashPanel({ slug, onRestore }: Props) {
  const [items, setItems] = useState<TrashItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setItems(null);
    setError(null);
    api.listTrash(slug).then(setItems, (err: unknown) => setError(errorMessage(err)));
  };

  return (
    <Popover onOpenChange={(open) => open && load()}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
        >
          <Trash2 className="size-4" aria-hidden /> Lixeira
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-80 p-2">
        <p className="px-2 pt-1 pb-2 text-sm font-bold">Lixeira deste manual</p>
        {error && <p className="px-2 pb-2 text-sm text-destructive">{error}</p>}
        {!error && items === null && <p className="px-2 pb-2 text-sm text-muted-foreground">Carregando…</p>}
        {items?.length === 0 && <p className="px-2 pb-2 text-sm text-muted-foreground">Nenhuma página excluída.</p>}
        {items && items.length > 0 && (
          <ul className="grid gap-0.5">
            {items.map((item) => (
              <li key={item.trashId} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                <span className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate text-sm">{item.title || "Sem título"}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.pages > 1 ? `${item.pages} páginas · ` : ""}
                    excluída {ago(item.deletedAt)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void onRestore(item.trashId, item.pageId).then(load)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-bold text-primary hover:bg-accent"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          As páginas ficam na pasta <code className="font-mono">.lixeira</code> do manual até você restaurar ou apagar.
        </p>
      </PopoverContent>
    </Popover>
  );
}
