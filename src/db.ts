import { RecordId, type SurrealTransaction, Table } from "@surrealdb/surrealdb";
import { Character, type CharacterData } from "@dragoon/types/character.ts";
import { Exit } from "@dragoon/types/exit.ts";
import { Item, type ItemData } from "@dragoon/types/item.ts";
import { Room, type RoomData } from "@dragoon/types/room.ts";
import { Structure, type StructureData } from "@dragoon/types/structure.ts";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";
import { Zone, type ZoneData } from "@dragoon/types/zone.ts";
import type { DefsContext } from "@dragoon/defs.ts";

export type characterID = RecordId<"character">;
export type itemID = RecordId<"item">;
export type structureID = RecordId<"structure">;
export type roomID = RecordId<"room">;
export type exitID = RecordId<"exit">;
export type zoneID = RecordId<"zone">;
export type npcPrototypeID = RecordId<"npc_prototype">;
export type itemPrototypeID = RecordId<"item_prototype">;
export type structurePrototypeID = RecordId<"structure_prototype">;
export type commodityID = RecordId<"commodity">;

export type CreateOptions<TTable extends string> = {
  id?: string | number | RecordId<TTable>;
};

export type PrototypeData<TTable extends string> = EntityData<TTable> & {
  name: string;
  description?: string;
  keywords?: Set<string>;
  components?: Record<string, object>;
  stats?: Record<string, number>;
  tags?: Set<string>;
  scripts?: Record<string, object>;
};

export type CommodityData = EntityData<"commodity"> & {
  name: string;
  description?: string;
  components?: Record<string, object>;
  stats?: Record<string, number>;
  tags?: Set<string>;
};

export type UserData = EntityData<"user"> & {
  email: string;
  password_hash: string;
};

export type GameSessionData = EntityData<"game_session"> & {
  character: characterID;
  puppet: characterID;
  user: RecordId<"user">;
};

export type GameEventData = EntityData<"game_event"> & {
  kind: string;
  payload?: Record<string, unknown>;
};

export type NpcPrototypeData = PrototypeData<"npc_prototype">;
export type ItemPrototypeData = PrototypeData<"item_prototype">;
export type StructurePrototypeData = PrototypeData<"structure_prototype">;

export type CreateCharacterData =
  & Omit<CharacterData, "id">
  & CreateOptions<"character">;

export type CreateItemData = Omit<ItemData, "id"> & CreateOptions<"item">;

export type CreateStructureData =
  & Omit<StructureData, "id">
  & CreateOptions<"structure">;

export type CreateRoomData = Omit<RoomData, "id"> & CreateOptions<"room">;

export type CreateZoneData = Omit<ZoneData, "id"> & CreateOptions<"zone">;

export type CreatePrototypeData<TTable extends string> =
  & Omit<
    PrototypeData<TTable>,
    "id"
  >
  & CreateOptions<TTable>;

export type CreateCommodityData =
  & Omit<CommodityData, "id">
  & CreateOptions<"commodity">;

export type CreateUserData =
  & Partial<Omit<UserData, "id">>
  & CreateOptions<"user">;

export type CreateGameSessionData =
  & Partial<Omit<GameSessionData, "id">>
  & CreateOptions<"game_session">;

