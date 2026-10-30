import { ArrowLeft, BookCheck, Eye, RotateCcw } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, errorMessage, type Version, type VersionInfo } from "@/lib/api";
import { locale, t } from "@/lib/i18n";
import { ago } from "@/lib/time";
import { VersionPreview } from "./VersionPreview";

interface Props {
  slug: string;
  pageId: string;
  onSave: (note: string) => Promise<void>;
  onRestore: (versionId: string) => Promise<void>;
  onPublish: (versionId: string | null) => Promise<void>;
  /** Página com Versão do manual: o botão avisa. */
  pinned: boolean;
}

/** Nome da versão. "Antes de restaurar" é gravado pelo Studio em português e aparece traduzido. */
const noteLabel = (note: string) => (note ? t(note) : t("Versão sem nome"));

const when = (iso: string) => new Date(iso).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });

/**
 * Botão "Versões" da página: guarda o texto como está, mostra as versões antigas, restaura uma
 * e escolhe qual vai para o manual final.
 */
export function VersionsPanel({ slug, pageId, onSave, onRestore, onPublish, pinned }: Props) {
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
  const publish = (id: string | null) => onPublish(id).then(load);
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
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] [@media(pointer:coarse)]:min-h-11 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {t("Versões")}
          {pinned && (
            <span className="rounded-sm bg-marca px-1 text-[11px] font-bold text-[#151a33]">{t("Versão do manual")}</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="grid max-h-[90vh] w-[min(96vw,46rem)] max-w-none grid-rows-[auto_auto_minmax(0,1fr)] gap-4 sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Versões desta página")}</DialogTitle>
          <DialogDescription>
            {t(
              'Guarde o texto como está agora para voltar a ele depois. A "Versão do manual" é a que vai para o manual final. Sem ela, vale o texto atual.',
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void save(e)} className="flex gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={t("Nome da versão (opcional), ex.: Revisada pelo suporte")}
            aria-label={t("Nome da versão (opcional)")}
          />
          <Button type="submit">{t("Guardar versão")}</Button>
        </form>

        <div className="min-h-0 overflow-y-auto">
          {error && <p className="pb-2 text-sm text-destructive">{error}</p>}
          {preview ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                  <ArrowLeft aria-hidden /> {t("Voltar à lista")}
                </Button>
                <span className="flex-1 truncate text-sm font-bold">{noteLabel(preview.note)}</span>
                <Button variant="outline" size="sm" onClick={() => void restore(preview.id)}>
                  <RotateCcw aria-hidden /> {t("Restaurar esta")}
                </Button>
              </div>
              <VersionPreview slug={slug} version={preview} />
            </div>
          ) : items === null ? (
            !error && <p className="text-sm text-muted-foreground">{t("Carregando…")}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("Nenhuma versão guardada ainda.")}</p>
          ) : (
            <ul className="grid gap-1">
              {items.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-2 hover:bg-muted">
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="truncate">{noteLabel(v.note)}</span>
                      {v.published && (
                        <span className="shrink-0 rounded-sm bg-marca px-1.5 py-0.5 text-xs font-bold text-[#151a33]">
                          {t("Versão do manual")}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground" title={when(v.savedAt)}>
                      {ago(v.savedAt)} · {v.title || t("Sem título")}
                    </span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => void view(v.id)}>
                    <Eye aria-hidden /> {t("Ver")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void restore(v.id)}>
                    <RotateCcw aria-hidden /> {t("Restaurar")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void publish(v.published ? null : v.id)}>
                    <BookCheck aria-hidden /> {v.published ? t("Tirar do manual") : t("Usar no manual")}
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
