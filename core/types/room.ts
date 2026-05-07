import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type RoomData = EntityData<"room"> & {
  id: RecordId<"room">;
  name?: string;
  stats?: Record<string, number>;
};

export class Room extends Entity<"room", RoomData> {
  constructor(ctx: EntityContext, data: RoomData) {
    super(ctx, data);
  }
}
