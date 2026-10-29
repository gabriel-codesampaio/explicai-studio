import { EmptyState } from "@/components/EmptyState";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreateManual } from "@/features/manuals/CreateManual";
import { useStudio } from "@/hooks/useStudio";
import { PageView } from "@/layout/PageView";
import { Sidebar } from "@/layout/Sidebar";

export function App() {
  const studio = useStudio();
  const { manuals, manual, page, bootError } = studio;

  if (manuals === null) {
    return <div className="grid h-full place-items-center text-muted-foreground">{bootError ?? "Abrindo o Studio…"}</div>;
  }

  const firstRun = manuals.length === 0;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="md:grid md:h-full md:grid-cols-[17.5rem_minmax(0,1fr)]">
        {!firstRun && <Sidebar studio={studio} />}
        <main className={firstRun ? "md:col-span-2" : "md:overflow-y-auto"}>
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
            <PageView key={`${page.id}:${studio.revision}`} studio={studio} manual={manual} page={page} />
          )}
        </main>
      </div>
      {/* Acima da linha de status, para o aviso não cobrir o "Salvo às…". */}
      <Toaster position="bottom-right" offset={{ bottom: 56, right: 24 }} />
    </TooltipProvider>
  );
}
