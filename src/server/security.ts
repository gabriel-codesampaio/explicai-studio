import type { IncomingMessage } from "node:http";
import { HttpError } from "./http.js";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/**
 * O Studio só atende o próprio computador. Checar Host e Origin (que deve ser igual ao Host) impede que um site aberto
 * no navegador use o Studio (DNS rebinding e requisições de outra origem).
 */
export function assertLocalRequest(req: IncomingMessage): void {
  const fullHost = req.headers.host ?? "";
  const host = fullHost.replace(/:\d+$/, "");
  if (!LOCAL_HOSTS.includes(host)) throw new HttpError(403, "Acesso permitido só a partir deste computador.", "forbidden-host");
  const origin = req.headers.origin;
  // Mesma origem do Host, porta inclusa. O proxy do Vite não reescreve o Host (changeOrigin desligado), então 5173 bate com 5173.
  if (origin && origin !== `http://${fullHost}`) throw new HttpError(403, "Origem não permitida.", "forbidden-origin");
}
