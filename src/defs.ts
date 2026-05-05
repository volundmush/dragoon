import { CharacterDefs } from "@dragoon/defs/character.ts";
import { ExitDefs } from "@dragoon/defs/exit.ts";
import { ItemDefs } from "@dragoon/defs/item.ts";
import { RoomDefs } from "@dragoon/defs/room.ts";
import { StructureDefs } from "@dragoon/defs/structure.ts";
import { ZoneDefs } from "@dragoon/defs/zone.ts";

export class DefsContext {
  public character: CharacterDefs = new CharacterDefs();
  public item: ItemDefs = new ItemDefs();
  public room: RoomDefs = new RoomDefs();
  public exit: ExitDefs = new ExitDefs();
  public structure: StructureDefs = new StructureDefs();
  public zone: ZoneDefs = new ZoneDefs();

  constructor() {}

  async loadDefs(path: string): Promise<void> {
    await this.character.loadFromFolder(`${path}/character`);
    await this.item.loadFromFolder(`${path}/item`);
    await this.room.loadFromFolder(`${path}/room`);
    await this.exit.loadFromFolder(`${path}/exit`);
    await this.structure.loadFromFolder(`${path}/structure`);
    await this.zone.loadFromFolder(`${path}/zone`);
  }
}
