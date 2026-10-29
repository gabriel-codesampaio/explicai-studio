import { ArrowLeft, BookCheck, Eye, History, RotateCcw } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, errorMessage, type Version, type VersionInfo } from "@/lib/api";
import { ago } from "@/lib/time";
import { VersionPreview } from "./VersionPreview";

interface Props {
  slug: string;
  pageId: string;
  onSave: (note: string) => Promise<void>;
  onRestore: (versionId: string) => Promise<void>;
}

const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/**
 * Botão "Versões" da página: guarda o texto como está, mostra as versões antigas, restaura uma
 * e escolhe qual vai para o manual final.
 */
export function VersionsPanel({ slug, pageId, onSave, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<VersionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<Version | null>(null);

  const load = () => {
    setError(null);
    api.listVersions(slug, pageId).then(setItems, (err: unknown) => setError(errorMessage(err)));
  };
  const fail = (err: unknown) => setError(errorMessage(err));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await onSave(note);
    setNote("");
    load();
  };
  const restore = async (id: string) => {
    await onRestore(id);
    setOpen(false);
  };
  const publish = (id: string | null) => api.publishVersion(slug, pageId, id).then(load, fail);
  const view = (id: string) => api.getVersion(slug, pageId, id).then(setPreview, fail);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setPreview(null);
        if (next) load();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <History className="size-3.5" aria-hidden /> Versões
        </button>
      </DialogTrigger>
      <DialogContent className="grid max-h-[90vh] w-[min(96vw,46rem)] max-w-none grid-rows-[auto_auto_minmax(0,1fr)] gap-4 sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">Versões desta página</DialogTitle>
          <DialogDescription>
            Guarde o texto como está agora para voltar a ele depois. A versão marcada "No manual" é a que vai para o manual final.
            Sem marcação, vale o texto atual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void save(e)} className="flex gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Nome da versão (opcional), ex.: Revisada pelo suporte"
            aria-label="Nome da versão (opcional)"
          />
          <Button type="submit">Guardar versão</Button>
        </form>

        <div className="min-h-0 overflow-y-auto">
          {error && <p className="pb-2 text-sm text-destructive">{error}</p>}
          {preview ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                  <ArrowLeft aria-hidden /> Voltar à lista
                </Button>
                <span className="flex-1 truncate text-sm font-bold">{preview.note || "Versão sem nome"}</span>
                <Button variant="outline" size="sm" onClick={() => void restore(preview.id)}>
                  <RotateCcw aria-hidden /> Restaurar esta
                </Button>
              </div>
              <VersionPreview slug={slug} version={preview} />
            </div>
          ) : items === null ? (
            !error && <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma versão guardada ainda.</p>
          ) : (
            <ul className="grid gap-1">
              {items.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-2 hover:bg-muted">
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="truncate">{v.note || "Versão sem nome"}</span>
                      {v.published && (
                        <span className="shrink-0 rounded-sm bg-marca px-1.5 py-0.5 text-xs font-bold text-[#151a33]">
                          No manual
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground" title={when(v.savedAt)}>
                      {ago(v.savedAt)} · {v.title || "Sem título"}
                    </span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => void view(v.id)}>
                    <Eye aria-hidden /> Ver
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void restore(v.id)}>
                    <RotateCcw aria-hidden /> Restaurar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void publish(v.published ? null : v.id)}>
                    <BookCheck aria-hidden /> {v.published ? "Tirar do manual" : "Usar no manual"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
