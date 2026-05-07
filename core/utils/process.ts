export function waitForShutdown(label: string): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const shutdown = () => {
      if (done) {
        return;
      }

      done = true;
      Deno.removeSignalListener("SIGINT", shutdown);
      Deno.removeSignalListener("SIGTERM", shutdown);
      console.log(`${label} shutting down`);
      resolve();
    };

    Deno.addSignalListener("SIGINT", shutdown);
    Deno.addSignalListener("SIGTERM", shutdown);
  });
}
