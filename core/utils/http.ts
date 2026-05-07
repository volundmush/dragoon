import { envBool, envInt } from "@dragoon/utils/env.ts";
import { loadTlsConfig } from "@dragoon/utils/tls.ts";

export type HttpProcessOptions = {
  name: string;
  envPrefix: string;
  handler?: Deno.ServeHandler;
};

export function healthResponse(name: string): Response {
  return Response.json({
    ok: true,
    process: name,
    now: new Date().toISOString(),
  });
}

export async function startHttpProcess(
  options: HttpProcessOptions,
): Promise<Deno.HttpServer> {
  const { name, envPrefix } = options;
  const useTls = envBool(`${envPrefix}_HTTPS_ENABLED`, false);
  const hostname = Deno.env.get(
    useTls ? `${envPrefix}_HTTPS_HOST` : `${envPrefix}_HTTP_HOST`,
  ) ?? "127.0.0.1";
  const port = envInt(
    useTls ? `${envPrefix}_HTTPS_PORT` : `${envPrefix}_HTTP_PORT`,
    useTls ? 443 : 80,
  );
  const protocol = Deno.env.get(`${envPrefix}_HTTP_PROTOCOL`) ?? "auto";
  const handler = options.handler ?? (() => healthResponse(name));

  if (useTls) {
    const tls = await loadTlsConfig();
    console.log(
      `${name} listening on https://${hostname}:${port} protocol=${protocol}`,
    );
    return Deno.serve(
      { hostname, port, cert: tls.cert, key: tls.key },
      handler,
    );
  }

  console.log(
    `${name} listening on http://${hostname}:${port} protocol=${protocol}`,
  );
  return Deno.serve({ hostname, port }, handler);
}
