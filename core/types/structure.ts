import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type StructureData = EntityData<"structure"> & {
  id: RecordId<"structure">;
  name?: string;
  stats?: Record<string, number>;
};

export class Structure extends Entity<"structure", StructureData> {
  constructor(ctx: EntityContext, data: StructureData) {
    super(ctx, data);
  }
}
