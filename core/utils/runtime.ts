import { Surreal } from "@surrealdb/surrealdb";
import { DefsContext } from "@dragoon/defs.ts";
import { env } from "@dragoon/utils/env.ts";

export type RuntimeContext = {
  surreal: Surreal;
  defs: DefsContext;
};

export async function connectRuntime(): Promise<RuntimeContext> {
  const surreal = new Surreal();
  const defs = new DefsContext();
  const url = env(
    "SURREALDB_HOST_URL",
    env("SURREALDB_URL", "ws://localhost:8000/rpc"),
  );

  await surreal.connect(url, {
    namespace: env("SURREALDB_NS", "dragoon"),
    database: env("SURREALDB_DB", "dev"),
    authentication: {
      username: env("SURREALDB_USER", "root"),
      password: env("SURREALDB_PASS", "root"),
    },
  });

  await defs.loadDefs(env("DRAGOON_DEFS_PATH", "./def"));

  return { surreal, defs };
}

export async function closeRuntime(runtime: RuntimeContext): Promise<void> {
  if (runtime.surreal.isConnected) {
    await runtime.surreal.close();
  }
}
