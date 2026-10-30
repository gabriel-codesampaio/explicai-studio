import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShortcutsDialog } from "@/features/help/ShortcutsDialog";
import { TrashPanel } from "@/features/pages/TrashPanel";
import { AppearancePanel } from "@/features/settings/AppearancePanel";
import { useStudioContext } from "@/hooks/StudioContext";
import { t } from "@/lib/i18n";
import { type Mode, readAppearance } from "@/lib/theme";

type Panel = "trash" | "appearance" | "shortcuts";

/** Alvo de toque de 44 px em tela de toque, como a linha "Ajustes". */
const TOUCH = "[@media(pointer:coarse)]:min-h-11";
const MODE_LABELS: Record<Mode, string> = { light: "Claro", dark: "Escuro", system: "Sistema" };

/** Menu "Ajustes" do rodapé da barra lateral: Lixeira, Aparência e Atalhos, cada um abrindo seu painel. */
export function MoreMenu() {
  const { manual, restorePage } = useStudioContext();
  const [panel, setPanel] = useState<Panel | null>(null);
  // Lido ao abrir o menu: o tema pode ter mudado no painel de Aparência.
  const [mode, setMode] = useState<Mode>(() => readAppearance().mode);
  const bind = (id: Panel) => ({ open: panel === id, onOpenChange: (open: boolean) => setPanel(open ? id : null) });

  return (
    <div className="mt-auto border-t border-border pt-3">
      <DropdownMenu onOpenChange={(open) => open && setMode(readAppearance().mode)}>
        <DropdownMenuTrigger asChild>
          {/* Mesmo jeito de "Buscar página": linha com texto, não um ⋯ igual ao da árvore. */}
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted [@media(pointer:coarse)]:min-h-11"
          >
            {t("Ajustes")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("trash")}>
              {t("Lixeira")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("appearance")}>
            {t("Aparência")}
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{t(MODE_LABELS[mode])}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("shortcuts")}>
            {t("Atalhos")}
          </DropdownMenuItem>
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
