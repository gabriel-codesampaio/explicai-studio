import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { loadImage, redactableType } from "@/lib/redactImage";
import { hasQuality, previewBytes, reducedSize, reduceImage, SUGGESTED_WIDTH } from "@/lib/reduceImage";

interface Props {
  slug: string;
  asset: string;
  src: string;
  /** Há áreas a ocultar ou recorte ainda não aplicados: as operações no arquivo não se misturam. */
  pending: boolean;
  inGit: boolean;
  onApplied: () => void;
}

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Lê tamanho e peso. Cada etapa tem a sua mensagem, para dizer qual falhou. */
async function readImage(src: string) {
  const res = await fetch(src).catch(() => null);
  if (!res?.ok) throw new Error(t("Não foi possível carregar a imagem. O servidor não entregou o arquivo."));
  const blob = await res.blob();
  const img = await loadImage(src).catch(() => {
    throw new Error(t("Não foi possível carregar a imagem. O navegador não conseguiu abrir o arquivo."));
  });
  return { w: img.naturalWidth, h: img.naturalHeight, bytes: blob.size };
}

/** Linha "Reduzir imagem": mostra tamanho atual, largura sugerida e peso previsto. Só aparece quando dá para diminuir. */
export function ReducePanel({ slug, asset, src, pending, inGit, onApplied }: Props) {
  const [info, setInfo] = useState<{ w: number; h: number; bytes: number } | null>(null);
  const [width, setWidth] = useState(SUGGESTED_WIDTH);
  const [quality, setQuality] = useState(85);
  const [preview, setPreview] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rev, setRev] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const type = redactableType(asset);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `rev` força reler tamanho e peso depois de reduzir (a src não muda).
  useEffect(() => {
    if (!type) return;
    let live = true;
    setLoadError(null);
    readImage(src)
      .then((next) => live && setInfo(next))
      .catch((e: Error) => live && setLoadError(e.message));
    return () => {
      live = false;
    };
  }, [src, type, rev]);

  useEffect(() => {
    if (!info || !reducedSize(info.w, info.h, width)) {
      setPreview(null);
      return;
    }
    let live = true;
    const timer = setTimeout(() => {
      previewBytes(asset, src, width, quality / 100)
        .then((n) => live && setPreview(n))
        .catch(() => live && setPreview(null));
    }, 200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [info, asset, src, width, quality]);

  if (!type) return null;
  if (loadError) {
    return (
      <section className="grid gap-2 rounded-md border border-border p-3" aria-label={t("Reduzir imagem")}>
        <h3 className="rotulo">{t("Reduzir imagem")}</h3>
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
        <Button size="sm" variant="outline" onClick={() => setRev((n) => n + 1)} className="[@media(pointer:coarse)]:h-11">
          {t("Tentar de novo")}
        </Button>
      </section>
    );
  }
  if (!info) return null;
  const size = reducedSize(info.w, info.h, width);
  // Imagem que já cabe na largura sugerida não oferece reduzir.
  if (info.w <= SUGGESTED_WIDTH) return null;

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      await reduceImage(slug, asset, src, width, quality / 100);
      setRev((n) => n + 1);
      onApplied();
    } catch {
      setError(t("Não foi possível reduzir. A imagem não foi alterada."));
    } finally {
      setConfirming(false);
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-2 rounded-md border border-border p-3" aria-label={t("Reduzir imagem")}>
      <h3 className="rotulo">{t("Reduzir imagem")}</h3>
      <p className="text-sm">
        {t("Atual")}: {info.w} × {info.h} px, {kb(info.bytes)}
      </p>
      <label className="grid gap-1 text-sm">
        {t("Largura (px)")}
        <input
          type="number"
          min={1}
          max={info.w - 1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="h-9 rounded-md border border-border bg-background px-2"
        />
      </label>
      {hasQuality(asset) && (
        <label className="grid gap-1 text-sm">
          {t("Qualidade")}: {quality}
          <input type="range" min={50} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        </label>
      )}
      <p role="note" className="text-sm text-muted-foreground">
        {size
          ? `${t("Depois")}: ${size.w} × ${size.h} px${preview ? `, ~${kb(preview)}` : ""}`
          : t("A largura precisa ser menor que a atual. Nunca amplia.")}
      </p>
      {pending && (
        <p className="text-sm text-muted-foreground">{t("Aplique ou descarte o que está pendente antes de reduzir.")}</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button size="sm" variant="outline" onClick={() => setConfirming(true)} disabled={!size || pending}>
        {t("Reduzir")}
      </Button>
      {confirming && (
        <ConfirmDialog
          title={t("Reduzir a imagem?")}
          confirmLabel={busy ? t("Reduzindo…") : t("Reduzir e apagar o original")}
          busy={busy}
          onConfirm={() => void apply()}
          onCancel={() => setConfirming(false)}
        >
          <p>
            {t(
              "Isto troca o print por uma versão com menos pixels. O original será apagado e não dá para voltar. As marcações continuam no mesmo lugar.",
            )}
          </p>
          {inGit && <p>{t("Esta pasta está no git: o original continua no histórico, e limpar o histórico é com você.")}</p>}
          <p>{t("Exportações anteriores ainda têm o original. Exporte de novo e apague os arquivos antigos.")}</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
