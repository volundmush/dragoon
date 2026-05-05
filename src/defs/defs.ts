import { CharacterDefs } from "@dragoon/defs/character.ts";
import { ExitDefs } from "@dragoon/defs/exit.ts";
import { ItemDefs } from "@dragoon/defs/item.ts";
import { RoomDefs } from "@dragoon/defs/room.ts";
import { StructureDefs } from "@dragoon/defs/structure.ts";
import { ZoneDefs } from "@dragoon/defs/zone.ts";

export const defs = {
  character: new CharacterDefs(),
  item: new ItemDefs(),
  room: new RoomDefs(),
  exit: new ExitDefs(),
  structure: new StructureDefs(),
  zone: new ZoneDefs(),
};

export async function loadDefs(path: string): Promise<void> {
  await defs.character.loadFromFolder(`${path}/character`);
  await defs.item.loadFromFolder(`${path}/item`);
  await defs.room.loadFromFolder(`${path}/room`);
  await defs.exit.loadFromFolder(`${path}/exit`);
  await defs.structure.loadFromFolder(`${path}/structure`);
  await defs.zone.loadFromFolder(`${path}/zone`);
}
