import { startHttpProcess } from "@dragoon/utils/http.ts";

const server = await startHttpProcess({
  name: "portal",
  envPrefix: "PORTAL",
});

await server.finished;
