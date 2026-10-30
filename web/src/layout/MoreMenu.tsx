import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShortcutsDialog } from "@/features/help/ShortcutsDialog";
import { TrashPanel } from "@/features/pages/TrashPanel";
import { AppearancePanel } from "@/features/settings/AppearancePanel";
import { useStudioContext } from "@/hooks/StudioContext";
import { t } from "@/lib/i18n";

type Panel = "trash" | "appearance" | "shortcuts";

/** Menu "⋯" do rodapé da barra lateral: Lixeira, Aparência e Atalhos, cada um abrindo seu painel. */
export function MoreMenu() {
  const { manual, restorePage } = useStudioContext();
  const [panel, setPanel] = useState<Panel | null>(null);
  const bind = (id: Panel) => ({ open: panel === id, onOpenChange: (open: boolean) => setPanel(open ? id : null) });

  return (
    <div className="mt-auto border-t border-border pt-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("Mais opções")}
            title={t("Mais opções")}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          {manual && <DropdownMenuItem onSelect={() => setPanel("trash")}>{t("Lixeira")}</DropdownMenuItem>}
          <DropdownMenuItem onSelect={() => setPanel("appearance")}>{t("Aparência")}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPanel("shortcuts")}>{t("Atalhos")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {manual && (
        <TrashPanel
          slug={manual.slug}
          {...bind("trash")}
          onRestore={(trashId, pageId) => restorePage(manual.slug, trashId, pageId)}
        />
      )}
      <AppearancePanel {...bind("appearance")} />
      <ShortcutsDialog {...bind("shortcuts")} />
    </div>
  );
}
