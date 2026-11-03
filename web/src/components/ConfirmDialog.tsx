import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

interface Props {
  title: string;
  /** Explica o que acontece ao confirmar. */
  children: ReactNode;
  /** O botão diz o que acontece, não "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Pergunta antes de uma ação que a pessoa não consegue desfazer. Esc e o botão de cancelar não mudam nada. */
export function ConfirmDialog({ title, children, confirmLabel, cancelLabel, busy, onConfirm, onCancel }: Props) {
  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="grid gap-2">{children}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel ?? t("Cancelar")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
