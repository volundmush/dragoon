import { closeRuntime, connectRuntime } from "@dragoon/utils/runtime.ts";
import { waitForShutdown } from "@dragoon/utils/process.ts";
import { env } from "@dragoon/utils/env.ts";

const workerId = env("ENGINE_WORKER_ID", "engine-dev");

console.log(`engine starting as ${workerId}`);
const runtime = await connectRuntime();
console.log("engine connected to SurrealDB and loaded defs");

try {
  await waitForShutdown("engine");
} finally {
  await closeRuntime(runtime);
  console.log("engine stopped");
}
