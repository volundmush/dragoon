import { env } from "@dragoon/utils/env.ts";

export type TlsConfig = {
  cert: string;
  key: string;
};

export async function loadTlsConfig(): Promise<TlsConfig> {
  const certFile = env("TLS_CERT_PATH", ".certs/localhost.crt");
  const keyFile = env("TLS_KEY_PATH", ".certs/localhost.key");

  const [cert, key] = await Promise.all([
    Deno.readTextFile(certFile),
    Deno.readTextFile(keyFile),
  ]);

  return { cert, key };
}
