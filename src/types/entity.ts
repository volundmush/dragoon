import type { RecordId, SurrealTransaction } from "@surrealdb/surrealdb";
import type { DefsContext } from "@dragoon/defs.ts";

export type EntityContext = {
  txn: SurrealTransaction;
  defs: DefsContext;
  now: Date;
};

export type EntityData<TTable extends string> = {
  id: RecordId<TTable>;
  [key: string]: unknown;
};

export class Entity<
  TTable extends string,
  TData extends EntityData<TTable>,
> {
  constructor(
    public readonly ctx: EntityContext,
    public data: TData,
  ) {}

  get id(): RecordId<TTable> {
    return this.data.id;
  }

  protected get txn(): SurrealTransaction {
    return this.ctx.txn;
  }

  protected get defs(): DefsContext {
    return this.ctx.defs;
  }

  protected get now(): Date {
    return this.ctx.now;
  }
}
