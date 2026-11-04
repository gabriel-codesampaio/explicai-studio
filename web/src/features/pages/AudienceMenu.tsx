import { ChevronDown, Users } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from "@/components/ui/popover";
import { AudiencesDialog } from "@/features/settings/AudiencesDialog";
import { t } from "@/lib/i18n";

/** Quem vê a página no manual exportado. Sem nenhum perfil marcado, todos veem. */
export function AudienceMenu({
  audience,
  known,
  onChange,
}: {
  audience: string[];
  known: string[];
  onChange: (audience: string[]) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState("");
  const [managing, setManaging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // O que a pessoa já escolheu e ainda está gravando: o clique seguinte parte daqui, não do valor antigo (T-135).
  const [pending, setPending] = useState<string[] | null>(null);
  const inFlight = useRef(0);
  const current = pending ?? audience;
  const change = (next: string[]) => {
    setPending(next);
    inFlight.current += 1;
    void Promise.resolve(onChange(next)).finally(() => {
      inFlight.current -= 1;
      if (inFlight.current === 0) setPending(null);
    });
  };
  const options = [...new Set([...known, ...current])];
  const toggle = (name: string) => change(current.includes(name) ? current.filter((a) => a !== name) : [...current, name]);
  const add = (e: FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (name && !current.includes(name)) change([...current, name]);
    setDraft("");
  };
  const summary = current.length ? current.join(", ") : t("Todos");

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("Público da página: {publico}", { publico: summary })}
            className="flex max-w-48 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium [@media(pointer:coarse)]:min-h-11 hover:bg-muted data-[state=open]:bg-muted"
          >
            <Users className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{summary}</span>
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" collisionPadding={8} aria-label={t("Público da página")} className="w-72 gap-3">
          <fieldset className="grid gap-1">
            <legend className="mb-1 rotulo">{t("Quem vê esta página")}</legend>
            {options.map((name) => (
              <label
                key={name}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm hover:bg-muted [@media(pointer:coarse)]:min-h-11"
              >
                <input
                  type="checkbox"
                  checked={current.includes(name)}
                  onChange={() => toggle(name)}
                  className="size-4 accent-[var(--primary)]"
                />
                {name}
              </label>
            ))}
          </fieldset>
          <form onSubmit={add} className="mt-2 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={40}
              aria-label={t("Novo perfil")}
              placeholder={t("Ex.: admin")}
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm [@media(pointer:coarse)]:min-h-11"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-md px-2.5 py-1.5 text-sm font-bold text-primary hover:bg-accent disabled:opacity-50"
            >
              {t("Adicionar")}
            </button>
          </form>
          <PopoverDescription className="text-xs">
            {t(
              "Sem nenhum perfil marcado, a página vale para todos. Só filtra o que você exporta: os arquivos do manual guardam tudo.",
            )}
          </PopoverDescription>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setManaging(true);
            }}
            className="self-start rounded-md px-1.5 py-1 text-sm font-bold text-primary hover:bg-accent [@media(pointer:coarse)]:min-h-11"
          >
            {t("Gerenciar públicos…")}
          </button>
        </PopoverContent>
      </Popover>
      <AudiencesDialog open={managing} onOpenChange={setManaging} />
    </>
  );
}
