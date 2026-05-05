import type { RecordId, SurrealTransaction } from "@surrealdb/surrealdb";
import { Character } from "@dragoon/types/character.ts";
import { Exit } from "@dragoon/types/exit.ts";
import { Item } from "@dragoon/types/item.ts";
import { Room } from "@dragoon/types/room.ts";
import { Structure } from "@dragoon/types/structure.ts";
import type { EntityContext } from "@dragoon/types/entity.ts";
import { Zone } from "@dragoon/types/zone.ts";
import type { DefsContext } from "@dragoon/defs.ts";

export type characterID = RecordId<"character">;
export type itemID = RecordId<"item">;
export type structureID = RecordId<"structure">;
export type roomID = RecordId<"room">;
export type exitID = RecordId<"exit">;
export type zoneID = RecordId<"zone">;

export class DbContext {
  public txn: SurrealTransaction;
  public defs: DefsContext;
  public now: Date;

  public characters: Map<string, Character> = new Map();
  public items: Map<string, Item> = new Map();
  public structures: Map<string, Structure> = new Map();
  public rooms: Map<string, Room> = new Map();
  public exits: Map<string, Exit> = new Map();
  public zones: Map<string, Zone> = new Map();

  constructor(txn: SurrealTransaction, defs: DefsContext, now: Date) {
    this.txn = txn;
    this.defs = defs;
    this.now = now;
  }

  async get_character(id: characterID): Promise<Character | null> {
    return await this.get_entity(
      id,
      this.characters,
      Character,
    );
  }

  async get_item(id: itemID): Promise<Item | null> {
    return await this.get_entity(id, this.items, Item);
  }

  async get_structure(id: structureID): Promise<Structure | null> {
    return await this.get_entity(
      id,
      this.structures,
      Structure,
    );
  }

  async get_room(id: roomID): Promise<Room | null> {
    return await this.get_entity(id, this.rooms, Room);
  }

  async get_exit(id: exitID): Promise<Exit | null> {
    return await this.get_entity(id, this.exits, Exit);
  }

  async get_zone(id: zoneID): Promise<Zone | null> {
    return await this.get_entity(id, this.zones, Zone);
  }

  private context(): EntityContext {
    return {
      txn: this.txn,
      defs: this.defs,
      now: this.now,
    };
  }

  private cacheKey(id: RecordId<string>): string {
    return String(id);
  }

  private async get_entity<
    TTable extends string,
    TData extends { id: RecordId<TTable> },
    TEntity,
  >(
    id: RecordId<TTable>,
    cache: Map<string, TEntity>,
    Entity: new (ctx: EntityContext, data: TData) => TEntity,
  ): Promise<TEntity | null> {
    const key = this.cacheKey(id);
    const cached = cache.get(key);

    if (cached) {
      return cached;
    }

    const data = await this.txn.select<TData>(id);

    if (!data) {
      return null;
    }

    const entity = new Entity(this.context(), data as TData);
    cache.set(key, entity);

    return entity;
  }
}
