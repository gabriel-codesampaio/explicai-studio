import { type FormEvent, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStudioContext } from "@/hooks/StudioContext";
import { errorMessage } from "@/lib/api";
import { audienceNameError, audienceUsage, MAX_AUDIENCE_NAME } from "@/lib/audiences";
import { t, tn } from "@/lib/i18n";
import { AudienceRow } from "./AudienceRow";

const SHOWN_TITLES = 5;

/** Diálogo "Públicos" (Ajustes e link do popover da página): lista com contagem, renomear, criar e remover com confirmação. */
export function AudiencesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { manual, audiences } = useStudioContext();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!manual) return null;
  const known = manual.audiences;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const refused = audienceNameError(draft, known);
    if (refused) return setError(refused);
    try {
      await audiences.add(draft.trim());
      setDraft("");
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await audiences.remove(removing);
      setRemoving(null);
    } catch (err) {
      setRemoveError(errorMessage(err));
    }
    setBusy(false);
  };
  const usage = removing ? audienceUsage(manual.pages, removing) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-4 sm:max-w-lg" aria-describedby="aud-desc">
        <DialogTitle className="font-display text-lg font-extrabold tracking-tight">{t("Públicos do manual")}</DialogTitle>
        <DialogDescription id="aud-desc" className="text-xs">
          {t("Cada página pode valer só para alguns públicos. Sem nenhum marcado, vale para todos.")}
        </DialogDescription>
        {known.length > 0 ? (
          <ul className="divide-y divide-border">
            {known.map((name) => (
              <AudienceRow
                key={name}
                name={name}
                count={audienceUsage(manual.pages, name).count}
                known={known}
                onRename={(next) => audiences.rename(name, next)}
                onRemove={() => {
                  setRemoveError(null);
                  setRemoving(name);
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("Nenhum público ainda.")}</p>
        )}
        <form onSubmit={add} className="grid gap-1">
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_AUDIENCE_NAME + 10}
              aria-label={t("Novo público")}
              aria-invalid={error !== null}
              aria-describedby={error ? "aud-add-err" : undefined}
              placeholder={t("Ex.: admin")}
              className="flex-1 [@media(pointer:coarse)]:h-11"
            />
            <Button type="submit" className="[@media(pointer:coarse)]:min-h-11">
              {t("Adicionar")}
            </Button>
          </div>
          {error && (
            <p id="aud-add-err" role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </form>
      </DialogContent>
      {removing && usage && (
        <ConfirmDialog
          title={t("Remover o público {nome}?", { nome: removing })}
          confirmLabel={usage.count ? t("Remover e liberar essas páginas") : t("Remover")}
          busy={busy}
          onConfirm={() => void remove()}
          onCancel={() => setRemoving(null)}
        >
          {usage.count === 0 ? (
            <p>{t("Nenhuma página usa.")}</p>
          ) : (
            <>
              <p>{tn(usage.count, "{n} página cita este público.", "{n} páginas citam este público.")}</p>
              {usage.freed.length > 0 && (
                <>
                  <p>
                    {tn(
                      usage.freed.length,
                      "{n} delas só tem esse público e passa a aparecer para todos:",
                      "{n} delas só têm esse público e passam a aparecer para todos:",
                    )}
                  </p>
                  <ul className="list-disc pl-5">
                    {usage.freed.slice(0, SHOWN_TITLES).map((title, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: títulos podem repetir
                      <li key={i}>{title}</li>
                    ))}
                    {usage.freed.length > SHOWN_TITLES && (
                      <li className="list-none">{t("e mais {n}", { n: usage.freed.length - SHOWN_TITLES })}</li>
                    )}
                  </ul>
                </>
              )}
            </>
          )}
          {removeError && (
            <p role="alert" className="text-destructive">
              {removeError}
            </p>
          )}
        </ConfirmDialog>
      )}
    </Dialog>
  );
}
