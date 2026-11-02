import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudioContext } from "@/hooks/StudioContext";
import { errorMessage } from "@/lib/api";
import { t } from "@/lib/i18n";

interface Props {
  slug: string;
  /** Caminho do logo atual (`assets/logo.png`), se houver. */
  logo: string | undefined;
  disabled?: boolean;
}

/** Logo do cliente para a capa do HTML e do PDF. Envia e tira na hora; o motivo da recusa aparece embaixo. */
export function LogoField({ slug, logo, disabled }: Props) {
  const studio = useStudioContext();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      await studio.uploadManualLogo(file);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível enviar o logo.")));
    }
  };
  const remove = () =>
    studio.setManualTheme({ logo: null }).then(
      () => setError(null),
      (err: unknown) => setError(errorMessage(err)),
    );

  return (
    <div className="grid gap-2">
      <span className="rotulo">{t("Logo do cliente")}</span>
      <div className="flex items-center gap-3">
        {logo && (
          <img
            src={`/files/${encodeURIComponent(slug)}/${logo}`}
            alt={t("Logo do manual")}
            className="h-10 max-w-32 rounded-sm border border-border bg-white object-contain p-1"
          />
        )}
        <input
          ref={input}
          type="file"
          accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
          className="sr-only"
          tabIndex={-1}
          aria-label={t("Logo do cliente")}
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => input.current?.click()}>
          {logo ? t("Trocar logo") : t("Enviar logo")}
        </Button>
        {logo && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => void remove()}>
            {t("Tirar logo")}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("Aparece na capa e no topo do sumário do HTML e do PDF. PNG, JPG ou SVG, até 1 MB.")}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
