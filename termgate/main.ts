import { envBool, envInt } from "@dragoon/utils/env.ts";
import { loadTlsConfig } from "@dragoon/utils/tls.ts";
import { waitForShutdown } from "@dragoon/utils/process.ts";
import { handleTelnetConnection } from "@termgate/protocols/telnet.ts";

async function acceptLoop(
  listener: Deno.Listener,
  secure: boolean,
): Promise<void> {
  for await (const conn of listener) {
    handleTelnetConnection(conn, secure).catch((error) => {
      console.error("termgate connection error");
      console.error(error);
    });
  }
}

const listeners: Deno.Listener[] = [];
const defaultHost = Deno.env.get("TERMGATE_ADDRESS") ?? "127.0.0.1";

if (envBool("TELNET_ENABLED", true)) {
  const hostname = Deno.env.get("TELNET_HOST") ?? defaultHost;
  const port = envInt("TELNET_PORT", 2323);
  const listener = Deno.listen({ hostname, port, transport: "tcp" });
  listeners.push(listener);
  console.log(`termgate listening on telnet://${hostname}:${port}`);
  acceptLoop(listener, false).catch(() => {});
}

if (envBool("TELNETS_ENABLED", false)) {
  const hostname = Deno.env.get("TELNETS_HOST") ?? defaultHost;
  const port = envInt("TELNETS_PORT", 9923);
  const tls = await loadTlsConfig();
  const listener = Deno.listenTls({
    hostname,
    port,
    cert: tls.cert,
    key: tls.key,
  });
  listeners.push(listener);
  console.log(`termgate listening on telnets://${hostname}:${port}`);
  acceptLoop(listener, true).catch(() => {});
}

if (listeners.length === 0) {
  throw new Error("No termgate listeners are enabled");
}

await waitForShutdown("termgate");

for (const listener of listeners) {
  listener.close();
}

console.log("termgate stopped");
