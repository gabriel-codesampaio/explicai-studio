import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MANUAL_SWITCHER_ID } from "@/features/manuals/ManualSwitcher";
import { errorMessage } from "@/lib/api";
import { t } from "@/lib/i18n";

interface Props {
  title: string;
  onRename: (title: string) => Promise<void>;
  onClose: () => void;
}

/** Muda só o título do manual (a pasta e o endereço não mudam). Enter salva, Esc cancela; o foco volta ao seletor ao fechar. */
export function RenameManualDialog({ title, onRename, onClose }: Props) {
  const [value, setValue] = useState(title);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!value.trim()) return setError(t("Dê um nome ao manual."));
    setBusy(true);
    try {
      await onRename(value.trim());
      onClose();
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível renomear o manual.")));
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById(MANUAL_SWITCHER_ID)?.focus();
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Renomear manual")}</DialogTitle>
            <DialogDescription>{t("Só o nome muda. A pasta e os links continuam os mesmos.")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="rename-manual-title" className="text-sm font-bold">
              {t("Nome do manual")}
            </label>
            <Input
              id="rename-manual-title"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "rename-manual-error" : undefined}
              className="h-11 bg-card text-base"
            />
            {error && (
              <p id="rename-manual-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy} className="min-h-11">
              {t("Cancelar")}
            </Button>
            <Button type="submit" disabled={busy} className="min-h-11">
              {t("Salvar nome")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
