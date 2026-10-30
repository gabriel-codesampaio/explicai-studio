import { readFile } from "node:fs/promises";

export interface Size {
  w: number;
  h: number;
}

/**
 * Largura e altura de um print lendo só o cabeçalho do arquivo (PNG, JPEG, GIF, WebP e SVG).
 * A exportação precisa da proporção para desenhar setas sem entortar. Formato desconhecido: null.
 */
export async function imageSize(file: string): Promise<Size | null> {
  const b = await readFile(file);
  if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.length >= 10 && b.toString("ascii", 0, 3) === "GIF") return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return webp(b);
  if (b[0] === 0xff && b[1] === 0xd8) return jpeg(b);
  if (b.toString("utf8", 0, 512).includes("<svg")) return svg(b.toString("utf8"));
  return null;
}

function webp(b: Buffer): Size | null {
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  return null;
}

function jpeg(b: Buffer): Size | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1] ?? 0;
    // SOF0 a SOF15, menos DHT (C4), JPG (C8) e DAC (CC): é onde ficam as dimensões.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function svg(text: string): Size | null {
  const tag = /<svg[^>]*>/i.exec(text)?.[0] ?? "";
  const num = (name: string) => Number.parseFloat(new RegExp(`\\s${name}="([\\d.]+)`, "i").exec(tag)?.[1] ?? "");
  const [w, h] = [num("width"), num("height")];
  if (w > 0 && h > 0) return { w, h };
  const box = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/i.exec(tag);
  return box ? { w: Number(box[1]), h: Number(box[2]) } : null;
}
