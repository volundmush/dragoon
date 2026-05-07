import {
  RecordId,
  Surreal,
  type SurrealTransaction,
} from "@surrealdb/surrealdb";
import { DbContext } from "@dragoon/db.ts";
import { DefsContext } from "@dragoon/defs.ts";
import type { OperationContext, OperationEvent } from "@dragoon/operation.ts";

type ReplEvent = OperationEvent & {
  type: "repl";
};

type ReplContext = OperationContext<ReplEvent>;

type ReplGlobal = typeof globalThis & {
  surreal: Surreal;
  defs: DefsContext;
  txn: SurrealTransaction;
  ctx: ReplContext;
  db: DbContext;
  rid: <TTable extends string>(
    table: TTable,
    id: string | number,
  ) => RecordId<TTable>;
  character: (id: string | number | RecordId<"character">) => ReturnType<
    DbContext["get_character"]
  >;
  item: (id: string | number | RecordId<"item">) => ReturnType<
    DbContext["get_item"]
  >;
  room: (id: string | number | RecordId<"room">) => ReturnType<
    DbContext["get_room"]
  >;
  zone: (id: string | number | RecordId<"zone">) => ReturnType<
    DbContext["get_zone"]
  >;
  structure: (id: string | number | RecordId<"structure">) => ReturnType<
    DbContext["get_structure"]
  >;
  exit: (id: string | number | RecordId<"exit">) => ReturnType<
    DbContext["get_exit"]
  >;
  commit: () => Promise<ReplContext>;
  cancel: () => Promise<ReplContext>;
  reset: () => Promise<ReplContext>;
  reloadDefs: () => Promise<DefsContext>;
  close: () => Promise<void>;
};

function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback;

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function withTimeout<T>(
  promise: Promise<T>,
  message: string,
  ms = 10_000,
): Promise<T> {
  let timeoutId: number | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function id<TTable extends string>(
  table: TTable,
  value: string | number | RecordId<TTable>,
): RecordId<TTable> {
  if (value instanceof RecordId) {
    return value;
  }

  return new RecordId(table, value);
}

const g = globalThis as ReplGlobal;

g.surreal = new Surreal();
g.defs = new DefsContext();

g.rid = <TTable extends string>(table: TTable, id: string | number) => {
  return new RecordId(table, id);
};

g.character = (idValue) => g.db.get_character(id("character", idValue));
g.item = (idValue) => g.db.get_item(id("item", idValue));
g.room = (idValue) => g.db.get_room(id("room", idValue));
g.zone = (idValue) => g.db.get_zone(id("zone", idValue));
g.structure = (idValue) => g.db.get_structure(id("structure", idValue));
g.exit = (idValue) => g.db.get_exit(id("exit", idValue));

async function beginOperation(): Promise<ReplContext> {
  const txn = await g.surreal.beginTransaction();
  const now = new Date();
  const ctx: ReplContext = {
    txn,
    db: new DbContext(txn, g.defs, now),
    defs: g.defs,
    event: { type: "repl" },
    now,
  };

  g.txn = txn;
  g.ctx = ctx;
  g.db = ctx.db;

  return ctx;
}

g.commit = async () => {
  await g.txn.commit();
  console.log("Committed REPL transaction; opened a new transaction.");
  return await beginOperation();
};

g.cancel = async () => {
  await g.txn.cancel();
  console.log("Cancelled REPL transaction; opened a new transaction.");
  return await beginOperation();
};

g.reset = async () => {
  try {
    await g.txn.cancel();
  } catch {
    // The transaction may already be committed/cancelled; reset should still open a new one.
  }

  console.log("Reset REPL transaction.");
  return await beginOperation();
};

g.reloadDefs = async () => {
  g.defs = new DefsContext();
  await g.defs.loadDefs(env("DRAGOON_DEFS_PATH", "./def"));

  if (g.txn) {
    await g.reset();
  }

  console.log("Reloaded defs.");
  return g.defs;
};

g.close = async () => {
  try {
    if (g.txn) {
      await g.txn.cancel();
    }
  } catch {
    // Ignore close-time transaction state errors.
  }

  if (g.surreal.isConnected) {
    await g.surreal.close();
  }

  console.log("Closed REPL transaction and SurrealDB connection.");
};

const url = env(
  "SURREALDB_HOST_URL",
  env("SURREALDB_URL", "ws://localhost:8000/rpc"),
);

await withTimeout(
  g.surreal.connect(url, {
    namespace: env("SURREALDB_NS", "dragoon"),
    database: env("SURREALDB_DB", "dev"),
    authentication: {
      username: env("SURREALDB_USER", "root"),
      password: env("SURREALDB_PASS", "root"),
    },
  }),
  `Timed out connecting to SurrealDB at ${url}`,
);

await g.defs.loadDefs(env("DRAGOON_DEFS_PATH", "./def"));
await beginOperation();

console.log("Dragoon REPL ready.");
console.log("Globals: ctx, db, defs, txn, surreal, rid");
console.log(
  "Helpers: character(id), item(id), room(id), zone(id), structure(id), exit(id)",
);
console.log(
  "Transaction controls: await commit(), await cancel(), await reset(), await close()",
);
console.log('Example: const c = await character(1); c?.stat_get("might")');
