import type { IncomingMessage } from "node:http";
import { HttpError } from "./http.js";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/**
 * O Studio só atende o próprio computador. Checar Host e Origin impede que um site aberto
 * no navegador use o Studio (DNS rebinding e requisições de outra origem).
 */
export function assertLocalRequest(req: IncomingMessage): void {
  const host = (req.headers.host ?? "").replace(/:\d+$/, "");
  if (!LOCAL_HOSTS.includes(host)) throw new HttpError(403, "Acesso permitido só a partir deste computador.", "forbidden-host");
  const origin = req.headers.origin;
  if (origin && !LOCAL_ORIGIN.test(origin)) throw new HttpError(403, "Origem não permitida.", "forbidden-origin");
}
