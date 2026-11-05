import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import { t } from "@/lib/i18n";
import { aspectChanged } from "@/lib/imageAspect";
import { loadImage, refreshImage } from "@/lib/redactImage";
import { IMAGE_TYPES } from "./imageUpload";

const sizeOf = (img: HTMLImageElement) => ({ w: img.naturalWidth, h: img.naturalHeight });

/** "Trocar imagem": o arquivo novo ocupa o lugar do antigo, com as mesmas marcações. Proporção diferente pede confirmação. */
export function ReplaceImage({ slug, src, asset }: { slug: string; src: string; asset: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replace = async (file: File) => {
    setPending(null);
    try {
      const { folder } = await api.replaceAsset(slug, asset, file);
      await refreshImage(src);
      toast(t("Imagem trocada. As marcações ficaram onde estavam."), {
        action: {
          label: t("Desfazer"),
          onClick: () =>
            api.undoReplaceAsset(slug, asset, folder).then(
              () => refreshImage(src),
              (err: unknown) => toast.error(errorMessage(err)),
            ),
        },
      });
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível trocar a imagem.")));
    }
  };

  const choose = async (file: File) => {
    setError(null);
    setPending(null);
    const url = URL.createObjectURL(file);
    try {
      const [before, after] = await Promise.all([loadImage(src), loadImage(url)]);
      if (aspectChanged(sizeOf(before), sizeOf(after))) setPending(file);
      else await replace(file);
    } catch {
      setError(t("A imagem nova não pôde ser lida. Escolha outro arquivo."));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        name="imagem-nova"
        accept={IMAGE_TYPES.join(",")}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void choose(file);
        }}
      />
      <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()}>
        <ImageUp /> {t("Trocar imagem")}
      </Button>
      {pending && (
        <div role="alert" className="grid basis-full gap-2 rounded-md border border-border bg-muted p-2 text-sm">
          <p>{t("A proporção da imagem nova é diferente. As marcações podem sair do lugar: confira depois de trocar.")}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void replace(pending)}>
              {t("Trocar mesmo assim")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPending(null)}>
              {t("Cancelar")}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="basis-full text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
