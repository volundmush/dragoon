import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/base.ts";

export type ItemData = EntityData<"item"> & {
  id: RecordId<"item">;
  name?: string;
  stats?: Record<string, number>;
};

export class Item extends Entity<"item", ItemData> {
  constructor(ctx: EntityContext, data: ItemData) {
    super(ctx, data);
  }
}
