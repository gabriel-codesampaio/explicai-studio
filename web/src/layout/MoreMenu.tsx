import { Keyboard, Languages, Palette, Route, Settings, SunMoon, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShortcutsDialog } from "@/features/help/ShortcutsDialog";
import { TOUR_EVENT } from "@/features/help/tourSteps";
import { TrashPanel } from "@/features/pages/TrashPanel";
import { AppearancePanel } from "@/features/settings/AppearancePanel";
import { AudiencesDialog } from "@/features/settings/AudiencesDialog";
import { LANGS, LanguagePanel } from "@/features/settings/LanguagePanel";
import { ManualAppearanceDialog } from "@/features/settings/ManualAppearanceDialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { lang, t } from "@/lib/i18n";
import { type Mode, readAppearance } from "@/lib/theme";

type Panel = "trash" | "audiences" | "manualAppearance" | "appearance" | "language" | "shortcuts";

/** Alvo de toque de 44 px em tela de toque, como a linha "Ajustes". */
const TOUCH = "group/item [@media(pointer:coarse)]:min-h-11";
/** Ícone só ajuda a achar o item (T-045): o texto é o nome acessível. */
const ICON = "size-3.5 text-muted-foreground group-data-[highlighted]/item:text-foreground";
const MODE_LABELS: Record<Mode, string> = { light: "Claro", dark: "Escuro", system: "Sistema" };

/** Menu "Ajustes" do rodapé da barra lateral: Lixeira, Públicos, Aparência do manual, Tema do Studio, Idioma e Atalhos, cada um abrindo seu painel. */
export function MoreMenu() {
  const { manual, restorePage, flush } = useStudioContext();
  const [panel, setPanel] = useState<Panel | null>(null);
  // Lido ao abrir o menu: o tema pode ter mudado no painel de Aparência.
  const [mode, setMode] = useState<Mode>(() => readAppearance().mode);
  const bind = (id: Panel) => ({ open: panel === id, onOpenChange: (open: boolean) => setPanel(open ? id : null) });

  return (
    <div className="flex h-(--rodape-h) shrink-0 flex-col justify-center border-t border-border bg-card px-3">
      <DropdownMenu onOpenChange={(open) => open && setMode(readAppearance().mode)}>
        <DropdownMenuTrigger asChild>
          {/* Mesmo jeito de "Buscar página": linha com texto, não um ⋯ igual ao da árvore. */}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted [@media(pointer:coarse)]:min-h-11"
          >
            <Settings className="size-3.5" aria-hidden /> {t("Ajustes")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("trash")}>
              <Trash2 className={ICON} aria-hidden /> {t("Lixeira")}
            </DropdownMenuItem>
          )}
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("audiences")}>
              <Users className={ICON} aria-hidden /> {t("Públicos")}
            </DropdownMenuItem>
          )}
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("manualAppearance")}>
              <Palette className={ICON} aria-hidden /> {t("Aparência do manual")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("appearance")}>
            <SunMoon className={ICON} aria-hidden /> {t("Tema do Studio")}
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{t(MODE_LABELS[mode])}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("language")}>
            <Languages className={ICON} aria-hidden /> {t("Idioma")}
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{LANGS.find((l) => l.id === lang)?.label}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={() => setPanel("shortcuts")}>
            <Keyboard className={ICON} aria-hidden /> {t("Atalhos")}
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={() => window.dispatchEvent(new Event(TOUR_EVENT))}>
            <Route className={ICON} aria-hidden /> {t("Passeio guiado")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {manual && (
        <TrashPanel
          slug={manual.slug}
          flush={flush}
          {...bind("trash")}
          onRestore={(trashId, pageId) => restorePage(manual.slug, trashId, pageId)}
        />
      )}
      {manual && <AudiencesDialog {...bind("audiences")} />}
      {manual && <ManualAppearanceDialog {...bind("manualAppearance")} />}
      <AppearancePanel {...bind("appearance")} />
      <LanguagePanel {...bind("language")} />
      <ShortcutsDialog {...bind("shortcuts")} />
    </div>
  );
}
