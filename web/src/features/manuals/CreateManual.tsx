import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  /** Primeiro uso: sem nenhum manual na pasta ainda. Muda o título e esconde "Cancelar". */
  firstRun: boolean;
  onCreate: (title: string) => Promise<void>;
  onCancel: () => void;
}

export function CreateManual({ firstRun, onCreate, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const clean = title.trim();

  return (
    <form
      className="mx-auto mt-[16vh] grid max-w-lg gap-5 px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (clean) void onCreate(clean);
      }}
    >
      <div className="grid gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight [font-stretch:108%] text-balance">
          {firstRun ? "Qual sistema você vai explicar?" : "Novo manual"}
        </h1>
        <p className="text-muted-foreground">
          Cada manual vira uma pasta com uma página em Markdown para cada tela ou tarefa. Dá para versionar no git junto com o
          código.
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="new-manual-title" className="text-sm font-bold">
          Nome do manual
        </label>
        <Input
          id="new-manual-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Manual do Financeiro"
          className="h-10 bg-card text-base"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!clean}>
          Criar manual
        </Button>
        {!firstRun && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
