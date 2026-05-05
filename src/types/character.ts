import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type CharacterData = EntityData<"character"> & {
  id: RecordId<"character">;
  stats: Record<string, number>;
};

export class Character extends Entity<"character", CharacterData> {
  constructor(ctx: EntityContext, data: CharacterData) {
    super(ctx, data);
  }
}
