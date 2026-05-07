import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type ExitData = EntityData<"exit"> & {
  id: RecordId<"exit">;
  direction?: string;
};

export class Exit extends Entity<"exit", ExitData> {
  constructor(ctx: EntityContext, data: ExitData) {
    super(ctx, data);
  }
}
