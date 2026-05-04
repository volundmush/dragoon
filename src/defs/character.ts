import { RecordId } from "@surrealdb/surrealdb";

type CharacterData = {
  id: RecordId<"character">;
  stats: Record<string, number>;
  [key: string]: unknown;
};

export class Character {
  constructor(public data: CharacterData) {}
}

type DefModule = {
  default?: unknown;
};

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

export class ScriptDef {
}

export class CharacterDefs {
  public stats: Record<string, StatDef> = {};
  public derived: Record<string, DerivedDef> = {};
  public natures: Record<string, NatureDef> = {};
  public lineages: Record<string, LineageDef> = {};
  public traits: Record<string, TraitDef> = {};
  public commands: Record<string, CommandDef> = {};
  public scripts: Record<string, ScriptDef> = {};

  constructor() {}

  async loadFromFolder(path: string): Promise<void> {
    const root = path.startsWith("/") ? path : `${Deno.cwd()}/${path}`;

    for await (const file of this.walkDefFiles(root)) {
      const relative = file.slice(root.length + 1);
      const [category] = relative.split("/");
      const input = await this.importDefault(file);

      switch (category) {
        case "stat":
          this.addDef(this.stats, new StatDef(input as StatDefInput), file);
          break;
        case "derived":
          this.addDef(
            this.derived,
            new DerivedDef(input as DerivedDefInput),
            file,
          );
          break;
        case "nature":
          this.addDef(
            this.natures,
            new NatureDef(input as NatureDefInput),
            file,
          );
          break;
        case "lineage":
          this.addDef(
            this.lineages,
            new LineageDef(input as LineageDefInput),
            file,
          );
          break;
        case "trait":
          this.addDef(this.traits, new TraitDef(input as TraitDefInput), file);
          break;
        case "command":
          this.addDef(
            this.commands,
            new CommandDef(input as CommandDefInput),
            file,
          );
          break;
        case "script":
          throw new Error(`Script defs are not implemented yet: ${file}`);
        default:
          throw new Error(
            `Unknown character def category '${category}' in ${file}`,
          );
      }
    }
  }

  private async *walkDefFiles(path: string): AsyncGenerator<string> {
    for await (const entry of Deno.readDir(path)) {
      if (entry.name.startsWith("_")) {
        continue;
      }

      const child = `${path}/${entry.name}`;

      if (entry.isDirectory) {
        yield* this.walkDefFiles(child);
        continue;
      }

      if (
        entry.isFile &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
      ) {
        yield child;
      }
    }
  }

  private async importDefault(path: string): Promise<unknown> {
    const module = await import(`file://${path}`) as DefModule;

    if (module.default === undefined) {
      throw new Error(`Def file must export default: ${path}`);
    }

    return module.default;
  }

  private addDef<TDef extends { id: string }>(
    registry: Record<string, TDef>,
    def: TDef,
    path: string,
  ): void {
    if (!def.id) {
      throw new Error(`Def is missing required id: ${path}`);
    }

    if (registry[def.id]) {
      throw new Error(`Duplicate character def id '${def.id}' from ${path}`);
    }

    registry[def.id] = def;
  }
}
