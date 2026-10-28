import { Alert } from "./components/Alert";
import { EmptyState } from "./components/EmptyState";
import { useStudio } from "./hooks/useStudio";
import { PageView } from "./layout/PageView";
import { Sidebar } from "./layout/Sidebar";

export function App() {
  const studio = useStudio();
  const { manuals, manual, page, error } = studio;

  if (manuals === null) return <div className="boot">{error ?? "Abrindo o Studio…"}</div>;

  return (
    <div className="app">
      <Sidebar studio={studio} />
      <main className="main">
        {error && <Alert message={error} onClose={studio.clearError} />}
        {!manual ? (
          <EmptyState title="Bem-vindo ao Explicaí">
            Crie o primeiro manual na barra ao lado. Cada manual vira uma pasta com páginas em Markdown, pronta para o git.
          </EmptyState>
        ) : !page ? (
          <EmptyState title={manual.title} action={{ label: "Criar a primeira página", onClick: () => void studio.addPage(null) }}>
            Este manual ainda não tem páginas.
          </EmptyState>
        ) : (
          // key: cada página tem o próprio editor, criado com o conteúdo dela.
          <PageView
            key={page.id}
            manual={manual}
            page={page}
            saveState={studio.saveState}
            onEdit={studio.editPage}
            onError={studio.setError}
          />
        )}
      </main>
    </div>
  );
}
