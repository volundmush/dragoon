import { Surreal } from "@surrealdb/surrealdb";

type Migration = {
  name: string;
  path: string;
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

async function listMigrations(schemaDir: string): Promise<Migration[]> {
  const migrations: Migration[] = [];

  for await (const entry of Deno.readDir(schemaDir)) {
    if (!entry.isFile || !entry.name.endsWith(".surql")) {
      continue;
    }

    migrations.push({
      name: entry.name,
      path: `${schemaDir}/${entry.name}`,
    });
  }

  migrations.sort((a, b) => a.name.localeCompare(b.name));
  return migrations;
}

async function ensureMigrationsTable(db: Surreal): Promise<void> {
  await db.query(`
    DEFINE TABLE IF NOT EXISTS migrations SCHEMAFULL;
    DEFINE FIELD IF NOT EXISTS name ON migrations TYPE string;
    DEFINE FIELD IF NOT EXISTS created_at ON migrations TYPE datetime DEFAULT time::now();
  `).collect();
}

async function appliedMigrations(db: Surreal): Promise<Set<string>> {
  const [names] = await db.query<[string[]]>(
    "SELECT VALUE name FROM migrations;",
  ).collect();

  return new Set(names);
}

async function applyMigration(
  db: Surreal,
  migration: Migration,
): Promise<void> {
  const sql = await Deno.readTextFile(migration.path);
  const txn = await db.beginTransaction();

  try {
    await txn.query(sql).collect();
    await txn.query(
      "CREATE migrations SET name = $name;",
      { name: migration.name },
    ).collect();
    await txn.commit();
  } catch (error) {
    try {
      await txn.cancel();
    } catch (cancelError) {
      console.error(
        `Failed to cancel migration transaction: ${migration.name}`,
      );
      console.error(cancelError);
    }

    throw error;
  }
}

async function main(): Promise<void> {
  const url = env(
    "SURREALDB_HOST_URL",
    env("SURREALDB_URL", "ws://localhost:8000/rpc"),
  );
  const namespace = env("SURREALDB_NS", "dragoon");
  const database = env("SURREALDB_DB", "dev");
  const username = env("SURREALDB_USER", "root");
  const password = env("SURREALDB_PASS", "root");
  const schemaDir = `${Deno.cwd()}/schema`;

  const db = new Surreal();

  try {
    await withTimeout(
      db.connect(url, {
        namespace,
        database,
        authentication: {
          username,
          password,
        },
      }),
      `Timed out connecting to SurrealDB at ${url}`,
    );

    await ensureMigrationsTable(db);

    const applied = await appliedMigrations(db);
    const migrations = await listMigrations(schemaDir);

    for (const migration of migrations) {
      if (applied.has(migration.name)) {
        console.log(`skip ${migration.name}`);
        continue;
      }

      console.log(`apply ${migration.name}`);
      await applyMigration(db, migration);
      applied.add(migration.name);
      console.log(`done  ${migration.name}`);
    }
  } finally {
    if (db.isConnected) {
      await db.close();
    }
  }
}

if (import.meta.main) {
  await main();
}
