import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectionBanner } from "@/features/errors/ConnectionBanner";
import { NotFoundScreen } from "@/features/errors/NotFoundScreen";
import { RequestErrorScreen } from "@/features/errors/RequestErrorScreen";
import { ServerDownScreen } from "@/features/errors/ServerDownScreen";
import { CreateManual } from "@/features/manuals/CreateManual";
import { PageSearch } from "@/features/pages/PageSearch";
import { StudioProvider, useStudioContext } from "@/hooks/StudioContext";
import { useSidebar } from "@/hooks/useSidebar";
import { MobileBar, Navigation } from "@/layout/Navigation";
import { PageView } from "@/layout/PageView";
import { technicalCode } from "@/lib/errorPages";
import { t } from "@/lib/i18n";
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
  const { manuals, manual, page, bootError, notFound, openError } = studio;

  if (manuals === null) {
    if (studio.serverDown) {
      return (
        <ServerDownScreen
          attempt={studio.reconnect.attempt}
          checking={studio.reconnect.checking}
          onRetry={studio.reconnect.retryNow}
          code={technicalCode(bootError)}
        />
      );
    }
    if (bootError) return <RequestErrorScreen error={bootError} onRetry={() => void studio.reload()} />;
    return <div className="grid h-full place-items-center text-muted-foreground">{t("Abrindo o Studio…")}</div>;
  }

  const firstRun = manuals.length === 0;

  if (notFound && !firstRun && !studio.creatingManual) {
    return (
      <NotFoundScreen
        kind={notFound.kind}
        address={notFound.address}
        action={
          notFound.kind === "page" && manual
            ? { label: t("Abrir a primeira página"), onClick: () => void studio.openManual(manual.slug) }
            : {
                label: t("Abrir {nome}", { nome: manuals[0]?.title ?? "" }),
                onClick: () => void studio.openManual(manuals[0]?.slug ?? ""),
              }
        }
        secondary={{ label: t("Criar um manual novo"), onClick: () => studio.setCreatingManual(true) }}
      />
    );
  }
  if (openError && !studio.creatingManual) {
    return <RequestErrorScreen error={openError.error} onRetry={() => void studio.openManual(openError.slug)} />;
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex h-full">
        {!firstRun && <Navigation sidebar={sidebar} onSearch={() => setSearchOpen(true)} />}
        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          {!firstRun && <MobileBar title={manual?.title ?? ""} onOpen={() => sidebar.setDrawerOpen(true)} />}
          {studio.serverDown && <ConnectionBanner checking={studio.reconnect.checking} onRetry={studio.reconnect.retryNow} />}
          {firstRun || studio.creatingManual ? (
            <CreateManual firstRun={firstRun} onCreate={studio.createManual} onCancel={() => studio.setCreatingManual(false)} />
          ) : !manual ? null : !page ? (
            <EmptyState
              title={manual.title}
              action={{ label: t("Criar a primeira página"), onClick: () => void studio.addPage(null) }}
            >
              {t("Uma página por tela ou tarefa do sistema funciona bem. Comece pela que as pessoas mais usam.")}
            </EmptyState>
          ) : (
            // key: cada página (e cada versão restaurada) tem o próprio editor, criado com o conteúdo dela.
            <ErrorBoundary resetKey={page.id}>
              <PageView key={`${page.id}:${studio.revision}`} manual={manual} page={page} />
            </ErrorBoundary>
          )}
        </main>
      </div>
      {manual && <PageSearch open={searchOpen} onOpenChange={setSearchOpen} />}
      {/* Acima da linha de status, para o aviso não cobrir o "Salvo às…". */}
      <Toaster theme={theme} position="bottom-right" offset={{ bottom: 56, right: 24 }} />
    </TooltipProvider>
  );
}
