import { LegacyDatabase, prepareMigration } from "@scripts/legacy.ts";
import {
  RecordId,
  Surreal,
  SurrealTransaction,
  Table,
} from "@surrealdb/surrealdb";

export function strip_ansi(s: string): string {
  let out = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (c !== "@") {
      out += c;
      continue;
    }

    if (s[i + 1] === "@") {
      out += "@";
    }

    i++;
  }

  return out;
}

function toDirection(dir: number): string {
  switch (dir) {
    case 0:
      return "north";
    case 1:
      return "east";
    case 2:
      return "south";
    case 3:
      return "west";
    case 4:
      return "up";
    case 5:
      return "down";
    case 6:
      return "northwest";
    case 7:
      return "northeast";
    case 8:
      return "southeast";
    case 9:
      return "southwest";
    case 10:
      return "in";
    case 11:
      return "out";
    default:
      return "unknown";
  }
}

export function parse_keywords(s: string): string[] {
  const ignored = new Set([
    "a",
    "an",
    "and",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  return strip_ansi(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((kw) => kw.length > 0 && !ignored.has(kw));
}

function toKeywordSet(s: string): Set<string> | undefined {
  const keywords = parse_keywords(s);

  if (keywords.length === 0) {
    return undefined;
  }

  return new Set(keywords);
}

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

export type Zone = {
  name: string;
};

export type Room = {
  name: string;
  description?: string;
  within: RecordId<"zone">;
};

export type ExitData = {
  direction: string;
};
export type Exit = {
  fromRoom: number;
  toRoom: number;
  data: ExitData;
};

export type NPC = {
  name: string;
  keywords?: Set<string>;
  description?: string;
};

export type Item = {
  name: string;
  keywords?: Set<string>;
  description?: string;
};

export class Migrator {
  public readonly db: LegacyDatabase;
  private txn: SurrealTransaction;
  public zones: Map<number, Zone> = new Map();
  public rooms: Map<number, Room> = new Map();
  public npcs: Map<number, NPC> = new Map();
  public items: Map<number, Item> = new Map();
  public exits: Exit[] = [];

  constructor(db: LegacyDatabase, txn: SurrealTransaction) {
    this.db = db;
    this.txn = txn;
  }

  private logProgress(
    label: string,
    current: number,
    total: number,
    every: number,
  ) {
    if (current % every === 0 || current === total) {
      console.log(`${label} ${current}/${total}`);
    }
  }

  zone_for_id(id: number): number {
    // iterate through this.db.zones and find the one that contains this given id using bot and top (inclusive)
    for (const [number, zone] of this.db.zones) {
      if (id >= zone.bot && id <= zone.top) {
        return number;
      }
    }
    return -1;
  }

  prepare_zones() {
    let index = 0;
    const total = this.db.zones.size;
    for (const [number, zone] of this.db.zones) {
      index++;
      this.zones.set(number, {
        name: strip_ansi(zone.name),
      });
      this.logProgress("prepare zones", index, total, 10);
    }
    console.log(`prepare zones done ${this.zones.size}/${total}`);
  }

  prepare_rooms() {
    let index = 0;
    const total = this.db.rooms.size;
    for (const [id, room] of this.db.rooms) {
      index++;
      this.rooms.set(id, {
        name: strip_ansi(room.name),
        description: strip_ansi(room.description),
        within: new RecordId("zone", this.zone_for_id(id)),
      });
      this.logProgress("prepare rooms", index, total, 1000);
    }
    console.log(`prepare rooms done ${this.rooms.size}/${total}`);
  }

  prepare_exits() {
    let index = 0;
    const total = [...this.db.rooms].reduce(
      (sum, [, room]) => sum + room.exits.size,
      0,
    );
    for (const [id, room] of this.db.rooms) {
      for (const [dir, exit] of room.exits) {
        index++;
        if(exit.toRoom === -1 || !this.db.rooms.has(exit.toRoom)) {
          continue;
        }
        this.exits.push({
          fromRoom: id,
          toRoom: exit.toRoom,
          data: {
            direction: toDirection(dir),
          },
        });
        this.logProgress("prepare exits", index, total, 1000);
      }
    }
    console.log(`prepare exits done ${this.exits.length}/${total}`);
  }

  prepare_npcs() {
    let index = 0;
    const total = this.db.nproto.size;
    for (const [id, npc] of this.db.nproto) {
      index++;
      this.npcs.set(id, {
        name: strip_ansi(npc.shortDescr),
        keywords: toKeywordSet(npc.name),
        description: strip_ansi(npc.description),
      });
      this.logProgress("prepare npcs", index, total, 100);
    }
    console.log(`prepare npcs done ${this.npcs.size}/${total}`);
  }

  prepare_items() {
    let index = 0;
    const total = this.db.oproto.size;
    for (const [id, item] of this.db.oproto) {
      index++;
      this.items.set(id, {
        name: strip_ansi(item.shortDescription),
        keywords: toKeywordSet(item.name),
        description: strip_ansi(item.description),
      });
      this.logProgress("prepare items", index, total, 100);
    }
    console.log(`prepare items done ${this.items.size}/${total}`);
  }

  prepare() {
    this.prepare_zones();
    this.prepare_rooms();
    this.prepare_exits();
    this.prepare_npcs();
    this.prepare_items();
  }

  async migrate_zones() {
    let index = 0;
    const total = this.zones.size;
    for (const [id, zone] of this.zones) {
      index++;
      const rec = new RecordId("zone", id);
      await this.txn.create(rec).content(zone);
      this.logProgress("migrate zones", index, total, 10);
    }
    console.log(`migrate zones done ${this.zones.size}/${total}`);
  }

  async migrate_rooms() {
    let index = 0;
    const total = this.rooms.size;
    for (const [id, room] of this.rooms) {
      index++;
      const rec = new RecordId("room", id);
      await this.txn.create(rec).content(room);
      this.logProgress("migrate rooms", index, total, 1000);
    }
    console.log(`migrate rooms done ${this.rooms.size}/${total}`);
  }

  async migrate_items() {
    let index = 0;
    const total = this.items.size;
    for (const [id, item] of this.items) {
      index++;
      const rec = new RecordId("item_prototype", id);
      await this.txn.create(rec).content(item);
      this.logProgress("migrate items", index, total, 100);
    }
    console.log(`migrate items done ${this.items.size}/${total}`);
  }

  async migrate_npcs() {
    let index = 0;
    const total = this.npcs.size;
    for (const [id, npc] of this.npcs) {
      index++;
      const rec = new RecordId("npc_prototype", id);
      await this.txn.create(rec).content(npc);
      this.logProgress("migrate npcs", index, total, 100);
    }
    console.log(`migrate npcs done ${this.npcs.size}/${total}`);
  }

  async migrate_exits() {
    let index = 0;
    const total = this.exits.length;
    for (const exit of this.exits) {
      index++;
      await this.txn.relate(
        new RecordId("room", exit.fromRoom),
        new Table("exit"),
        new RecordId("room", exit.toRoom),
        exit.data,
      );
      this.logProgress("migrate exits", index, total, 1000);
    }
    console.log(`migrate exits done ${this.exits.length}/${total}`);
  }

  async migrate() {
    await this.migrate_zones();
    await this.migrate_rooms();
    await this.migrate_items();
    await this.migrate_npcs();
    await this.migrate_exits();
  }
}

export async function migrate() {
  console.log("Connecting to SurrealDB...");
  // Connect to SurrealDB
  const db = new Surreal();
  const url = env(
    "SURREALDB_HOST_URL",
    env("SURREALDB_URL", "ws://localhost:8000/rpc"),
  );
  const namespace = env("SURREALDB_NS", "dragoon");
  const database = env("SURREALDB_DB", "dev");
  const username = env("SURREALDB_USER", "root");
  const password = env("SURREALDB_PASS", "root");

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
  console.log("Connected to SurrealDB");

  try {
    console.log("Loading legacy database...");
    const legacy = await prepareMigration("./data");
    console.log("Legacy database loaded");

    const txn = await db.beginTransaction();

    const migrator = new Migrator(legacy, txn);

    migrator.prepare();
    await migrator.migrate();

    await txn.commit();
    console.log("Legacy migration committed");
  } finally {
    if (db.isConnected) {
      await db.close();
    }
  }
}

if (import.meta.main) {
  await migrate();
}
