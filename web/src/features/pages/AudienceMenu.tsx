import { ChevronDown, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";

/** Quem vê a página no manual exportado. Sem nenhum perfil marcado, todos veem. */
export function AudienceMenu({
  audience,
  known,
  onChange,
}: {
  audience: string[];
  known: string[];
  onChange: (audience: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const options = [...new Set([...known, ...audience])];
  const toggle = (name: string) => onChange(audience.includes(name) ? audience.filter((a) => a !== name) : [...audience, name]);
  const add = (e: FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (name && !audience.includes(name)) onChange([...audience, name]);
    setDraft("");
  };
  const summary = audience.length ? audience.join(", ") : t("Todos");

  return (
    <Popover>
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
      <PopoverContent align="end" collisionPadding={8} className="w-72 gap-3">
        <fieldset className="grid gap-1">
          <legend className="mb-1 rotulo">{t("Quem vê esta página")}</legend>
          {options.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm hover:bg-muted [@media(pointer:coarse)]:min-h-11"
            >
              <input
                type="checkbox"
                checked={audience.includes(name)}
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
      </PopoverContent>
    </Popover>
  );
}
