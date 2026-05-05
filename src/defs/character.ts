import { DefLoader } from "@dragoon/defs/base.ts";
import { RecordId } from "@surrealdb/surrealdb";

type CharacterData = {
  id: RecordId<"character">;
  stats: Record<string, number>;
  [key: string]: unknown;
};

export class Character {
  constructor(public data: CharacterData) {}
}

export type StatDefInput = {
  id: string;
  name?: string;
  min?: number;
  max?: number;
  default?: number;
  tags?: string[];
};

export class StatDef {
  readonly id: string;
  readonly name: string;
  readonly min?: number;
  readonly max?: number;
  readonly default: number;
  readonly tags: readonly string[];

  constructor(input: StatDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.min = input.min;
    this.max = input.max;
    this.default = input.default ?? 0;
    this.tags = input.tags ?? [];
  }
}
export type DerivedContext = {
  character: Character;
  base: number;
};
export type DerivedValueFn = (
  context: DerivedContext,
) => number | Promise<number>;

export type DerivedDefInput = {
  id: string;
  name?: string;
  min?: number;
  max?: number;
  tags?: string[];
  base?: DerivedValueFn;
  effective?: DerivedValueFn;
};
export class DerivedDef {
  readonly id: string;
  readonly name: string;
  readonly min?: number;
  readonly max?: number;
  readonly tags: readonly string[];

  readonly base?: DerivedValueFn;
  readonly effective?: DerivedValueFn;

  constructor(input: DerivedDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.min = input.min;
    this.max = input.max;
    this.tags = input.tags ?? [];
    this.base = input.base;
    this.effective = input.effective;
  }
}

export type MeterDefInput = {
  id: string;
  name?: string;
  of: string;
};
export class MeterDef {
  readonly id: string;
  readonly name: string;
  readonly of: string;

  constructor(input: MeterDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.of = input.of;
  }
}

export type FormDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};

export class FormDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: FormDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export type ConditionDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};
export class ConditionDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: ConditionDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export type NatureDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};
export class NatureDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: NatureDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export type LineageDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};
export class LineageDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: LineageDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export type TraitDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};
export class TraitDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: TraitDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export type CommandContext = {
  character: Character;
};
export type CommandResult = {
  ok: boolean;
  message?: string;
};
export type CommandExecuteFn = {
  (context: CommandContext): void | Promise<void>;
};
export type CommandDefInput = {
  id: string;
  aliases: Record<string, number>;
  priority?: number;
  execute: CommandExecuteFn;
};
export class CommandDef {
  readonly id: string;
  readonly aliases: Record<string, number>;
  readonly priority: number;
  readonly execute: CommandExecuteFn;

  constructor(input: CommandDefInput) {
    this.id = input.id;
    this.aliases = input.aliases;
    this.priority = input.priority ?? 0;
    this.execute = input.execute;
  }
}

export type ScriptDefInput = {
  id: string;
  name?: string;
};
export class ScriptDef {
  readonly id: string;
  readonly name: string;

  constructor(input: ScriptDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
  }
}

export type SkillDefInput = {
  id: string;
  name?: string;
  tags?: string[];
};
export class SkillDef {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];

  constructor(input: SkillDefInput) {
    this.id = input.id;
    this.name = input.name ?? input.id;
    this.tags = input.tags ?? [];
  }
}

export class CharacterDefs extends DefLoader {
  public stats: Record<string, StatDef> = {};
  public derived: Record<string, DerivedDef> = {};
  public meters: Record<string, MeterDef> = {};
  public forms: Record<string, FormDef> = {};
  public conditions: Record<string, ConditionDef> = {};
  public natures: Record<string, NatureDef> = {};
  public lineages: Record<string, LineageDef> = {};
  public traits: Record<string, TraitDef> = {};
  public commands: Record<string, CommandDef> = {};
  public scripts: Record<string, ScriptDef> = {};
  public skills: Record<string, SkillDef> = {};

  override async loadFromFolder(path: string): Promise<void> {
    const root = path.startsWith("/") ? path : `${Deno.cwd()}/${path}`;

    await this.loadSubFolder(`${root}/stat`, StatDef, this.stats);
    await this.loadSubFolder(`${root}/derived`, DerivedDef, this.derived);
    await this.loadSubFolder(`${root}/meter`, MeterDef, this.meters);
    await this.loadSubFolder(`${root}/form`, FormDef, this.forms);
    await this.loadSubFolder(
      `${root}/condition`,
      ConditionDef,
      this.conditions,
    );
    await this.loadSubFolder(`${root}/nature`, NatureDef, this.natures);
    await this.loadSubFolder(`${root}/lineage`, LineageDef, this.lineages);
    await this.loadSubFolder(`${root}/trait`, TraitDef, this.traits);
    await this.loadSubFolder(`${root}/command`, CommandDef, this.commands);
    await this.loadSubFolder(`${root}/skill`, SkillDef, this.skills);
  }
}
