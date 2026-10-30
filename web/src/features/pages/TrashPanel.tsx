import { ImageOff, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { api, errorMessage, type TrashItem } from "@/lib/api";
import { t, tn } from "@/lib/i18n";
import { ago } from "@/lib/time";

interface Props {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (trashId: string, pageId: string) => Promise<void>;
}

/** Painel "Lixeira" (aberto pelo menu "⋯" da barra lateral): lista o que foi excluído neste manual e restaura. */
export function TrashPanel({ slug, open, onOpenChange, onRestore }: Props) {
  const [items, setItems] = useState<TrashItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Imagens e marcações que nenhuma página, versão ou item da lixeira usa. */
  const [unused, setUnused] = useState(0);

  const load = () => {
    setItems(null);
    setError(null);
    api.listTrash(slug).then(setItems, (err: unknown) => setError(errorMessage(err)));
    api.unusedAssets(slug).then(
      ({ count }) => setUnused(count),
      () => setUnused(0),
    );
  };
  const clean = () =>
    api.cleanUnusedAssets(slug).then(
      ({ moved, folder }) => {
        setUnused(0);
        toast(tn(moved, "{n} arquivo foi para {pasta}.", "{n} arquivos foram para {pasta}.", { pasta: folder ?? "" }));
      },
      (err: unknown) => setError(errorMessage(err)),
    );

  // biome-ignore lint/correctness/useExhaustiveDependencies: recarrega só ao abrir
  useEffect(() => {
    if (open) load();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2 p-4 sm:max-w-sm" aria-describedby={undefined}>
        <DialogTitle className="px-2 pt-1 pb-2 text-sm font-bold">{t("Lixeira deste manual")}</DialogTitle>
        {error && <p className="px-2 pb-2 text-sm text-destructive">{error}</p>}
        {!error && items === null && <p className="px-2 pb-2 text-sm text-muted-foreground">{t("Carregando…")}</p>}
        {items?.length === 0 && <p className="px-2 pb-2 text-sm text-muted-foreground">{t("Nenhuma página excluída.")}</p>}
        {items && items.length > 0 && (
          <ul className="grid gap-0.5">
            {items.map((item) => (
              <li key={item.trashId} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                <span className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate text-sm">{item.title || t("Sem título")}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.pages > 1 ? `${t("{n} páginas", { n: item.pages })} · ` : ""}
                    {t("excluída {quando}", { quando: ago(item.deletedAt) })}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void onRestore(item.trashId, item.pageId).then(load)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-bold text-primary hover:bg-accent"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> {t("Restaurar")}
                </button>
              </li>
            ))}
          </ul>
        )}
        {unused > 0 && (
          <div className="mx-2 mt-2 grid gap-1 rounded-md border border-border p-2 text-sm">
            <p>
              {tn(
                unused,
                "{n} arquivo de imagem que nenhuma página usa, contando versões e lixeira.",
                "{n} arquivos de imagem que nenhuma página usa, contando versões e lixeira.",
              )}
            </p>
            <button
              type="button"
              onClick={() => void clean()}
              className="flex w-fit items-center gap-1 rounded-md px-2 py-1 font-bold text-primary hover:bg-accent"
            >
              <ImageOff className="size-3.5" aria-hidden /> {t("Mover para a lixeira")}
            </button>
          </div>
        )}
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          {t("As páginas excluídas ficam na pasta .lixeira do manual até você restaurar ou apagar.")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