export type CreateGameEventData =
  & Partial<Omit<GameEventData, "id">>
  & CreateOptions<"game_event">;

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

  async create_character(data: CreateCharacterData): Promise<Character> {
    return await this.create_entity(
      "character",
      data,
      this.characters,
      Character,
    );
  }

  async create_item(data: CreateItemData): Promise<Item> {
    return await this.create_entity("item", data, this.items, Item);
  }

  async create_structure(data: CreateStructureData): Promise<Structure> {
    return await this.create_entity(
      "structure",
      data,
      this.structures,
      Structure,
    );
  }

  async create_room(data: CreateRoomData): Promise<Room> {
    return await this.create_entity("room", data, this.rooms, Room);
  }

  async create_zone(data: CreateZoneData): Promise<Zone> {
    return await this.create_entity("zone", data, this.zones, Zone);
  }

  async create_exit(
    from: roomID,
    to: roomID,
    data: Partial<Omit<Exit["data"], "id">> = {},
  ): Promise<Exit> {
    const record = await this.txn.relate<Exit["data"]>(
      from,
      new Table("exit"),
      to,
      data,
    );
    const exit = new Exit(this.context(), record as Exit["data"]);
    this.exits.set(this.cacheKey(exit.id), exit);
    await exit.onCreate();
    return exit;
  }

  async create_user(data: CreateUserData): Promise<UserData> {
    return await this.create_record("user", data);
  }

  async create_game_session(
    data: CreateGameSessionData,
  ): Promise<GameSessionData> {
    return await this.create_record("game_session", data);
  }

  async create_game_event(data: CreateGameEventData): Promise<GameEventData> {
    return await this.create_record("game_event", data);
  }

  async create_npc_prototype(
    data: CreatePrototypeData<"npc_prototype">,
  ): Promise<NpcPrototypeData> {
    return await this.create_record("npc_prototype", data);
  }

  async create_item_prototype(
    data: CreatePrototypeData<"item_prototype">,
  ): Promise<ItemPrototypeData> {
    return await this.create_record("item_prototype", data);
  }

  async create_structure_prototype(
    data: CreatePrototypeData<"structure_prototype">,
  ): Promise<StructurePrototypeData> {
    return await this.create_record("structure_prototype", data);
  }

  async create_commodity(data: CreateCommodityData): Promise<CommodityData> {
    return await this.create_record("commodity", data);
  }

  async spawn_character(
    prototype: npcPrototypeID,
    data: CreateCharacterData = {},
  ): Promise<Character> {
    const prototypeData = await this.require_record<NpcPrototypeData>(
      prototype,
    );
    const character = await this.create_entity(
      "character",
      { ...this.spawnData(prototypeData), ...data, prototype },
      this.characters,
      Character,
      false,
    );
    await character.onSpawn();
    return character;
  }

  async spawn_item(
    prototype: itemPrototypeID,
    data: CreateItemData = {},
  ): Promise<Item> {
    const prototypeData = await this.require_record<ItemPrototypeData>(
      prototype,
    );
    const item = await this.create_entity(
      "item",
      { ...this.spawnData(prototypeData), ...data, prototype },
      this.items,
      Item,
      false,
    );
    await item.onSpawn();
    return item;
  }

  async spawn_structure(
    prototype: structurePrototypeID,
    data: CreateStructureData = {},
  ): Promise<Structure> {
    const prototypeData = await this.require_record<StructurePrototypeData>(
      prototype,
    );
    const structure = await this.create_entity(
      "structure",
      { ...this.spawnData(prototypeData), ...data, prototype },
      this.structures,
      Structure,
      false,
    );
    await structure.onSpawn();
    return structure;
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

  private async create_record<
    TTable extends string,
    TData extends EntityData<TTable>,
  >(
    table: TTable,
    data: Partial<Omit<TData, "id">> & CreateOptions<TTable>,
  ): Promise<TData> {
    const { id, ...content } = data;
    const values = content as Partial<TData>;
    const target = id instanceof RecordId
      ? id
      : id === undefined
      ? new Table(table)
      : new RecordId(table, id);
    const created = id
      ? await this.txn.create<TData>(target as RecordId<TTable>).content(values)
      : await this.txn.create<TData>(target as Table<string>).content(values);
    const record = Array.isArray(created) ? created[0] : created;

    if (!record) {
      throw new Error(`Failed to create ${table} record`);
    }

    return record as TData;
  }

  private async require_record<TData extends EntityData<string>>(
    id: TData["id"],
  ): Promise<TData> {
    const record = await this.txn.select<TData>(id);

    if (!record) {
      throw new Error(`Record not found: ${id}`);
    }

    return record as TData;
  }

  private spawnData<TTable extends string>(
    prototype: PrototypeData<TTable>,
  ): Record<string, unknown> {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...data } =
      prototype;
    return data;
  }

  private async create_entity<
    TTable extends string,
    TData extends EntityData<TTable>,
    TEntity extends Entity<TTable, TData>,
  >(
    table: TTable,
    data: Partial<Omit<TData, "id">> & CreateOptions<TTable>,
    cache: Map<string, TEntity>,
    Entity: new (ctx: EntityContext, data: TData) => TEntity,
    callCreateHook = true,
  ): Promise<TEntity> {
    const record = await this.create_record<TTable, TData>(table, data);
    const entity = new Entity(this.context(), record);

    cache.set(this.cacheKey(entity.id), entity);

    if (callCreateHook) {
      await entity.onCreate();
    }

    return entity;
  }
}
