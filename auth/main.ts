import { startHttpProcess } from "@dragoon/utils/http.ts";

const server = await startHttpProcess({
  name: "auth",
  envPrefix: "AUTH",
});

await server.finished;
