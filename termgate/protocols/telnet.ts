const encoder = new TextEncoder();

export async function handleTelnetConnection(
  conn: Deno.Conn,
  secure: boolean,
): Promise<void> {
  const label = secure ? "TELNETS" : "TELNET";

  try {
    await conn.write(
      encoder.encode(
        `${label} Dragoon termgate placeholder connected.\r\n` +
          `Protocol handling is not implemented yet.\r\n`,
      ),
    );
  } finally {
    try {
      conn.close();
    } catch {
      // Ignore close races during early connection scaffolding.
    }
  }
}
