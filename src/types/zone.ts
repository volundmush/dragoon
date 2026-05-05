import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type ZoneData = EntityData<"zone"> & {
  id: RecordId<"zone">;
  name?: string;
  stats?: Record<string, number>;
};

export class Zone extends Entity<"zone", ZoneData> {
  constructor(ctx: EntityContext, data: ZoneData) {
    super(ctx, data);
  }
}
