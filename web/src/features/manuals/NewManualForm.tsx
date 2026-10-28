import { useState } from "react";

interface Props {
  /** Recolhido mostra só o botão "+ Novo manual". Aberto é o formulário (primeiro uso). */
  startOpen: boolean;
  onCreate: (title: string) => Promise<void>;
}

export function NewManualForm({ startOpen, onCreate }: Props) {
  const [open, setOpen] = useState(startOpen);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <button type="button" className="link-btn new-manual" onClick={() => setOpen(true)}>
        + Novo manual
      </button>
    );
  }

  return (
    <form
      className="new-manual-form"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = title.trim();
        if (!clean) return;
        void onCreate(clean).then(() => {
          setTitle("");
          setOpen(startOpen);
        });
      }}
    >
      <label htmlFor="new-manual-title">Novo manual</label>
      <input id="new-manual-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Manual do Financeiro" />
      <button type="submit" className="primary" disabled={!title.trim()}>
        Criar manual
      </button>
    </form>
  );
}
