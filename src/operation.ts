import type { Surreal, SurrealTransaction } from "@surrealdb/surrealdb";
import { DbContext } from "./db.ts";
import type { DefsContext } from "./defs.ts";
import type { EntityContext } from "./types/base.ts";

export type OperationEvent = {
  type: string;
};

export type OperationContext<TEvent extends OperationEvent = OperationEvent> =
  & EntityContext
  & {
    txn: SurrealTransaction;
    db: DbContext;
    defs: DefsContext;
    event: TEvent;
    now: Date;
  };

export type OperationHandler<
  TEvent extends OperationEvent,
  TResult = void,
> = (
  ctx: OperationContext<TEvent>,
  event: TEvent,
) => TResult | Promise<TResult>;

export type OperationTask<
  TEvent extends OperationEvent,
  TResult = void,
> = {
  event: TEvent;
  handler: OperationHandler<TEvent, TResult>;
};

export type OperationResult<TResult = void> =
  | {
    ok: true;
    result: TResult;
  }
  | {
    ok: false;
    error: unknown;
    cancelError?: unknown;
  };

export async function runOperation<
  TEvent extends OperationEvent,
  TResult = void,
>(
  surreal: Surreal,
  defs: DefsContext,
  event: TEvent,
  handler: OperationHandler<TEvent, TResult>,
): Promise<OperationResult<TResult>> {
  const txn = await surreal.beginTransaction();
  const now = new Date();
  const ctx: OperationContext<TEvent> = {
    txn,
    db: new DbContext(txn, defs, now),
    defs,
    event,
    now,
  };

  try {
    const result = await handler(ctx, event);
    await txn.commit();

    return {
      ok: true,
      result,
    };
  } catch (error) {
    try {
      await txn.cancel();
    } catch (cancelError) {
      return {
        ok: false,
        error,
        cancelError,
      };
    }

    return {
      ok: false,
      error,
    };
  }
}

export async function runOperationTask<
  TEvent extends OperationEvent,
  TResult = void,
>(
  surreal: Surreal,
  defs: DefsContext,
  task: OperationTask<TEvent, TResult>,
): Promise<OperationResult<TResult>> {
  return await runOperation(surreal, defs, task.event, task.handler);
}
