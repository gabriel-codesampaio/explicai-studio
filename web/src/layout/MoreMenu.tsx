import { CircleHelp, Languages, Palette, Route, Settings, SunMoon, Trash2, Users } from "lucide-react";
import { useRef, useState } from "react";
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
/** Botão de ícone do rodapé: o nome acessível vem de aria-label; 44 px em tela de toque. */
const FOOT_BTN =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:size-11";
const MODE_LABELS: Record<Mode, string> = { light: "Claro", dark: "Escuro", system: "Sistema" };

/** Rodapé da barra lateral: o menu "Ajustes" (Públicos, Aparência, Tema, Idioma) e, ao lado, Lixeira e Ajuda direto, cada um abrindo seu painel. */
export function MoreMenu() {
  const { manual, restorePage, flush } = useStudioContext();
  const [panel, setPanel] = useState<Panel | null>(null);
  // Lido ao abrir o menu: o tema pode ter mudado no painel de Aparência.
  const [mode, setMode] = useState<Mode>(() => readAppearance().mode);
  // Lixeira e Ajuda abrem sem gatilho de diálogo: devolve o foco ao botão que abriu quando o painel fecha.
  const opener = useRef<HTMLElement | null>(null);
  // Item de menu some ao abrir o painel: o foco volta ao botão "Ajustes" que abriu o menu.
  const menuButton = useRef<HTMLButtonElement | null>(null);
  const bind = (id: Panel) => ({
    open: panel === id,
    onOpenChange: (open: boolean) => {
      setPanel(open ? id : null);
      if (!open && opener.current) {
        const back = opener.current;
        opener.current = null;
        requestAnimationFrame(() => back.focus());
      }
    },
  });
  const openFromMenu = (id: Panel) => () => {
    opener.current = menuButton.current;
    setPanel(id);
  };
  const openFrom = (id: Panel) => (e: React.MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget;
    setPanel(id);
  };

  return (
    <div className="flex h-(--rodape-h) shrink-0 items-center gap-1 border-t border-border bg-card px-3">
      <DropdownMenu onOpenChange={(open) => open && setMode(readAppearance().mode)}>
        <DropdownMenuTrigger asChild>
          {/* Mesmo jeito de "Buscar página": linha com texto, não um ⋯ igual ao da árvore. */}
          <button
            ref={menuButton}
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted [@media(pointer:coarse)]:min-h-11"
          >
            <Settings className="size-3.5" aria-hidden /> {t("Ajustes")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={openFromMenu("audiences")}>
              <Users className={ICON} aria-hidden /> {t("Públicos")}
            </DropdownMenuItem>
          )}
          {manual && (
            <DropdownMenuItem className={TOUCH} onSelect={openFromMenu("manualAppearance")}>
              <Palette className={ICON} aria-hidden /> {t("Aparência do manual")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className={TOUCH} onSelect={openFromMenu("appearance")}>
            <SunMoon className={ICON} aria-hidden /> {t("Tema do Studio")}
            <span className="ml-auto font-mono text-xs text-muted-foreground">{t(MODE_LABELS[mode])}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={openFromMenu("language")}>
            <Languages className={ICON} aria-hidden /> {t("Idioma")}
            <span className="ml-auto font-mono text-xs text-muted-foreground">{LANGS.find((l) => l.id === lang)?.label}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={TOUCH} onSelect={() => window.dispatchEvent(new Event(TOUR_EVENT))}>
            <Route className={ICON} aria-hidden /> {t("Passeio guiado")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {manual && (
        <button type="button" className={FOOT_BTN} aria-label={t("Lixeira")} title={t("Lixeira")} onClick={openFrom("trash")}>
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}
      <button type="button" className={FOOT_BTN} aria-label={t("Ajuda")} title={t("Ajuda")} onClick={openFrom("shortcuts")}>
        <CircleHelp className="size-4" aria-hidden />
      </button>
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
