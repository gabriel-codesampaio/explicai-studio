import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreateManual } from "@/features/manuals/CreateManual";
import { PageSearch } from "@/features/pages/PageSearch";
import { StudioProvider, useStudioContext } from "@/hooks/StudioContext";
import { useSidebar } from "@/hooks/useSidebar";
import { MobileBar, Navigation } from "@/layout/Navigation";
import { PageView } from "@/layout/PageView";
import { useResolvedTheme } from "@/lib/theme";

export function App() {
  return (
    <StudioProvider>
      <Shell />
    </StudioProvider>
  );
}

function Shell() {
  const studio = useStudioContext();
  const theme = useResolvedTheme();
  const sidebar = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const { manuals, manual, page, bootError } = studio;

  if (manuals === null) {
    return <div className="grid h-full place-items-center text-muted-foreground">{bootError ?? "Abrindo o Studio…"}</div>;
  }

  const firstRun = manuals.length === 0;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex h-full">
        {!firstRun && <Navigation sidebar={sidebar} onSearch={() => setSearchOpen(true)} />}
        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          {!firstRun && <MobileBar title={manual?.title ?? ""} onOpen={() => sidebar.setDrawerOpen(true)} />}
          {firstRun || studio.creatingManual ? (
            <CreateManual firstRun={firstRun} onCreate={studio.createManual} onCancel={() => studio.setCreatingManual(false)} />
          ) : !manual ? null : !page ? (
            <EmptyState
              title={manual.title}
              action={{ label: "Criar a primeira página", onClick: () => void studio.addPage(null) }}
            >
              Uma página por tela ou tarefa do sistema funciona bem. Comece pela que as pessoas mais usam.
            </EmptyState>
          ) : (
            // key: cada página (e cada versão restaurada) tem o próprio editor, criado com o conteúdo dela.
            <PageView key={`${page.id}:${studio.revision}`} manual={manual} page={page} />
          )}
        </main>
      </div>
      {manual && <PageSearch open={searchOpen} onOpenChange={setSearchOpen} />}
      {/* Acima da linha de status, para o aviso não cobrir o "Salvo às…". */}
      <Toaster theme={theme} position="bottom-right" offset={{ bottom: 56, right: 24 }} />
    </TooltipProvider>
  );
}
