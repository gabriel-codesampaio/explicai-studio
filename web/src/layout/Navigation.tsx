import { PanelLeftOpen } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SidebarState } from "@/hooks/useSidebar";
import { t } from "@/lib/i18n";
import { Sidebar } from "./Sidebar";

interface Props {
  sidebar: SidebarState;
  /** Abre a busca de páginas (Ctrl+P). */
  onSearch: () => void;
}

const SHORTCUT = "Ctrl+\\";

/**
 * Onde a barra lateral aparece: coluna fixa (ou recolhida num trilho) em tela larga,
 * gaveta por cima do editor em tela estreita, como a do sistema dividida ao lado ou o celular.
 */
export function Navigation({ sidebar, onSearch }: Props) {
  return (
    <>
      <div className="hidden h-full shrink-0 lg:block">
        {sidebar.collapsed ? (
          <div className="flex h-full w-12 flex-col items-center border-r border-border bg-card py-4">
            <button
              type="button"
              onClick={sidebar.expand}
              aria-label={t("Mostrar as páginas ({atalho})", { atalho: SHORTCUT })}
              title={t("Mostrar as páginas ({atalho})", { atalho: SHORTCUT })}
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <PanelLeftOpen className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="h-full w-[17.5rem]">
            <Sidebar onCollapse={sidebar.collapse} onSearch={onSearch} />
          </div>
        )}
      </div>

      <Dialog open={sidebar.drawerOpen} onOpenChange={sidebar.setDrawerOpen}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="top-0 left-0 h-full w-[min(17.5rem,85vw)] max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 sm:max-w-none lg:hidden data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <DialogTitle className="sr-only">{t("Páginas do manual")}</DialogTitle>
          <Sidebar
            onCollapse={() => sidebar.setDrawerOpen(false)}
            onNavigate={() => sidebar.setDrawerOpen(false)}
            onSearch={() => {
              sidebar.setDrawerOpen(false);
              onSearch();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Topo da área principal em tela estreita: abre a gaveta das páginas e mostra em qual manual você está. */
export function MobileBar({ title, onOpen }: { title: string; onOpen: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("Mostrar as páginas ({atalho})", { atalho: SHORTCUT })}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-bold hover:bg-muted"
      >
        <PanelLeftOpen className="size-4" aria-hidden /> {t("Páginas")}
      </button>
      <span className="truncate text-sm text-muted-foreground">{title}</span>
    </div>
  );
}
