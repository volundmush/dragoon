import { RecordId } from "@surrealdb/surrealdb";
import {
  Entity,
  type EntityContext,
  type EntityData,
} from "@dragoon/types/entity.ts";

export type CharacterData = EntityData<"character"> & {
  id: RecordId<"character">;
  name: string;
  keywords?: string[];
  description?: string;
  prototype?: RecordId<"npc_prototype">;
  stats: Record<string, number>;
  cooldowns: Record<string, Date>;
  components: Record<string, object>;
  scripts: Record<string, object>;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  is_npc: boolean;
  is_active: boolean;
};

export type DerivedModifier = {
  source: string;
  value: number;
}

export type ModifierKinds = {
  base_add: DerivedModifier[];
  mult_add: DerivedModifier[];
  mult_mult: DerivedModifier[];
  eff_add: DerivedModifier[];
};

export type DerivedCache = {
  base: number;
  effective?: number;
  modifiers: ModifierKinds;
}

export class Character extends Entity<"character", CharacterData> {
  public derived_cache: Record<string, DerivedCache> = {};

  constructor(ctx: EntityContext, data: CharacterData) {
    super(ctx, data);
  }

  stat_get(stat: string): number {
    const def = this.ctx.defs.character.stats[stat];
    if (!def) {
      throw new Error(`Stat '${stat}' is not defined`);
    }
    return this.data.stats[stat] ?? def.default ?? 0;
  }

  async stat_set(stat: string, value: number): Promise<number> {
    const def = this.ctx.defs.character.stats[stat];
    if (!def) {
      throw new Error(`Stat '${stat}' is not defined`);
    }
    if (def.min !== undefined && value < def.min) {
      value = def.min;
    }
    if (def.max !== undefined && value > def.max) {
      value = def.max;
    }
    this.data.stats[stat] = value;
    // now we must persist this change to the database.
    await this.txn.update(this.data.id).merge({ stats: this.data.stats });
    return value;
  }

  async stat_mod(stat: string, delta: number): Promise<number> {
    const current = await this.stat_get(stat);
    return await this.stat_set(stat, current + delta);
  }

  async derived_base(derived: string): Promise<number> {
      const def = this.ctx.defs.character.derived[derived];
      if (!def) {
        throw new Error(`Derived stat '${derived}' is not defined`);
      }
      // If the base value is cached, return it.
      const cache = this.derived_cache[derived];
      if (cache?.base !== undefined) {
        return cache.base;
      }
      // Otherwise, compute the base value.
      let base: number;
      if (def.base) {
        base = await def.base({ character: this, base: 0 });
      } else {
        base = 0;
      }
      // Cache the base value.
      this.derived_cache[derived] = {
        base,
        modifiers: {
          base_add: [],
          mult_add: [],
          mult_mult: [],
          eff_add: [],
        },
      };
      return base;
  }

  derived_gather_modifiers(derived: string): ModifierKinds {
    const def = this.ctx.defs.character.derived[derived];
      if (!def) {
        throw new Error(`Derived stat '${derived}' is not defined`);
      }
    let modifiers: ModifierKinds = {
      base_add: [],
      mult_add: [],
      mult_mult: [],
      eff_add: [],
    };
    return modifiers;
  }

  derived_apply_modifiers(base: number, modifiers: ModifierKinds): number {
    let start = base;

    for (const mod of modifiers.base_add) {
      start += mod.value;
    }

    // our number system is using fixed-point with 3 decimals, in other words 1000 is shown as 1 to players.
    // mult_add modifiers are added together and then applied as a single multiplier.
    let mult_add_total = 0;
    for (const mod of modifiers.mult_add) {
      mult_add_total += mod.value;
    }
    

    let total = start;
    return total;
  }

  async derived_get(derived: string): Promise<number> {
    const def = this.ctx.defs.character.derived[derived];
      if (!def) {
        throw new Error(`Derived stat '${derived}' is not defined`);
      }
      // If the effective value is cached, return it.
      let cache = this.derived_cache[derived];
      if (cache?.effective !== undefined) {
        return cache.effective;
      }
      // Otherwise, compute the effective value.
      let base = await this.derived_base(derived);
      const modifiers = await this.derived_gather_modifiers(derived);

      if(cache) {
        cache.base = base;
        cache.modifiers = modifiers;
      }
      if(!cache) {
        cache = {
          base: base,
          modifiers,
        };
        this.derived_cache[derived] = cache;
      }

      const effective = def.effective
        ? await def.effective({ character: this, base })
        : this.derived_apply_modifiers(base, modifiers);

      cache.effective = effective;
      return effective;
  }
}
